/**
 * Versioned `localStorage` persistence for the Learning Coach session.
 *
 * `docs/AGENTS.md` requires browser storage to be treated as editable,
 * untrusted data, so everything read back is validated field by field before
 * it reaches React state. A single versioned envelope key holds the whole
 * session; bump {@link STORAGE_VERSION} and add a migration step when the
 * persisted shape changes.
 *
 * No new dependency is used for validation: the shapes are small enough for
 * hand-written guards, and `AGENTS.md` asks for the installed packages to be
 * preferred.
 */

import type {
  ChatMessage,
  LearningSession,
  Quiz,
  QuizAnswer,
  QuizQuestion,
  QuizQuestionOutcome,
  QuizResult,
  StudyPlan,
  StudyPlanStep,
} from "@/lib/types";

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = `learning-coach.session.v${STORAGE_VERSION}`;

export type StorageNoticeKind = "unavailable" | "invalid" | "version-mismatch";

export interface StorageNotice {
  kind: StorageNoticeKind;
  message: string;
}

export interface SessionReadResult {
  /** `null` when nothing valid was stored, in which case the caller keeps its defaults. */
  session: LearningSession | null;
  notice: StorageNotice | null;
}

const UNAVAILABLE_NOTICE: StorageNotice = {
  kind: "unavailable",
  message:
    "This browser is blocking local storage, so your session cannot be saved. The sample session still works, but progress is lost on refresh.",
};

const UNREADABLE_NOTICE: StorageNotice = {
  kind: "invalid",
  message:
    "Saved session data could not be read and was cleared. The sample session is shown instead.",
};

const OUTDATED_NOTICE: StorageNotice = {
  kind: "version-mismatch",
  message:
    "Saved session data came from an older version and was cleared. The sample session is shown instead.",
};

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOneOf<const T extends string>(
  value: unknown,
  options: readonly T[],
): value is T {
  return (
    typeof value === "string" && (options as readonly string[]).includes(value)
  );
}

/** Returns `null` when any item fails to parse, so a partial array is rejected. */
function parseArray<T>(
  value: unknown,
  parseItem: (item: unknown) => T | null,
): T[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const parsed: T[] = [];
  for (const item of value) {
    const parsedItem = parseItem(item);
    if (parsedItem === null) {
      return null;
    }
    parsed.push(parsedItem);
  }
  return parsed;
}

function parseChatMessage(value: unknown): ChatMessage | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, role, kind, text, createdAt } = value;
  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(text) ||
    !isNonEmptyString(createdAt) ||
    !isOneOf(role, ["learner", "coach"]) ||
    !isOneOf(kind, ["message", "placeholder"])
  ) {
    return null;
  }
  return { id, role, kind, text, createdAt };
}

function parseStudyPlanStep(value: unknown): StudyPlanStep | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, title, detail, estimatedMinutes } = value;
  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(title) ||
    !isNonEmptyString(detail) ||
    !isFiniteNumber(estimatedMinutes)
  ) {
    return null;
  }
  return { id, title, detail, estimatedMinutes };
}

function parseStudyPlan(value: unknown): StudyPlan | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, topic, goal, createdAt, totalMinutes } = value;
  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(topic) ||
    !isNonEmptyString(goal) ||
    !isNonEmptyString(createdAt) ||
    !isFiniteNumber(totalMinutes)
  ) {
    return null;
  }
  const steps = parseArray(value.steps, parseStudyPlanStep);
  if (steps === null) {
    return null;
  }
  return { id, topic, goal, createdAt, totalMinutes, steps };
}

function parseQuizQuestion(value: unknown): QuizQuestion | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, prompt, correctChoiceId } = value;
  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(prompt) ||
    !isNonEmptyString(correctChoiceId)
  ) {
    return null;
  }
  const choices = parseArray(value.choices, (choice) => {
    if (!isRecord(choice)) {
      return null;
    }
    const { id: choiceId, label } = choice;
    if (!isNonEmptyString(choiceId) || !isNonEmptyString(label)) {
      return null;
    }
    return { id: choiceId, label };
  });
  if (choices === null) {
    return null;
  }
  return { id, prompt, choices, correctChoiceId };
}

function parseQuiz(value: unknown): Quiz | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, topic, createdAt } = value;
  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(topic) ||
    !isNonEmptyString(createdAt)
  ) {
    return null;
  }
  const questions = parseArray(value.questions, parseQuizQuestion);
  if (questions === null) {
    return null;
  }
  return { id, topic, createdAt, questions };
}

