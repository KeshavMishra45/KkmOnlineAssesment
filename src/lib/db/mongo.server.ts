// MongoDB Atlas connection helper.
//
// Setup:
// 1. Create a MongoDB Atlas cluster.
// 2. Create a database user.
// 3. Allow your IP in Network Access.
// 4. Copy the Node.js driver connection string.
// 5. Add the connection string to your local .env file.
//
// This module is server-only because of the .server.ts suffix.
// Never import it into client-side code.

import {
  MongoClient,
  type Collection,
  type Db,
  type Document,
} from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "kkm_classroom";

function buildClientPromise(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error(
      "MongoDB configuration is missing. Set MONGODB_URI in your .env file.",
    );
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  return client
  .connect()
  .then((connectedClient) => {
    console.log("✅ MongoDB connected successfully!");
    return connectedClient;
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  });
}

// Vite/HMR and the TanStack Start development server can reload this
// module multiple times. Reuse the same connection promise during
// development to avoid creating unnecessary MongoDB connections.

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
  const collection = db.collection<T>(name);

  if (name === COLLECTIONS.users) {
    // Belt-and-braces: guarantee the uniqueness constraint that both
    // sign-up and the (optional) seed script rely on, even on a fresh
    // database that has never run scripts/seed-users.mjs.
    await ensureUsersIndex(collection as unknown as Collection<Document>);
  }

  return collection;
}

let usersIndexEnsured = false;
async function ensureUsersIndex(collection: Collection<Document>): Promise<void> {
  if (usersIndexEnsured) return;
  await collection.createIndex({ regNo: 1, role: 1 }, { unique: true });
  usersIndexEnsured = true;
}

// Centralized collection names prevent spelling mistakes
// and keep database naming consistent across the application.

export const COLLECTIONS = {
  users: "users",
} as const;