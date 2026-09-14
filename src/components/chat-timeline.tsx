/**
 * Conversation timeline. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * Messages are Eve-owned (`eve/react` projection) and stream in part by part.
 * The scroll area is owned here so that appending or streaming a reply scrolls
 * the newest entry into view without moving the composer, which sits outside
 * this region.
 */

import type { EveMessage } from "eve/react";
import { useEffect, useRef } from "react";
import { EmptyState } from "@/components/empty-state";

interface ChatTimelineProps {
  messages: readonly EveMessage[];
  isStreaming: boolean;
  onSelectStarter: (prompt: string) => void;
}

/** Concatenates the streamed text parts of one message for display. */
export function eveMessageText(message: EveMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

function isMessageStreaming(message: EveMessage): boolean {
  return message.parts.some(
    (part) => part.type === "text" && part.state === "streaming",
  );
}

export function ChatTimeline({
  messages,
  isStreaming,
  onSelectStarter,
}: ChatTimelineProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // `messages` is a new array on every stream event, so this also follows an
  // in-flight reply token by token while leaving the composer untouched.
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea && messages.length > 0) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollAreaRef}
      className="flex min-h-0 flex-1 flex-col gap-3 lg:overflow-y-auto lg:pr-1"
    >
      {messages.length === 0 ? (
        <EmptyState onSelectStarter={onSelectStarter} />
      ) : null}

      {messages.length > 0 ? (
        <ol aria-label="Conversation timeline" className="flex flex-col gap-3">
          {messages.map((message) => {
            const text = eveMessageText(message);
            const streaming = isMessageStreaming(message);
            // Non-text parts (reasoning, tool calls) are not part of the
            // Milestone 2 tutoring surface; skip messages that render empty.
            if (text.length === 0) {
              return null;
            }
            return (
              <li
                key={message.id}
                className={`rounded-card border bg-surface p-4 ${message.role === "user" ? "border-accent/50" : "border-border"}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                    {message.role === "user" ? "You" : "Learning Coach"}
                  </span>
                  {streaming ? (
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                      Streaming
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">
                  {text}
                </p>
              </li>
            );
          })}
        </ol>
      ) : null}

      {/* Static text so assistive technology announces the state once. */}
      {isStreaming ? (
        <p aria-live="polite" className="text-xs text-muted">
          The Learning Coach is replying…
        </p>
      ) : null}
    </div>
  );
}
