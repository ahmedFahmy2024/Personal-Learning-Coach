/**
 * Drizzle schema for the Learning Coach MVP (Milestone 1).
 *
 * Tables follow `docs/architecture.md`: an anonymous `learners` row owns
 * `study_plans` and `quiz_attempts` rows. Every learner-scoped query filters
 * by `learner_id`, so each child table carries an index on it.
 *
 * Conventions follow `.agents/skills/drizzle`: surrogate UUID primary keys,
 * snake_case columns, `onDelete: "cascade"` foreign keys, no database enums,
 * and concrete interfaces (never `Record<string, unknown>`) for JSONB columns.
 */

import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/** One deterministic step inside a stored study plan. */
export interface StudyPlanStepPayload {
  title: string;
  detail: string;
  estimatedMinutes: number;
}

/** One raw submitted answer inside a stored quiz attempt. */
export interface QuizAnswerPayload {
  questionId: string;
  choiceId: string;
}

/** One graded outcome inside a stored quiz attempt. */
export interface QuizOutcomePayload {
  questionId: string;
  choiceId: string | null;
  isCorrect: boolean;
}

function timestamps() {
  return {
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  };
}

/**
 * One anonymous browser profile. The row is created on first use; the matching
 * ID lives in a server-set HTTP-only cookie, never in client-submitted data.
 */
export const learners = pgTable("learners", {
  id: uuid("id").defaultRandom().primaryKey(),
  ...timestamps(),
});

/**
 * A study plan created by the learner through the plan form. Steps are stored
 * as JSONB because they are always read and written with their parent plan;
 * Milestone 2 lets the tutoring agent propose richer plans through the same
 * columns.
 */
export const studyPlans = pgTable(
  "study_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    learnerId: uuid("learner_id")
      .references(() => learners.id, { onDelete: "cascade" })
      .notNull(),
    topic: text("topic").notNull(),
    goal: text("goal").notNull(),
    /** Minutes per day the learner said they have, as entered in the form. */
    availableMinutes: integer("available_minutes").notNull(),
    /** Authored estimate for the whole plan. Displayed as-is, never re-derived. */
    totalMinutes: integer("total_minutes").notNull(),
    steps: jsonb("steps").$type<StudyPlanStepPayload[]>().notNull().default([]),
    ...timestamps(),
  },
  (t) => [index("study_plans_learner_id_idx").on(t.learnerId)],
);

/**
 * A submitted quiz attempt. Milestone 1 only writes rows once quizzes exist;
 * the columns already mirror the deterministic score tool's result shape so
 * Milestone 3 needs no migration: raw answers, graded outcomes, counts, and
 * one concrete next action.
 */
export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    learnerId: uuid("learner_id")
      .references(() => learners.id, { onDelete: "cascade" })
      .notNull(),
    /** Links an attempt to its plan when one exists; null for standalone quizzes. */
    studyPlanId: uuid("study_plan_id").references(() => studyPlans.id, {
      onDelete: "cascade",
    }),
    topic: text("topic").notNull(),
    /** Identifier of the quiz content answered, for replaying the score tool. */
    quizId: text("quiz_id").notNull(),
    answers: jsonb("answers")
      .$type<QuizAnswerPayload[]>()
      .notNull()
      .default([]),
    outcomes: jsonb("outcomes")
      .$type<QuizOutcomePayload[]>()
      .notNull()
      .default([]),
    correctCount: integer("correct_count").notNull().default(0),
    totalCount: integer("total_count").notNull().default(0),
    nextAction: text("next_action"),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    ...timestamps(),
  },
  (t) => [index("quiz_attempts_learner_id_idx").on(t.learnerId)],
);

export type Learner = typeof learners.$inferSelect;
export type NewLearner = typeof learners.$inferInsert;
export type StudyPlanRow = typeof studyPlans.$inferSelect;
export type NewStudyPlan = typeof studyPlans.$inferInsert;
export type QuizAttemptRow = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
