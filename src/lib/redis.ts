import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL!;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN!;

if (!redisUrl || !redisToken) {
  throw new Error(
    "Redis credentials are not provided in environment variables"
  );
}

const redisClient = new Redis({
  url: redisUrl,
  token: redisToken,
});

// Function to check connection status
export const checkConnection = async (): Promise<boolean> => {
  try {
    await redisClient.ping();
    console.log("Successfully connected to Redis");
    return true;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    return false;
  }
};

// Perform initial connection check
checkConnection().catch(console.error);

export default redisClient;
