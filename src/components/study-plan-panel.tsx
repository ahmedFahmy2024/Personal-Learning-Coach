/**
 * Study-plan list. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * Every plan shown is a record the learner saved to Neon Postgres — the
 * production UI has no sample plans. Plans render newest first.
 */

import { formatDuration, formatTimestamp } from "@/lib/format";
import type { StudyPlanSummary } from "@/lib/types";

interface StudyPlanPanelProps {
  plans: StudyPlanSummary[];
}

export function StudyPlanPanel({ plans }: StudyPlanPanelProps) {
  return (
    <section
      aria-labelledby="study-plan-heading"
      className="rounded-card border border-border bg-surface p-4"
    >
      <h2 id="study-plan-heading" className="text-sm font-semibold">
        {plans.length === 0
          ? "Current study plan"
          : `Saved study plans (${plans.length})`}
      </h2>

      {plans.length === 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          No saved plan yet. Fill in the form above and your plan will appear
          here — it stays saved even after a refresh.
        </p>
      ) : (
        <ol className="mt-3 flex flex-col gap-5">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className="border-t border-border pt-3 first:border-t-0 first:pt-0"
            >
              <p className="text-sm leading-relaxed font-medium">
                {plan.topic}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{plan.goal}</p>

              <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                <div className="flex gap-1">
                  <dt>Study time</dt>
                  <dd className="font-medium text-foreground">
                    {formatDuration(plan.availableMinutes)}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt>Total time</dt>
                  <dd className="font-medium text-foreground">
                    {formatDuration(plan.totalMinutes)}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt>Created</dt>
                  <dd className="font-medium text-foreground">
                    <time dateTime={plan.createdAt}>
                      {formatTimestamp(plan.createdAt)}
                    </time>
                  </dd>
                </div>
              </dl>

              <ol className="mt-3 flex flex-col gap-3">
                {plan.steps.map((step, index) => (
                  <li key={step.id} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent/12 text-xs font-semibold text-accent"
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        <span className="sr-only">{`Step ${index + 1}: `}</span>
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">
                        {step.detail}
                      </p>
                      <p className="mt-1 text-xs font-medium text-muted">
                        {formatDuration(step.estimatedMinutes)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
