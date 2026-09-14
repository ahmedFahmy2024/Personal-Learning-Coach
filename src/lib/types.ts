/**
 * Shared domain types for the Learning Coach MVP.
 *
 * These describe browser-owned data (see `docs/architecture.md`), so every type
 * is plain and JSON-serializable: the same shapes travel from a Server
 * Component to the client island and into Eve tools.
 *
 * Conversation messages are Eve-owned from Milestone 2: the timeline renders
 * the `EveMessage` projection from `eve/react`, and durable session state
 * lives in the Eve runtime, not in these types.
 */

export interface StudyPlanStep {
  id: string;
  title: string;
  detail: string;
  /** Authored estimate. The UI formats it and never re-derives it. */
  estimatedMinutes: number;
}

export interface StudyPlan {
  id: string;
  topic: string;
  goal: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** Authored estimate for the whole plan. */
  totalMinutes: number;
  steps: StudyPlanStep[];
}

export interface QuizChoice {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: QuizChoice[];
  /** Read by the deterministic score tool added in Milestone 2. */
  correctChoiceId: string;
}

export interface Quiz {
  id: string;
  topic: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
  questions: QuizQuestion[];
}

/** One submitted answer. This is the raw learner input, not a graded result. */
export interface QuizAnswer {
  questionId: string;
  choiceId: string;
}

/** The graded counterpart of a {@link QuizAnswer}. */
export interface QuizQuestionOutcome {
  questionId: string;
  /** The chosen choice, or `null` when the question was left unanswered. */
  choiceId: string | null;
  isCorrect: boolean;
}

export interface QuizResult {
  id: string;
  quizId: string;
  topic: string;
  /** ISO 8601 timestamp. */
  submittedAt: string;
  /** Raw submission, kept so the score tool can be replayed over it. */
  answers: QuizAnswer[];
  /** Graded outcomes produced by the deterministic score tool. */
  outcomes: QuizQuestionOutcome[];
  /**
   * Counts produced by the deterministic score tool. The UI displays these
   * values as-is and never recalculates them (see `docs/ui-spec.md`).
   */
  correctCount: number;
  totalCount: number;
  /** One concrete next learning action, shown after a score. */
  nextAction: string;
}

/** Everything the browser persists for the single learner. */
export interface LearningSession {
  topic: string;
  studyPlan: StudyPlan | null;
  quiz: Quiz | null;
  quizResult: QuizResult | null;
}

/* -------------------------------------------------------------------------- */
/* Database-backed views (Milestone 1)                                        */
/* -------------------------------------------------------------------------- */

/**
 * JSON-serializable projection of a `study_plans` row. Built on the server
 * from the learner's own records and passed to client components as props —
 * the client never queries the database directly.
 */
export interface StudyPlanSummary {
  id: string;
  topic: string;
  goal: string;
  availableMinutes: number;
  totalMinutes: number;
  steps: StudyPlanStep[];
  /** ISO 8601 timestamp. */
  createdAt: string;
}

/** JSON-serializable projection of the latest `quiz_attempts` row. */
export interface QuizAttemptSummary {
  id: string;
  topic: string;
  correctCount: number;
  totalCount: number;
  nextAction: string | null;
  /** ISO 8601 timestamp. */
  submittedAt: string;
}
