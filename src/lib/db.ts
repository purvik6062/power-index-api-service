import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const MONGODB_URI = process.env.MONGODB_URI;

interface GlobalMongo {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

// Global type declaration
declare global {
  var mongodb: GlobalMongo | undefined;
}

let cached = global.mongodb;

if (!cached) {
  cached = global.mongodb = { client: null, promise: null };
}

async function connectDB(): Promise<{ client: MongoClient; db: Db }> {
  if (cached?.client) {
    return {
      client: cached.client,
      db: cached.client.db(),
    };
  }

  if (!cached?.promise) {
    cached!.promise = MongoClient.connect(MONGODB_URI)
      .then((client) => {
        console.log("Connected to MongoDB");
        return client;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        throw error;
      });
  }

  try {
    cached!.client = await cached!.promise;
    return {
      client: cached!.client,
      db: cached!.client.db(),
    };
  } catch (e) {
    cached!.promise = null;
    throw e;
  }
}

export default connectDB;
