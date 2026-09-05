// Seeds one teacher and one student account into MongoDB Atlas so you have
// something to log in with. Run with:
//
//   node scripts/seed-users.mjs
//
// Reads MONGODB_URI / MONGODB_DB from your .env file (via --env-file, Node
// 20.6+). On older Node, `export $(cat .env | xargs)` first or pass the
// vars inline.
//
// Change the regNo/dob/name values below (or add more users) before running.

import { MongoClient } from "mongodb";
import { randomBytes, scryptSync } from "node:crypto";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "kkm_classroom";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env first.");
  process.exit(1);
}

function hashPassword(plainText) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plainText, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

// regNo + dob (DDMMYYYY) is what the login form asks for.
const USERS_TO_SEED = [
  { role: "teacher", regNo: "KKM-TEACHER-01", dob: "01011990", name: "Demo Teacher" },
  { role: "student", regNo: "KKM2026001", dob: "05041999", name: "Demo Student" },
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const users = db.collection("users");

  await users.createIndex({ regNo: 1, role: 1 }, { unique: true });

  for (const u of USERS_TO_SEED) {
    const passwordHash = hashPassword(u.dob);
    await users.updateOne(
      { regNo: u.regNo, role: u.role },
      { $set: { regNo: u.regNo, role: u.role, name: u.name, passwordHash } },
      { upsert: true },
    );
    console.log(`Upserted ${u.role}: ${u.regNo} (dob ${u.dob})`);
  }

  await client.close();
  console.log("Done. You can now log in with the accounts above.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
