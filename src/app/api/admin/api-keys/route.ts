import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getApiKeysCollection } from "@/lib/collections";
import {
  ApiKey,
  createApiKey,
  validateApiKey,
  API_KEY_CONSTANTS,
} from "@/models/ApiKey";

export async function POST(request: NextRequest) {
  try {
    const { owner, rateLimit } = await request.json();

    const newKey = createApiKey(
      `${API_KEY_CONSTANTS.KEY_PREFIX}${uuidv4()}`,
      owner,
      rateLimit || API_KEY_CONSTANTS.DEFAULT_RATE_LIMIT
    );

    const validation = validateApiKey(newKey);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const apiKeysCollection = await getApiKeysCollection();
    await apiKeysCollection.insertOne(newKey);

    return NextResponse.json(newKey, { status: 201 });
  } catch (error) {
    console.error("API key creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
