import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

import { getCollection, COLLECTIONS } from "@/lib/db/mongo.server";
import { hashPassword, verifyPassword } from "@/lib/auth/password.server";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session.server";

export type Role = "teacher" | "student";

export type SessionUser = {
  role: Role;
  regNo: string;
  name?: string;
};

type UserDoc = {
  _id: unknown;
  regNo: string;
  role: Role;
  name?: string;
  passwordHash: string;
};

type LoginInput = { role: Role; regNo: string; dob: string };

function validateLoginInput(data: unknown): LoginInput {
  const input = data as Partial<LoginInput> | null;
  const role = input?.role;
  const regNo = input?.regNo;
  const dob = input?.dob;

  if (role !== "teacher" && role !== "student") {
    throw new Error("Choose whether you're logging in as a student or teacher.");
  }
  if (!regNo || typeof regNo !== "string" || !regNo.trim()) {
    throw new Error("Enter your registration number.");
  }
  if (!dob || typeof dob !== "string" || !/^\d{8}$/.test(dob)) {
    throw new Error("Date of birth must be 8 digits in DDMMYYYY format.");
  }

  return { role, regNo: regNo.trim().toUpperCase(), dob };
}

type SignupInput = { role: Role; regNo: string; dob: string; name: string };

function validateSignupInput(data: unknown): SignupInput {
  const input = data as Partial<SignupInput> | null;
  const role = input?.role;
  const regNo = input?.regNo;
  const dob = input?.dob;
  const name = input?.name;

  if (role !== "teacher" && role !== "student") {
    throw new Error("Choose whether you're signing up as a student or teacher.");
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Enter your full name.");
  }
  if (!regNo || typeof regNo !== "string" || !regNo.trim()) {
    throw new Error("Enter a registration number.");
  }
  if (!dob || typeof dob !== "string" || !/^\d{8}$/.test(dob)) {
    throw new Error("Date of birth must be 8 digits in DDMMYYYY format.");
  }

  return { role, regNo: regNo.trim().toUpperCase(), dob, name: name.trim() };
}

// POST /signup — creates a new user (teacher or student) in the `users`
// collection. regNo + role must be unique (enforced by a unique index —
// see scripts/seed-users.mjs). DOB doubles as the password, matching login.
export const signup = createServerFn({ method: "POST" })
  .inputValidator(validateSignupInput)
  .handler(async ({ data }) => {
    const users = await getCollection<UserDoc>(COLLECTIONS.users);

    const existing = await users.findOne({ regNo: data.regNo, role: data.role });
    if (existing) {
      return {
        ok: false as const,
        error: "An account with this registration number and role already exists.",
      };
    }

    const passwordHash = hashPassword(data.dob);
    const result = await users.insertOne({
      regNo: data.regNo,
      role: data.role,
      name: data.name,
      passwordHash,
    } as UserDoc);

    const token = createSessionToken({
      uid: String(result.insertedId),
      role: data.role,
      regNo: data.regNo,
      name: data.name,
    });

    setCookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return {
      ok: true as const,
      user: { role: data.role, regNo: data.regNo, name: data.name } satisfies SessionUser,
    };
  });

// POST /login — verifies regNo + role + dob (password) against the `users`
// collection in MongoDB Atlas, then sets an httpOnly, signed session cookie.
export const login = createServerFn({ method: "POST" })
  .inputValidator(validateLoginInput)
  .handler(async ({ data }) => {
    const users = await getCollection<UserDoc>(COLLECTIONS.users);
    const user = await users.findOne({ regNo: data.regNo, role: data.role });

    if (!user || !verifyPassword(data.dob, user.passwordHash)) {
      return { ok: false as const, error: "Invalid registration number, role or date of birth." };
    }

    const token = createSessionToken({
      uid: String(user._id),
      role: user.role,
      regNo: user.regNo,
      name: user.name,
    });

    setCookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return {
      ok: true as const,
      user: { role: user.role, regNo: user.regNo, name: user.name } satisfies SessionUser,
    };
  });

// POST /logout — clears the session cookie.
export const logout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(SESSION_COOKIE_NAME, { path: "/" });
  return { ok: true as const };
});

// GET /session — reads + verifies the session cookie. Used by route guards
// (beforeLoad) and by the header to decide what nav links to show.
export const getCurrentUser = createServerFn({ method: "GET" }).handler(async (): Promise<SessionUser | null> => {
  const token = getCookie(SESSION_COOKIE_NAME);
  const session = verifySessionToken(token);
  if (!session) return null;
  return { role: session.role, regNo: session.regNo, name: session.name };
});
