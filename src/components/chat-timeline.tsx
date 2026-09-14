/**
 * Conversation timeline. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * The scroll area is owned here so that appending a message scrolls the newest
 * entry into view without moving the composer, which sits outside this region.
 */

import { useEffect, useRef } from "react";
import { EmptyState } from "@/components/empty-state";
import { formatTimestamp } from "@/lib/format";
import type { ChatMessage } from "@/lib/types";

interface ChatTimelineProps {
  messages: ChatMessage[];
  onSelectStarter: (prompt: string) => void;
}

export function ChatTimeline({ messages, onSelectStarter }: ChatTimelineProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageCount = messages.length;

  useEffect(() => {
    if (messageCount === 0) {
      return;
    }
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messageCount]);

  return (
    <div
      ref={scrollAreaRef}
      className="flex min-h-0 flex-1 flex-col gap-3 lg:overflow-y-auto lg:pr-1"
    >
      {messageCount === 0 ? (
        <EmptyState onSelectStarter={onSelectStarter} />
      ) : null}

      {messageCount > 0 ? (
        <ol aria-label="Conversation timeline" className="flex flex-col gap-3">
          {messages.map((message) => (
            <li
              key={message.id}
              className={`rounded-card border bg-surface p-4 ${
                message.role === "learner"
                  ? "border-accent/50"
                  : "border-border"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                  {message.role === "learner" ? "You" : "Learning Coach"}
                </span>
                {message.kind === "placeholder" ? (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                    Local placeholder
                  </span>
                ) : null}
                <time
                  dateTime={message.createdAt}
                  className="ml-auto text-xs text-muted"
                >
                  {formatTimestamp(message.createdAt)}
                </time>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">
                {message.text}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
