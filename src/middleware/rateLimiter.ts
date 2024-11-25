import { NextRequest, NextResponse } from "next/server";
import redisClient from "@/lib/redis";
import { ApiKey } from "@/models/ApiKey";

interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: number;
}

export class RateLimitError extends Error {
  constructor(public readonly info: RateLimitInfo) {
    super("Rate limit exceeded");
    this.name = "RateLimitError";
  }
}

// Lua script for rate limiting
const rateLimitScript = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])

local current = redis.call("INCR", key)
if current == 1 then
    redis.call("EXPIRE", key, window)
end

local ttl = redis.call("TTL", key)

if current > limit then
    return {current, 0, ttl}
else
    return {current, limit - current, ttl}
end
`;

export async function rateLimiter(
  request: NextRequest,
  apiKey: ApiKey
): Promise<NextResponse | null> {
  const rateLimitKey = `rate-limit:${apiKey.key}`;
  const windowSeconds = 60; // 1-minute window
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const windowExpiry = currentTimestamp + windowSeconds;

  try {
    const [count, remaining, ttl] = (await redisClient.eval(
      rateLimitScript,
      [rateLimitKey],
      [apiKey.rateLimit.toString(), windowSeconds.toString()]
    )) as [number, number, number];

    console.log(`🔍 Rate Limit Debug:
      API Key: ${apiKey.key}
      Owner: ${apiKey.owner}
      Rate Limit: ${apiKey.rateLimit}
      Current Count: ${count}
      Remaining: ${remaining}
      TTL: ${ttl}
      Window Expiry: ${new Date(windowExpiry * 1000).toISOString()}
    `);

    // Prepare rate limit headers
    const headers = new Headers({
      "X-RateLimit-Limit": apiKey.rateLimit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": (currentTimestamp + ttl).toString(),
    });

    // Check if rate limit exceeded
    if (count > apiKey.rateLimit) {
      const rateLimitInfo: RateLimitInfo = {
        remaining: 0,
        limit: apiKey.rateLimit,
        reset: currentTimestamp + ttl,
      };

      console.warn(`⚠️ RATE LIMIT EXCEEDED:
        API Key: ${apiKey.key}
        Owner: ${apiKey.owner}
        Current Count: ${count}
        Limit: ${apiKey.rateLimit}
      `);

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You have exceeded the rate limit of ${apiKey.rateLimit} requests per minute`,
          ...rateLimitInfo,
        },
        {
          status: 429, // Too Many Requests
          headers: {
            ...Object.fromEntries(headers.entries()),
            "Retry-After": ttl.toString(),
          },
        }
      );
    }

    // Add rate limit headers to the request for downstream use
    request.headers.set("X-RateLimit-Limit", headers.get("X-RateLimit-Limit")!);
    request.headers.set(
      "X-RateLimit-Remaining",
      headers.get("X-RateLimit-Remaining")!
    );
    request.headers.set("X-RateLimit-Reset", headers.get("X-RateLimit-Reset")!);

    return null;
  } catch (error) {
    console.error("🚨 Rate Limiting Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      apiKey: apiKey.key,
      owner: apiKey.owner,
    });

    // Fail open strategy in production
    if (process.env.NODE_ENV === "production") {
      return null;
    }

    return NextResponse.json(
      {
        error: "Rate limiting service unavailable",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function getRateLimitStatus(
  apiKey: ApiKey
): Promise<RateLimitInfo> {
  const rateLimitKey = `rate-limit:${apiKey.key}`;
  const currentTimestamp = Math.floor(Date.now() / 1000);

  try {
    const [count, ttl] = (await redisClient
      .pipeline()
      .get(rateLimitKey)
      .ttl(rateLimitKey)
      .exec()) as [string | null, number];

    const currentCount = count ? parseInt(count) : 0;
    const reset = currentTimestamp + (ttl > 0 ? ttl : 60);

    return {
      remaining: Math.max(0, apiKey.rateLimit - currentCount),
      limit: apiKey.rateLimit,
      reset,
    };
  } catch (error) {
    console.error("Error getting rate limit status:", error);
    // Return default values on error
    return {
      remaining: apiKey.rateLimit,
      limit: apiKey.rateLimit,
      reset: currentTimestamp + 60,
    };
  }
}
