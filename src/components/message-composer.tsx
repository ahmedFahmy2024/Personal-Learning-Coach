/**
 * Persistent message composer. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * Enter sends, Shift+Enter inserts a line break, and a composing IME keystroke
 * never submits — otherwise selecting a candidate in a CJK or accent-picker
 * menu would send a half-finished message.
 */

import type { KeyboardEvent, RefObject } from "react";

export type ComposerStatus = "idle" | "sending" | "streaming" | "resuming";

interface MessageComposerProps {
  draft: string;
  status: ComposerStatus;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
}

export function MessageComposer({
  draft,
  status,
  textareaRef,
  onDraftChange,
  onSubmit,
}: MessageComposerProps) {
  const isBusy = status !== "idle";
  const canSubmit = draft.trim().length > 0 && !isBusy;

  const submitLabel =
    status === "sending"
      ? "Sending…"
      : status === "streaming"
        ? "Streaming…"
        : status === "resuming"
          ? "Loading…"
          : "Send";

  const progressLabel =
    status === "sending"
      ? "Sending your message…"
      : status === "streaming"
        ? "The Learning Coach is replying…"
        : status === "resuming"
          ? "Loading the conversation…"
          : "";

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }
    event.preventDefault();
    if (canSubmit) {
      onSubmit();
    }
  }

  return (
    <form
      className="rounded-card border border-border bg-surface p-3 transition-colors focus-within:border-accent"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) {
          onSubmit();
        }
      }}
    >
      <label htmlFor="composer-input" className="sr-only">
        Message the Learning Coach
      </label>
      <textarea
        id="composer-input"
        ref={textareaRef}
        value={draft}
        rows={2}
        placeholder="Ask for a study plan, a quiz, or an explanation…"
        aria-describedby="composer-hint"
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full resize-y bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p id="composer-hint" className="text-xs text-muted">
          Enter sends · Shift+Enter adds a line break
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>

      {/* Always mounted so assistive technology announces the change. */}
      <p aria-live="polite" className="mt-1 text-xs text-muted">
        {isBusy ? progressLabel : ""}
      </p>
    </form>
  );
}
