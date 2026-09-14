/**
 * Learner-scoped study-plan repository. Server-only: every function takes the
 * server-resolved `learnerId` (see `src/db/learner.ts`) and uses the `select`
 * builder API so table and column references stay type-checked.
 */

import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  type NewStudyPlan,
  type StudyPlanRow,
  type StudyPlanStepPayload,
  studyPlans,
} from "@/db/schema";

export interface CreateStudyPlanInput {
  topic: string;
  goal: string;
  availableMinutes: number;
  totalMinutes: number;
  steps: StudyPlanStepPayload[];
}

/** Newest first, so the active topic is the latest plan. */
export async function listStudyPlansForLearner(
  learnerId: string,
): Promise<StudyPlanRow[]> {
  const db = getDb();
  return db
    .select()
    .from(studyPlans)
    .where(eq(studyPlans.learnerId, learnerId))
    .orderBy(desc(studyPlans.createdAt));
}

export async function createStudyPlanForLearner(
  learnerId: string,
  input: CreateStudyPlanInput,
): Promise<StudyPlanRow> {
  const db = getDb();
  const values: NewStudyPlan = {
    learnerId,
    topic: input.topic,
    goal: input.goal,
    availableMinutes: input.availableMinutes,
    totalMinutes: input.totalMinutes,
    steps: input.steps,
  };
  const [row] = await db.insert(studyPlans).values(values).returning();
  if (row === undefined) {
    throw new Error("Failed to save the study plan.");
  }
  return row;
}

export async function deleteStudyPlansForLearner(
  learnerId: string,
): Promise<void> {
  const db = getDb();
  await db.delete(studyPlans).where(eq(studyPlans.learnerId, learnerId));
}

/** Deletes one plan only when it belongs to the learner. */
export async function deleteStudyPlanForLearner(
  learnerId: string,
  planId: string,
): Promise<void> {
  const db = getDb();
  await db
    .delete(studyPlans)
    .where(and(eq(studyPlans.id, planId), eq(studyPlans.learnerId, learnerId)));
}
