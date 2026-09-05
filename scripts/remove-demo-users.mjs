// Deletes the demo accounts that scripts/seed-users.mjs previously inserted
// (Demo Teacher / Demo Student), now that real sign-up exists. Run with:
//
//   node scripts/remove-demo-users.mjs
//
// Reads MONGODB_URI / MONGODB_DB from your .env file (via --env-file, Node
// 20.6+). On older Node, `export $(cat .env | xargs)` first or pass the
// vars inline.

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "kkm_classroom";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env first.");
  process.exit(1);
}

// The exact demo accounts seed-users.mjs inserts by default.
const DEMO_USERS = [
  { role: "teacher", regNo: "KKM-TEACHER-01" },
  { role: "student", regNo: "KKM2026001" },
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const users = db.collection("users");

  const result = await users.deleteMany({ $or: DEMO_USERS });
  console.log(`Deleted ${result.deletedCount} demo account(s).`);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
