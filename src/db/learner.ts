/**
 * Anonymous learner identity. Server-only: the ID is generated here, stored in
 * a secure HTTP-only same-site cookie, and used to scope every repository
 * call. Client components, URL parameters, form values, and request bodies are
 * never trusted for a learner ID — callers pass nothing and receive the
 * server-resolved ID.
 */

import "server-only";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "@/db/client";
import { learners } from "@/db/schema";

export const LEARNER_COOKIE_NAME = "lc_learner_id";

/** Two years: the profile is a device-local bookmark, not a session. */
const LEARNER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 730;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidLearnerId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function learnerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: LEARNER_COOKIE_MAX_AGE_SECONDS,
  };
}

/**
 * Returns the current browser profile's learner ID, creating both the cookie
 * and the matching `learners` row on first use. A malformed cookie is replaced
 * rather than trusted. Must be called from a Server Action or Route Handler —
 * setting the cookie during Server Component rendering is not supported.
 */
export async function getOrCreateLearnerId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(LEARNER_COOKIE_NAME)?.value;
  if (existing !== undefined && isValidLearnerId(existing)) {
    await ensureLearnerRow(existing);
    return existing;
  }

  const learnerId = randomUUID();
  await ensureLearnerRow(learnerId);
  cookieStore.set(LEARNER_COOKIE_NAME, learnerId, learnerCookieOptions());
  return learnerId;
}

/**
 * Reads the learner ID without creating one, for Server Component renders
 * (which cannot set cookies). Returns `null` when no valid cookie is present.
 */
export async function readLearnerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(LEARNER_COOKIE_NAME)?.value;
  if (existing === undefined || !isValidLearnerId(existing)) {
    return null;
  }
  return existing;
}

/** Creates the `learners` row when absent so every cookie has a matching record. */
export async function ensureLearnerRow(learnerId: string): Promise<void> {
  const db = getDb();
  await db.insert(learners).values({ id: learnerId }).onConflictDoNothing();
}
