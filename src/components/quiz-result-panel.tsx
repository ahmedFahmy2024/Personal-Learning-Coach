/**
 * Latest quiz-result panel. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * The panel never grades an answer: `correctCount`, `totalCount`, and every
 * `isCorrect` flag come from the stored result, which the deterministic score
 * tool produces from Milestone 2 onward (see `docs/ui-spec.md`). Correctness is
 * communicated with a symbol and a word as well as colour.
 */

import { formatTimestamp } from "@/lib/format";
import type { Quiz, QuizResult } from "@/lib/types";

interface QuizResultPanelProps {
  quiz: Quiz | null;
  quizResult: QuizResult | null;
}

export function QuizResultPanel({ quiz, quizResult }: QuizResultPanelProps) {
  return (
    <section
      aria-labelledby="quiz-result-heading"
      className="rounded-card border border-border bg-surface p-4"
    >
      <h2 id="quiz-result-heading" className="text-sm font-semibold">
        Latest quiz result
      </h2>

      {quizResult === null ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          No scored quiz yet. Ask for a quiz and the score will appear here.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed">
            <span className="font-semibold">
              {quizResult.correctCount} of {quizResult.totalCount} correct
            </span>{" "}
            <span className="text-muted">
              on{" "}
              <time dateTime={quizResult.submittedAt}>
                {formatTimestamp(quizResult.submittedAt)}
              </time>
            </span>
          </p>

          {quiz === null ? (
            <p className="mt-3 text-xs text-muted">
              Question details are unavailable for this result.
            </p>
          ) : (
            <ol className="mt-3 flex flex-col gap-3">
              {quizResult.outcomes.map((outcome) => {
                const questionIndex = quiz.questions.findIndex(
                  (question) => question.id === outcome.questionId,
                );
                const question = quiz.questions[questionIndex];
                if (question === undefined) {
                  return null;
                }
                const chosen = question.choices.find(
                  (choice) => choice.id === outcome.choiceId,
                );
                const correct = question.choices.find(
                  (choice) => choice.id === question.correctChoiceId,
                );

                return (
                  <li key={outcome.questionId} className="text-sm">
                    <p className="flex gap-2">
                      <span className="font-medium text-muted">
                        {questionIndex + 1}.
                      </span>
                      <span>{question.prompt}</span>
                    </p>
                    <p className="mt-1 ml-5 text-xs leading-relaxed">
                      <span className="text-muted">Your answer: </span>
                      <span className="font-medium">
                        {chosen === undefined ? "not answered" : chosen.label}
                      </span>
                    </p>
                    <p
                      className={`mt-1 ml-5 text-xs font-semibold ${
                        outcome.isCorrect ? "text-success" : "text-danger"
                      }`}
                    >
                      {outcome.isCorrect
                        ? "✓ Correct"
                        : `✗ Incorrect — correct answer: ${correct?.label ?? "unknown"}`}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="mt-4 border-t border-border pt-3">
            <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">
              Next step
            </h3>
            <p className="mt-1 text-sm leading-relaxed">
              {quizResult.nextAction}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
