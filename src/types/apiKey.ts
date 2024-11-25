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

