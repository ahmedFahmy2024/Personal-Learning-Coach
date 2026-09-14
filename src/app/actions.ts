/**
 * Server Actions for Milestone 1 persistence.
 *
 * Every action resolves ownership from the server-set learner cookie
 * (`src/db/learner.ts`). No action accepts a learner ID from the client, and
 * no return value contains a connection string or credential.
 */

"use server";

import { revalidatePath } from "next/cache";
import { DatabaseNotConfiguredError } from "@/db/client";
import { getOrCreateLearnerId } from "@/db/learner";
import { deleteQuizAttemptsForLearner } from "@/db/quiz-attempts";
import type { StudyPlanStepPayload } from "@/db/schema";
import {
  createStudyPlanForLearner,
  deleteStudyPlansForLearner,
} from "@/db/study-plans";

const TOPIC_MAX_LENGTH = 200;
const GOAL_MAX_LENGTH = 500;
const MIN_MINUTES = 1;
const MAX_MINUTES = 1440;

export interface CreateStudyPlanState {
  ok: boolean;
  message: string;
  errors: {
    topic?: string;
    goal?: string;
    availableMinutes?: string;
  };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof DatabaseNotConfiguredError) {
    return "Saving needs a database. Set DATABASE_URL in .env.local, run the migration, and try again.";
  }
  return "Something went wrong while saving. Check your connection and try again.";
}

/**
 * Splits the learner's available minutes into three deterministic starter
 * steps. Milestone 2 replaces these with agent-proposed steps; until then the
 * plan is an honest, reproducible split of what the learner entered.
 */
function buildStarterSteps(
  topic: string,
  goal: string,
  totalMinutes: number,
): StudyPlanStepPayload[] {
  const first = Math.max(5, Math.round(totalMinutes * 0.25));
  const second = Math.max(5, Math.round(totalMinutes * 0.35));
  const third = Math.max(5, totalMinutes - first - second);
  return [
    {
      title: `Warm up on ${topic}`,
      detail:
        "Revisit one reference on the topic and list what you already know.",
      estimatedMinutes: first,
    },
    {
      title: "Practise toward your goal",
      detail: `Work in short focused blocks on: ${goal}`,
      estimatedMinutes: second,
    },
    {
      title: "Check yourself",
      detail:
        "Summarise the topic in your own words and note one thing to review next.",
      estimatedMinutes: third,
    },
  ];
}

function parseMinutes(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  return Number.parseInt(trimmed, 10);
}

export async function createStudyPlanAction(
  _prevState: CreateStudyPlanState,
  formData: FormData,
): Promise<CreateStudyPlanState> {
  const topic = (formData.get("topic") ?? "").toString().trim();
  const goal = (formData.get("goal") ?? "").toString().trim();
  const availableMinutes = parseMinutes(formData.get("availableMinutes"));

  const errors: CreateStudyPlanState["errors"] = {};
  if (topic.length === 0) {
    errors.topic = "Enter a topic.";
  } else if (topic.length > TOPIC_MAX_LENGTH) {
    errors.topic = `Keep the topic under ${TOPIC_MAX_LENGTH} characters.`;
  }
  if (goal.length === 0) {
    errors.goal = "Enter a goal.";
  } else if (goal.length > GOAL_MAX_LENGTH) {
    errors.goal = `Keep the goal under ${GOAL_MAX_LENGTH} characters.`;
  }
  if (availableMinutes === null) {
    errors.availableMinutes = "Enter whole minutes.";
  } else if (availableMinutes < MIN_MINUTES || availableMinutes > MAX_MINUTES) {
    errors.availableMinutes = `Enter between ${MIN_MINUTES} and ${MAX_MINUTES} minutes.`;
  }

  if (
    errors.topic !== undefined ||
    errors.goal !== undefined ||
    errors.availableMinutes !== undefined ||
    availableMinutes === null
  ) {
    return {
      ok: false,
      message: "Fix the highlighted fields and try again.",
      errors,
    };
  }

  try {
    const learnerId = await getOrCreateLearnerId();
    await createStudyPlanForLearner(learnerId, {
      topic,
      goal,
      availableMinutes,
      totalMinutes: availableMinutes,
      steps: buildStarterSteps(topic, goal, availableMinutes),
    });
  } catch (error) {
    return { ok: false, message: toErrorMessage(error), errors: {} };
  }

  revalidatePath("/");
  return { ok: true, message: "Study plan saved.", errors: {} };
}

export interface ResetProfileState {
  ok: boolean;
  message: string;
}

/**
 * Deletes the current browser profile's study plans and quiz attempts from
 * the database. The anonymous learner record is kept (recreated when absent)
 * so the profile continues to work after the reset.
 */
export async function resetProfileAction(): Promise<ResetProfileState> {
  try {
    const learnerId = await getOrCreateLearnerId();
    await deleteQuizAttemptsForLearner(learnerId);
    await deleteStudyPlansForLearner(learnerId);
  } catch (error) {
    return { ok: false, message: toErrorMessage(error) };
  }

  revalidatePath("/");
  return { ok: true, message: "Saved data cleared." };
}

/**
 * Creates the anonymous learner profile (cookie plus `learners` row) when the
 * browser does not have one yet. Called once on first visit so the profile
 * exists before the learner submits anything.
 */
export async function ensureLearnerAction(): Promise<ResetProfileState> {
  try {
    await getOrCreateLearnerId();
  } catch (error) {
    return { ok: false, message: toErrorMessage(error) };
  }

  revalidatePath("/");
  return { ok: true, message: "Profile ready." };
}
