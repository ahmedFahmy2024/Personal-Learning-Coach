/**
 * Current study-plan panel. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 */

import { formatDuration, formatTimestamp } from "@/lib/format";
import type { Quiz, StudyPlan } from "@/lib/types";

interface StudyPlanPanelProps {
  studyPlan: StudyPlan | null;
  quiz: Quiz | null;
  onRequestQuiz: () => void;
}

export function StudyPlanPanel({
  studyPlan,
  quiz,
  onRequestQuiz,
}: StudyPlanPanelProps) {
  return (
    <section
      aria-labelledby="study-plan-heading"
      className="rounded-card border border-border bg-surface p-4"
    >
      <h2 id="study-plan-heading" className="text-sm font-semibold">
        Current study plan
      </h2>

      {studyPlan === null ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          No plan yet. Ask for one and it will appear here.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed">{studyPlan.goal}</p>

          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <div className="flex gap-1">
              <dt>Topic</dt>
              <dd className="font-medium text-foreground">{studyPlan.topic}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Total time</dt>
              <dd className="font-medium text-foreground">
                {formatDuration(studyPlan.totalMinutes)}
              </dd>
            </div>
            <div className="flex gap-1">
              <dt>Created</dt>
              <dd className="font-medium text-foreground">
                <time dateTime={studyPlan.createdAt}>
                  {formatTimestamp(studyPlan.createdAt)}
                </time>
              </dd>
            </div>
          </dl>

          <ol className="mt-4 flex flex-col gap-3">
            {studyPlan.steps.map((step, index) => (
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
        </>
      )}

      {quiz === null ? null : (
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-xs text-muted">
            Practice set ready · {quiz.questions.length} questions
          </p>
          <button
            type="button"
            onClick={onRequestQuiz}
            className="mt-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            Ask for this quiz
          </button>
        </div>
      )}
    </section>
  );
}
