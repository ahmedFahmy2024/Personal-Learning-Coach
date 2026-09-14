/**
 * Reset confirmation. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * Uses the native `<dialog>` element so focus trapping, the inert backdrop, and
 * the Escape-to-close behaviour come from the platform rather than from
 * hand-written key handling (see `docs/code-standards.md`).
 */

import { useEffect, useRef } from "react";

interface ResetConfirmationDialogProps {
  open: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
}

export function ResetConfirmationDialog({
  open,
  onDismiss,
  onConfirm,
}: ResetConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="reset-dialog-title"
      aria-describedby="reset-dialog-description"
      onClose={onDismiss}
      onCancel={onDismiss}
      className="m-auto w-[min(28rem,90vw)] rounded-card border border-border bg-surface p-0 text-foreground backdrop:bg-black/50"
    >
      <div className="p-5">
        <h2 id="reset-dialog-title" className="text-base font-semibold">
          Reset local data?
        </h2>
        <p
          id="reset-dialog-description"
          className="mt-2 text-sm leading-relaxed text-muted"
        >
          This deletes the conversation, plan, and quiz result saved in this
          browser and restores the sample session. It cannot be undone.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-foreground"
          >
            Keep my data
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-danger px-3.5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Reset and restore sample
          </button>
        </div>
      </div>
    </dialog>
  );
}
