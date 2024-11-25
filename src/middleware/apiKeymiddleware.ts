import { NextRequest, NextResponse } from "next/server";
import { getApiKeysCollection } from "@/lib/collections";
import { rateLimiter } from "./rateLimiter";
import { ApiKey } from "@/types/apiKey";

export async function apiKeyMiddleware(request: NextRequest) {
  // Extract API key from headers
  const apiKeyHeader = request.headers.get("x-api-key");

  if (!apiKeyHeader) {
    return NextResponse.json({ error: "API key is required" }, { status: 401 });
  }

  // Verify API key
  const apiKeysCollection = await getApiKeysCollection();
  const keyData = await apiKeysCollection.findOne({
    key: apiKeyHeader,
    isActive: true,
  });

  if (!keyData) {
    return NextResponse.json(
      { error: "Invalid or inactive API key" },
      { status: 403 }
    );
  }

  // Update last used timestamp
  await apiKeysCollection.updateOne(
    { key: apiKeyHeader },
    { $set: { lastUsed: new Date() } }
  );

  // Apply rate limiting
  const rateLimitResponse = await rateLimiter(request, keyData);
  if (rateLimitResponse instanceof NextResponse) {
    return rateLimitResponse;
  }

  return keyData;
}
