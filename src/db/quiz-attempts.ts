/**
 * Learner-scoped quiz-attempt repository. Server-only.
 *
 * Milestone 1 reads and clears attempts (the reset action deletes them); quiz
 * creation and scoring arrive with Milestones 2–3, which reuse these columns
 * without a migration.
 */

import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { type QuizAttemptRow, quizAttempts } from "@/db/schema";

/** Newest first, so the latest result is the one the UI shows. */
export async function listQuizAttemptsForLearner(
  learnerId: string,
): Promise<QuizAttemptRow[]> {
  const db = getDb();
  return db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.learnerId, learnerId))
    .orderBy(desc(quizAttempts.submittedAt));
}

export async function deleteQuizAttemptsForLearner(
  learnerId: string,
): Promise<void> {
  const db = getDb();
  await db.delete(quizAttempts).where(eq(quizAttempts.learnerId, learnerId));
}
