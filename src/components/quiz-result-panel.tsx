/**
 * Latest quiz-result panel. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * The panel renders the learner's latest stored attempt from Neon Postgres.
 * Quizzes and scoring arrive with Milestones 2–3, so until then this is an
 * honest empty state — never sample results. Correctness is communicated with
 * a word as well as colour.
 */

import { formatTimestamp } from "@/lib/format";
import type { QuizAttemptSummary } from "@/lib/types";

interface QuizResultPanelProps {
  latestAttempt: QuizAttemptSummary | null;
}

export function QuizResultPanel({ latestAttempt }: QuizResultPanelProps) {
  return (
    <section
      aria-labelledby="quiz-result-heading"
      className="rounded-card border border-border bg-surface p-4"
    >
      <h2 id="quiz-result-heading" className="text-sm font-semibold">
        Latest quiz result
      </h2>

      {latestAttempt === null ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          No scored quiz yet. Short quizzes arrive in a later milestone, and
          your results will appear here.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed">
            <span className="font-semibold">
              {latestAttempt.correctCount} of {latestAttempt.totalCount} correct
            </span>{" "}
            <span className="text-muted">
              on {latestAttempt.topic} ·{" "}
              <time dateTime={latestAttempt.submittedAt}>
                {formatTimestamp(latestAttempt.submittedAt)}
              </time>
            </span>
          </p>

          {latestAttempt.nextAction === null ? null : (
            <div className="mt-4 border-t border-border pt-3">
              <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">
                Next step
              </h3>
              <p className="mt-1 text-sm leading-relaxed">
                {latestAttempt.nextAction}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
