/**
 * Dismissible notice for browser-storage problems. Rendered inside the client
 * boundary declared in `learning-coach.tsx`.
 *
 * Storage failures are the only error path Milestone 0 can actually hit, so the
 * notice states what happened and what the learner can still do.
 */

import type { StorageNotice } from "@/lib/storage";

interface StatusNoticeProps {
  notice: StorageNotice;
  onDismiss: () => void;
}

export function StatusNotice({ notice, onDismiss }: StatusNoticeProps) {
  return (
    <div
      aria-live="polite"
      className="shrink-0 border-t border-danger/40 bg-danger-surface"
    >
      <div className="mx-auto flex w-full max-w-7xl items-start gap-3 px-4 py-2.5 text-sm sm:px-6">
        <p className="leading-relaxed">
          <span className="font-semibold">Local data: </span>
          {notice.message}
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
