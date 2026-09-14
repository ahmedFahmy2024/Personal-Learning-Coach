/**
 * Presentational header. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 */

interface AppHeaderProps {
  topic: string;
  onResetRequest: () => void;
}

export function AppHeader({ topic, onResetRequest }: AppHeaderProps) {
  return (
    <header className="shrink-0 border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground"
          >
            LC
          </span>
          <h1 className="text-base font-semibold tracking-tight">
            Learning Coach
          </h1>
        </div>

        <p className="flex min-w-0 items-center gap-2 text-sm">
          <span className="text-xs font-medium tracking-wide text-muted uppercase">
            Active topic
          </span>
          <span className="max-w-[22ch] truncate rounded-full border border-border px-2.5 py-0.5 font-medium sm:max-w-none">
            {topic}
          </span>
        </p>

        <button
          type="button"
          onClick={onResetRequest}
          className="ml-auto shrink-0 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-danger hover:text-danger"
        >
          Reset local data
        </button>
      </div>
    </header>
  );
}
