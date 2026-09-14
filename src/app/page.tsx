import { LearningCoach } from "@/components/learning-coach";
import { isDatabaseConfigured } from "@/db/client";
import { readLearnerId } from "@/db/learner";
import { listQuizAttemptsForLearner } from "@/db/quiz-attempts";
import { listStudyPlansForLearner } from "@/db/study-plans";
import type { QuizAttemptSummary, StudyPlanSummary } from "@/lib/types";

/**
 * Server Component. Every render reads the learner's own records from Neon
 * Postgres, so a refresh always shows what is stored — never sample data.
 */
export const dynamic = "force-dynamic";

const MISSING_DATABASE_MESSAGE =
  "DATABASE_URL is not set, so saved study plans are unavailable. Create a free Neon project, add its connection string as DATABASE_URL in .env.local, run pnpm db:migrate, and reload.";

const UNREADABLE_DATABASE_MESSAGE =
  "Saved study plans could not be loaded. Check your connection and reload. Nothing was changed.";

function toPlanSummary(row: {
  id: string;
  topic: string;
  goal: string;
  availableMinutes: number;
  totalMinutes: number;
  steps: { title: string; detail: string; estimatedMinutes: number }[];
  createdAt: Date;
}): StudyPlanSummary {
  return {
    id: row.id,
    topic: row.topic,
    goal: row.goal,
    availableMinutes: row.availableMinutes,
    totalMinutes: row.totalMinutes,
    steps: row.steps.map((step, index) => ({
      id: `${row.id}-step-${index + 1}`,
      title: step.title,
      detail: step.detail,
      estimatedMinutes: step.estimatedMinutes,
    })),
    createdAt: row.createdAt.toISOString(),
  };
}

export default async function Home() {
  if (!isDatabaseConfigured()) {
    return (
      <LearningCoach
        initialPlans={[]}
        latestAttempt={null}
        dbError={MISSING_DATABASE_MESSAGE}
        needsProfile={false}
      />
    );
  }

  const learnerId = await readLearnerId();
  if (learnerId === null) {
    // No profile cookie yet: the client ensures it once, then refreshes.
    return (
      <LearningCoach
        initialPlans={[]}
        latestAttempt={null}
        dbError={null}
        needsProfile
      />
    );
  }

  try {
    const [planRows, attemptRows] = await Promise.all([
      listStudyPlansForLearner(learnerId),
      listQuizAttemptsForLearner(learnerId),
    ]);
    const latest = attemptRows[0] ?? null;
    const latestAttempt: QuizAttemptSummary | null =
      latest === null
        ? null
        : {
            id: latest.id,
            topic: latest.topic,
            correctCount: latest.correctCount,
            totalCount: latest.totalCount,
            nextAction: latest.nextAction,
            submittedAt: latest.submittedAt.toISOString(),
          };
    return (
      <LearningCoach
        initialPlans={planRows.map(toPlanSummary)}
        latestAttempt={latestAttempt}
        dbError={null}
        needsProfile={false}
      />
    );
  } catch {
    return (
      <LearningCoach
        initialPlans={[]}
        latestAttempt={null}
        dbError={UNREADABLE_DATABASE_MESSAGE}
        needsProfile={false}
      />
    );
  }
}
