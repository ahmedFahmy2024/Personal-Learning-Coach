/**
 * Active-topic form. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * The topic is the only piece of session data a learner can set directly in
 * Milestone 0. Committing it is what makes the persisted topic meaningful; plan
 * and quiz generation from a changed topic arrives with Eve in Milestone 1.
 */

import { useEffect, useState } from "react";

interface TopicFormProps {
  topic: string;
  onCommit: (topic: string) => void;
}

export function TopicForm({ topic, onCommit }: TopicFormProps) {
  const [value, setValue] = useState(topic);

  // Adopt external changes (a reset, or a topic set elsewhere) without
  // discarding whatever the learner is currently typing.
  useEffect(() => {
    setValue(topic);
  }, [topic]);

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0 && trimmed !== topic;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) {
          onCommit(trimmed);
        }
      }}
      className="rounded-card border border-border bg-surface p-4"
    >
      <label htmlFor="active-topic" className="text-sm font-semibold">
        Active topic
      </label>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Saved in this browser only.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          id="active-topic"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-accent"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  );
}