function parseQuizAnswer(value: unknown): QuizAnswer | null {
  if (!isRecord(value)) {
    return null;
  }
  const { questionId, choiceId } = value;
  if (!isNonEmptyString(questionId) || !isNonEmptyString(choiceId)) {
    return null;
  }
  return { questionId, choiceId };
}

function parseQuizQuestionOutcome(value: unknown): QuizQuestionOutcome | null {
  if (!isRecord(value)) {
    return null;
  }
  const { questionId, choiceId, isCorrect } = value;
  if (
    !isNonEmptyString(questionId) ||
    typeof isCorrect !== "boolean" ||
    !(choiceId === null || isNonEmptyString(choiceId))
  ) {
    return null;
  }
  return { questionId, choiceId, isCorrect };
}

function parseQuizResult(value: unknown): QuizResult | null {
  if (!isRecord(value)) {
    return null;
  }
  const {
    id,
    quizId,
    topic,
    submittedAt,
    correctCount,
    totalCount,
    nextAction,
  } = value;
  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(quizId) ||
    !isNonEmptyString(topic) ||
    !isNonEmptyString(submittedAt) ||
    !isNonEmptyString(nextAction) ||
    !isFiniteNumber(correctCount) ||
    !isFiniteNumber(totalCount)
  ) {
    return null;
  }
  const answers = parseArray(value.answers, parseQuizAnswer);
  if (answers === null) {
    return null;
  }
  const outcomes = parseArray(value.outcomes, parseQuizQuestionOutcome);
  if (outcomes === null) {
    return null;
  }
  return {
    id,
    quizId,
    topic,
    submittedAt,
    answers,
    outcomes,
    correctCount,
    totalCount,
    nextAction,
  };
}

/** Treats a missing or `null` field as "not set yet". */
function parseNullable<T>(
  value: unknown,
  parse: (candidate: unknown) => T | null,
): T | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }
  return parse(value) ?? undefined;
}

export function parseLearningSession(value: unknown): LearningSession | null {
  if (!isRecord(value) || !isNonEmptyString(value.topic)) {
    return null;
  }

  const studyPlan = parseNullable(value.studyPlan, parseStudyPlan);
  const quiz = parseNullable(value.quiz, parseQuiz);
  const quizResult = parseNullable(value.quizResult, parseQuizResult);
  const messages = parseArray(value.messages, parseChatMessage);

  if (
    studyPlan === undefined ||
    quiz === undefined ||
    quizResult === undefined ||
    messages === null
  ) {
    return null;
  }

  return { topic: value.topic, studyPlan, quiz, quizResult, messages };
}

/* -------------------------------------------------------------------------- */
/* Storage access                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Probes storage rather than only checking for `window`, because Safari private
 * mode and hardened privacy settings expose the API but throw on write.
 */
export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const probeKey = "learning-coach.storage-probe";
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function readSession(): SessionReadResult {
  if (!isStorageAvailable()) {
    return { session: null, notice: UNAVAILABLE_NOTICE };
  }

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { session: null, notice: UNAVAILABLE_NOTICE };
  }

  // Nothing stored yet: a first visit is not an error.
  if (raw === null) {
    return { session: null, notice: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    clearSession();
    return { session: null, notice: UNREADABLE_NOTICE };
  }

  if (!isRecord(parsed) || !isFiniteNumber(parsed.version)) {
    clearSession();
    return { session: null, notice: UNREADABLE_NOTICE };
  }
  if (parsed.version !== STORAGE_VERSION) {
    clearSession();
    return { session: null, notice: OUTDATED_NOTICE };
  }

  const session = parseLearningSession(parsed.session);
  if (session === null) {
    clearSession();
    return { session: null, notice: UNREADABLE_NOTICE };
  }

  return { session, notice: null };
}

/** Returns a notice when the write could not be persisted, otherwise `null`. */
export function writeSession(session: LearningSession): StorageNotice | null {
  if (!isStorageAvailable()) {
    return UNAVAILABLE_NOTICE;
  }
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, session }),
    );
    return null;
  } catch {
    return {
      kind: "unavailable",
      message:
        "Your session could not be saved to this browser, so recent changes may be lost on refresh.",
    };
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do: the caller is already resetting in-memory state.
  }
}
