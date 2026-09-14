/**
 * Deterministic sample data so every panel is demonstrable before Eve exists
 * (see `docs/build-plan.md`, Milestone 0).
 *
 * Timestamps are fixed constants rather than `Date.now()`: the sample session
 * is built on the server and rendered again on the client, so any wall-clock
 * value would produce mismatched markup.
 */

import type { LearningSession, Quiz, QuizResult, StudyPlan } from "@/lib/types";

export const SAMPLE_TOPIC = "Spanish preterite tense";

const PLAN_CREATED_AT = "2026-09-12T09:30:00.000Z";
const QUIZ_CREATED_AT = "2026-09-13T17:40:00.000Z";
const QUIZ_SUBMITTED_AT = "2026-09-13T18:05:00.000Z";

export const sampleStudyPlan: StudyPlan = {
  id: "plan-sample-preterite",
  topic: SAMPLE_TOPIC,
  goal: "Talk about last weekend for two minutes without slipping back into the present tense.",
  createdAt: PLAN_CREATED_AT,
  totalMinutes: 150,
  steps: [
    {
      id: "step-regular-endings",
      title: "Map the regular endings",
      detail:
        "Write the -ar, -er, and -ir preterite endings from memory, then check them against a reference table.",
      estimatedMinutes: 25,
    },
    {
      id: "step-irregular-core",
      title: "Lock in the five irregulars",
      detail:
        "Drill ser, ir, hacer, tener, and estar. They cover most everyday sentences about the past.",
      estimatedMinutes: 35,
    },
    {
      id: "step-weekend-sentences",
      title: "Build ten weekend sentences",
      detail:
        "Write ten sentences about your own weekend and read each one aloud twice.",
      estimatedMinutes: 40,
    },
    {
      id: "step-record-monologue",
      title: "Record a two-minute monologue",
      detail:
        "Speak about last weekend without notes, listen back, and note one thing to fix.",
      estimatedMinutes: 50,
    },
  ],
};

export const sampleQuiz: Quiz = {
  id: "quiz-sample-preterite",
  topic: SAMPLE_TOPIC,
  createdAt: QUIZ_CREATED_AT,
  questions: [
    {
      id: "q1",
      prompt: "Ayer yo ___ con mi hermana. (hablar)",
      correctChoiceId: "q1-c1",
      choices: [
        { id: "q1-c1", label: "hablé" },
        { id: "q1-c2", label: "hablo" },
        { id: "q1-c3", label: "hablaba" },
        { id: "q1-c4", label: "hablaré" },
      ],
    },
    {
      id: "q2",
      prompt: "El sábado nosotros ___ al cine. (ir)",
      correctChoiceId: "q2-c1",
      choices: [
        { id: "q2-c1", label: "fuimos" },
        { id: "q2-c2", label: "vamos" },
        { id: "q2-c3", label: "íbamos" },
        { id: "q2-c4", label: "iremos" },
      ],
    },
    {
      id: "q3",
      prompt: "Which verb is irregular in the preterite?",
      correctChoiceId: "q3-c3",
      choices: [
        { id: "q3-c1", label: "comer" },
        { id: "q3-c2", label: "hablar" },
        { id: "q3-c3", label: "tener" },
        { id: "q3-c4", label: "vivir" },
      ],
    },
    {
      id: "q4",
      prompt: "Anoche ella ___ la tarea antes de cenar. (hacer)",
      correctChoiceId: "q4-c2",
      choices: [
        { id: "q4-c1", label: "hace" },
        { id: "q4-c2", label: "hizo" },
        { id: "q4-c3", label: "hacía" },
        { id: "q4-c4", label: "hará" },
      ],
    },
    {
      id: "q5",
      prompt: "What does “estuve” mean?",
      correctChoiceId: "q5-c1",
      choices: [
        { id: "q5-c1", label: "I was, for a limited time" },
        { id: "q5-c2", label: "I am" },
        { id: "q5-c3", label: "I will be" },
        { id: "q5-c4", label: "I used to be" },
      ],
    },
  ],
};

/**
 * A scored result. The counts and per-question outcomes are authored here
 * because grading is deliberately deferred to the deterministic score tool in
 * Milestone 2 — the UI only renders what this record already states.
 */
export const sampleQuizResult: QuizResult = {
  id: "result-sample-preterite",
  quizId: sampleQuiz.id,
  topic: SAMPLE_TOPIC,
  submittedAt: QUIZ_SUBMITTED_AT,
  answers: [
    { questionId: "q1", choiceId: "q1-c1" },
    { questionId: "q2", choiceId: "q2-c1" },
    { questionId: "q3", choiceId: "q3-c3" },
    { questionId: "q4", choiceId: "q4-c1" },
    { questionId: "q5", choiceId: "q5-c1" },
  ],
  outcomes: [
    { questionId: "q1", choiceId: "q1-c1", isCorrect: true },
    { questionId: "q2", choiceId: "q2-c1", isCorrect: true },
    { questionId: "q3", choiceId: "q3-c3", isCorrect: true },
    { questionId: "q4", choiceId: "q4-c1", isCorrect: false },
    { questionId: "q5", choiceId: "q5-c1", isCorrect: true },
  ],
  correctCount: 4,
  totalCount: 5,
  nextAction:
    "Review the irregular preterite of hacer, then say three sentences out loud that use “hizo”.",
};

/**
 * The pristine session a first-time visitor sees, and the state the reset
 * action restores. The timeline starts empty so the empty state with its
 * starter actions is the real entry point, while the panels already carry
 * sample content.
 */
export function createSampleSession(): LearningSession {
  return {
    topic: SAMPLE_TOPIC,
    studyPlan: structuredClone(sampleStudyPlan),
    quiz: structuredClone(sampleQuiz),
    quizResult: structuredClone(sampleQuizResult),
    messages: [],
  };
}
