import { NextRequest, NextResponse } from "next/server";
import { apiKeyMiddleware } from "@/middleware/apiKeymiddleware";
import redisClient from "@/lib/redis";
import { ApiKey } from "@/types/apiKey";

export async function GET(request: NextRequest) {
  const keyData = await apiKeyMiddleware(request);

  // If middleware returned a response, it means there was an error
  if (keyData instanceof NextResponse) {
    return keyData;
  }

  const apiKey = keyData as ApiKey;

  try {
    const rateLimitKey = `rate-limit:${apiKey.key}`;
    const currentUsage: any = await redisClient.get(rateLimitKey);
    const ttl = await redisClient.ttl(rateLimitKey);

    return NextResponse.json({
      owner: apiKey.owner,
      rateLimit: apiKey.rateLimit,
      currentUsage: parseInt(currentUsage || "0"),
      resetIn: ttl,
    });
  } catch (error) {
    console.error("Usage statistics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
