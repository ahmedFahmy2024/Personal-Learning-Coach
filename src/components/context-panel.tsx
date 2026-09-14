/**
 * Context panel. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * It sits beside the conversation on large screens and below it on narrow
 * screens (see `docs/ui-spec.md`).
 */

import { QuizResultPanel } from "@/components/quiz-result-panel";
import { StudyPlanPanel } from "@/components/study-plan-panel";
import { TopicForm } from "@/components/topic-form";
import type { Quiz, QuizResult, StudyPlan } from "@/lib/types";

interface ContextPanelProps {
  topic: string;
  studyPlan: StudyPlan | null;
  quiz: Quiz | null;
  quizResult: QuizResult | null;
  onTopicCommit: (topic: string) => void;
  onRequestQuiz: () => void;
}

export function ContextPanel({
  topic,
  studyPlan,
  quiz,
  quizResult,
  onTopicCommit,
  onRequestQuiz,
}: ContextPanelProps) {
  return (
    <aside
      aria-label="Session context"
      className="flex min-h-0 flex-col gap-4 lg:overflow-y-auto lg:pb-6"
    >
      <TopicForm topic={topic} onCommit={onTopicCommit} />
      <StudyPlanPanel
        studyPlan={studyPlan}
        quiz={quiz}
        onRequestQuiz={onRequestQuiz}
      />
      <QuizResultPanel quiz={quiz} quizResult={quizResult} />
    </aside>
  );
}
