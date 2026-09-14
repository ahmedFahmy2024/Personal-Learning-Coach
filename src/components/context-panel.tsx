/**
 * Context panel. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * It sits beside the conversation on large screens and below it on narrow
 * screens (see `docs/ui-spec.md`). All records shown come from Neon Postgres;
 * the empty states explain that nothing is saved yet.
 */

import { QuizResultPanel } from "@/components/quiz-result-panel";
import { StudyPlanForm } from "@/components/study-plan-form";
import { StudyPlanPanel } from "@/components/study-plan-panel";
import type { QuizAttemptSummary, StudyPlanSummary } from "@/lib/types";

interface ContextPanelProps {
  plans: StudyPlanSummary[];
  latestAttempt: QuizAttemptSummary | null;
  databaseAvailable: boolean;
}

export function ContextPanel({
  plans,
  latestAttempt,
  databaseAvailable,
}: ContextPanelProps) {
  return (
    <aside
      aria-label="Session context"
      className="flex min-h-0 flex-col gap-4 lg:overflow-y-auto lg:pb-6"
    >
      {databaseAvailable ? <StudyPlanForm /> : null}
      <StudyPlanPanel plans={plans} />
      <QuizResultPanel latestAttempt={latestAttempt} />
    </aside>
  );
}
