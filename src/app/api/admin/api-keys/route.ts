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

    // Validate input
    // const validation = validateApiKey({ owner, rateLimit });
    // if (!validation.isValid) {
    //   return NextResponse.json({ error: validation.error }, { status: 400 });
    // }

    const newKey = createApiKey(
      `${API_KEY_CONSTANTS.KEY_PREFIX}${uuidv4()}`,
      owner,
      rateLimit || API_KEY_CONSTANTS.DEFAULT_RATE_LIMIT
    );

    const apiKeysCollection = await getApiKeysCollection();

    // Find and delete existing keys for the same owner
    await apiKeysCollection.deleteMany({ owner });

    // Insert the new key
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

export async function GET(request: NextRequest) {
  try {
    // Extract owner from query parameters
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");

    if (!owner) {
      return NextResponse.json(
        { error: "Owner parameter is required" },
        { status: 400 }
      );
    }

    const apiKeysCollection = await getApiKeysCollection();

    // Find the API key for the given owner
    const apiKey = await apiKeysCollection.findOne({ owner });

    if (!apiKey) {
      return NextResponse.json(
        { error: "No API key found for the given owner" },
        { status: 404 }
      );
    }

    // // Remove sensitive information before returning
    // const { key, ...safeApiKeyData } = apiKey;
    const { ...safeApiKeyData } = apiKey;

    return NextResponse.json(safeApiKeyData, { status: 200 });
  } catch (error) {
    console.error("API key fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
