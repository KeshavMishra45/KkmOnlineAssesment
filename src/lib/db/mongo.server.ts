// MongoDB Atlas connection template.
//
// Setup:
//   1. Create a free cluster at https://cloud.mongodb.com
//   2. Database Access -> add a database user (username/password)
//   3. Network Access -> allow your IP (or 0.0.0.0/0 for quick testing)
//   4. Database -> Connect -> Drivers -> copy the connection string
//   5. Copy .env.example to .env and set MONGODB_URI / MONGODB_DB
//
// This file is server-only (the `.server.ts` suffix keeps it out of the
// client bundle). Import it only from other `.server.ts` files or from
// createServerFn handlers.

import { MongoClient, type Db, type Collection, type Document } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "kkm_classroom";

function buildClientPromise(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env and add your MongoDB Atlas connection string.",
    );
  }
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
  });
  return client.connect();
}

// Vite/HMR (and the TanStack Start dev server) can re-evaluate this module
// on every file change. Cache the connection promise on `globalThis` so
// dev reloads reuse the same pool instead of leaking new connections.
const globalForMongo = globalThis as unknown as {
  __kkmMongoClientPromise?: Promise<MongoClient>;
};

function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "production") {
    return buildClientPromise();
  }
  if (!globalForMongo.__kkmMongoClientPromise) {
    globalForMongo.__kkmMongoClientPromise = buildClientPromise();
  }
  return globalForMongo.__kkmMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(MONGODB_DB);
}

export async function getCollection<T extends Document = Document>(
  name: string,
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

// Collection name constants so the string only lives in one place.
export const COLLECTIONS = {
  users: "users",
} as const;
