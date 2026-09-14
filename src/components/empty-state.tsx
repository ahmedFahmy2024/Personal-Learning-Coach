/**
 * Empty state for the timeline. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * Each starter action only fills the composer — it never sends on the learner's
 * behalf, so nothing is submitted before the text has been reviewed.
 */

interface EmptyStateProps {
  onSelectStarter: (prompt: string) => void;
}

const STARTER_ACTIONS = [
  {
    label: "Create a plan",
    description: "Turn a topic into short, realistic study sessions.",
    prompt:
      "Create a study plan for the Spanish preterite tense. I can study about 30 minutes a day and I want to talk about last weekend confidently.",
  },
  {
    label: "Test me",
    description: "Practise with a short multiple-choice quiz.",
    prompt:
      "Test me with five multiple-choice questions on the Spanish preterite tense.",
  },
  {
    label: "Explain a concept",
    description: "Get a plain-language explanation with examples.",
    prompt:
      "Explain when Spanish uses the preterite instead of the imperfect, with two short examples.",
  },
] as const;

export function EmptyState({ onSelectStarter }: EmptyStateProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <h2 className="text-base font-semibold">Start a study session</h2>
      <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted">
        Learning Coach turns one topic into a short study plan, quizzes you on
        it, and explains what you missed. A sample session is loaded so the
        panels have content — no model is connected yet, so replies are local
        placeholders.
      </p>

      <h3 className="mt-5 text-xs font-semibold tracking-wide text-muted uppercase">
        Pick a starting point
      </h3>
      <ul className="mt-2 grid gap-2 sm:grid-cols-3">
        {STARTER_ACTIONS.map((action) => (
          <li key={action.label}>
            <button
              type="button"
              onClick={() => onSelectStarter(action.prompt)}
              className="h-full w-full rounded-card border border-border bg-background px-3.5 py-3 text-left transition-colors hover:border-accent"
            >
              <span className="block text-sm font-medium">{action.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                {action.description}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        Choosing a prompt fills the message box so you can edit it before
        sending.
      </p>
    </div>
  );
}
