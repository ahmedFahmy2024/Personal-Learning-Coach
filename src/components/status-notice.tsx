/**
 * Dismissible status notice. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * Used for database availability and action problems: it states what happened
 * and what the learner can still do, without exposing any secret.
 */

interface StatusNoticeProps {
  title: string;
  message: string;
  onDismiss: () => void;
}

export function StatusNotice({ title, message, onDismiss }: StatusNoticeProps) {
  return (
    <div
      role="alert"
      className="shrink-0 border-t border-danger/40 bg-danger-surface"
    >
      <div className="mx-auto flex w-full max-w-7xl items-start gap-3 px-4 py-2.5 text-sm sm:px-6">
        <p className="leading-relaxed">
          <span className="font-semibold">{title}: </span>
          {message}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted transition-colors hover:border-foreground hover:text-foreground"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
