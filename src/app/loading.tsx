/**
 * Loading state for the database-backed home page. The shell stays visible
 * while the server reads the learner's records from Neon.
 */
export default function Loading() {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <div className="shrink-0 border-b border-border bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6">
          <p className="text-base font-semibold tracking-tight">
            Learning Coach
          </p>
        </div>
      </div>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <p aria-live="polite" className="text-sm text-muted">
          Loading your saved study plans…
        </p>
      </main>
    </div>
  );
}
