import { ObjectId } from "mongodb";

export interface ApiKey {
  _id?: ObjectId;
  key: string;
  owner: string;
  rateLimit: number;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

// Validation functions for API Key data
export function validateApiKey(data: Partial<ApiKey>): {
  isValid: boolean;
  error?: string;
} {
  if (!data.key) {
    return { isValid: false, error: "API key is required" };
  }

  if (!data.owner) {
    return { isValid: false, error: "Owner is required" };
  }

  if (
    data.rateLimit !== undefined &&
    (data.rateLimit < 1 || !Number.isInteger(data.rateLimit))
  ) {
    return { isValid: false, error: "Rate limit must be a positive integer" };
  }

  return { isValid: true };
}

// Type guard to check if a value is an ApiKey
export function isApiKey(value: unknown): value is ApiKey {
  if (!value || typeof value !== "object") {
    return false;
  }

  const key = value as ApiKey;
  return (
    typeof key.key === "string" &&
    typeof key.owner === "string" &&
    typeof key.rateLimit === "number" &&
    typeof key.isActive === "boolean" &&
    key.createdAt instanceof Date &&
    (key.lastUsed === undefined || key.lastUsed instanceof Date)
  );
}

// Factory function to create new API Key objects
export function createApiKey(
  key: string,
  owner: string,
  rateLimit: number = 60
): ApiKey {
  return {
    key,
    owner,
    rateLimit,
    isActive: true,
    createdAt: new Date(),
  };
}

// Constants for API Key configuration
export const API_KEY_CONSTANTS = {
  DEFAULT_RATE_LIMIT: 5,
  MIN_RATE_LIMIT: 1,
  MAX_RATE_LIMIT: 1000,
  KEY_PREFIX: "ak_",
} as const;

// Types for API Key operations
export type ApiKeyCreateInput = Omit<
  ApiKey,
  "createdAt" | "lastUsed" | "_id" | "isActive"
>;
export type ApiKeyUpdateInput = Partial<
  Omit<ApiKey, "_id" | "key" | "createdAt">
>;

// Database indexes configuration
export const API_KEY_INDEXES = [
  { key: { key: 1 }, unique: true },
  { key: { owner: 1 }, unique: false },
  { key: { isActive: 1 }, unique: false },
  { key: { createdAt: -1 }, unique: false },
];
