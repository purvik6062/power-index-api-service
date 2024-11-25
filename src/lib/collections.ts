import { Collection, Db } from "mongodb";
import connectDB from "./db";
import { ApiKey, API_KEY_INDEXES } from "@/models/ApiKey";

let apiKeysCollection: Collection<ApiKey> | null = null;

export async function getApiKeysCollection(): Promise<Collection<ApiKey>> {
  if (apiKeysCollection) {
    return apiKeysCollection;
  }

  const { db } = await connectDB();
  apiKeysCollection = db.collection<ApiKey>("apiKeys");

  // Ensure indexes are created
  await createApiKeyIndexes(db);

  return apiKeysCollection;
}

async function createApiKeyIndexes(db: Db): Promise<void> {
  const collection = db.collection<ApiKey>("apiKeys");

  // Create all required indexes
  await Promise.all(
    API_KEY_INDEXES.map((index: any) =>
      collection.createIndex(index.key, {
        unique: index.unique,
        background: true,
      })
    )
  );
}
