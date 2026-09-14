"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { ChatTimeline } from "@/components/chat-timeline";
import { ContextPanel } from "@/components/context-panel";
import {
  type ComposerStatus,
  MessageComposer,
} from "@/components/message-composer";
import { ResetConfirmationDialog } from "@/components/reset-confirmation-dialog";
import { StatusNotice } from "@/components/status-notice";
import { createSampleSession } from "@/lib/sample-data";
import {
  clearSession,
  readSession,
  type StorageNotice,
  writeSession,
} from "@/lib/storage";
import type { ChatMessage, LearningSession } from "@/lib/types";

/**
 * The one client boundary in the app.
 *
 * `docs/code-standards.md` asks for `"use client"` only where browser state,
 * events, or hooks are needed, so this island owns every piece of browser state
 * and the components it imports — which are part of this client module graph —
 * stay directive-free presentational code.
 */

/**
 * Stands in for the streamed Eve reply. Milestone 1 replaces this timer with a
 * real streamed agent response; until then it exists so the sending and
 * appended-reply states are demonstrable without a model.
 */
const LOCAL_REPLY_DELAY_MS = 600;

const PLACEHOLDER_REPLY =
  "Placeholder reply — Eve is not connected yet. Milestone 1 replaces this with a streamed tutoring response. For now, everything you send stays in this browser.";

const STARTER_QUIZ_PROMPT =
  "Quiz me on the Spanish preterite tense with five multiple-choice questions.";

/**
 * Reading storage during the first render would produce different markup on the
 * server and on the client. Running the restore in a layout effect on the client
 * applies the saved session before the browser paints, so the shell can render
 * the server-provided sample session with no hydration mismatch and no flash.
 */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function createId(prefix: string): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function LearningCoach({
  initialSession,
}: {
  initialSession: LearningSession;
}) {
  const [session, setSession] = useState<LearningSession>(initialSession);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [notice, setNotice] = useState<StorageNotice | null>(null);
  const [draft, setDraft] = useState("");
  const [composerStatus, setComposerStatus] = useState<ComposerStatus>("idle");
  const [isResetOpen, setIsResetOpen] = useState(false);

  const composerRef = useRef<HTMLTextAreaElement>(null);
  const replyTimerRef = useRef<number | null>(null);

  // Replace the sample session with anything already saved in this browser.
  useIsomorphicLayoutEffect(() => {
    const { session: savedSession, notice: readNotice } = readSession();
    if (savedSession) {
      setSession(savedSession);
    }
    setNotice(readNotice);
  }, []);

  // Only user-made changes are persisted, so a pristine sample session is never
  // written to storage and a reset genuinely leaves storage empty.
  useEffect(() => {
    if (!hasLocalChanges) {
      return;
    }
    setNotice(writeSession(session));
  }, [session, hasLocalChanges]);

  // Abandon a pending placeholder reply if the island unmounts mid-flight.
  useEffect(() => {
    return () => {
      if (replyTimerRef.current !== null) {
        window.clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  function updateSession(
    updater: (current: LearningSession) => LearningSession,
  ) {
    setSession(updater);
    setHasLocalChanges(true);
  }

  function appendMessage(message: ChatMessage) {
    updateSession((current) => ({
      ...current,
      messages: [...current.messages, message],
    }));
  }

  function handleSubmit() {
    const text = draft.trim();
    if (text.length === 0 || composerStatus === "sending") {
      return;
    }

    appendMessage({
      id: createId("message"),
      role: "learner",
      kind: "message",
      text,
      createdAt: new Date().toISOString(),
    });
    setDraft("");
    setComposerStatus("sending");

    replyTimerRef.current = window.setTimeout(() => {
      appendMessage({
        id: createId("message"),
        role: "coach",
        kind: "placeholder",
        text: PLACEHOLDER_REPLY,
        createdAt: new Date().toISOString(),
      });
      setComposerStatus("idle");
      replyTimerRef.current = null;
    }, LOCAL_REPLY_DELAY_MS);
  }

  function fillComposer(prompt: string) {
    setDraft(prompt);
    // Move focus so the prompt can be edited and sent from the keyboard.
    composerRef.current?.focus();
  }

  function handleTopicCommit(topic: string) {
    updateSession((current) => ({ ...current, topic }));
  }

  function handleResetConfirm() {
    if (replyTimerRef.current !== null) {
      window.clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
    clearSession();
    setSession(createSampleSession());
    setHasLocalChanges(false);
    setNotice(null);
    setDraft("");
    setComposerStatus("idle");
    setIsResetOpen(false);
  }

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <AppHeader
        topic={session.topic}
        onResetRequest={() => setIsResetOpen(true)}
      />

      {notice === null ? null : (
        <StatusNotice notice={notice} onDismiss={() => setNotice(null)} />
      )}

      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4 overflow-y-auto px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[minmax(0,1fr)] lg:gap-6 lg:overflow-hidden lg:py-6">
        <section
          aria-labelledby="conversation-heading"
          className="flex min-h-0 flex-col"
        >
          <h2 id="conversation-heading" className="sr-only">
            Conversation
          </h2>
          <ChatTimeline
            messages={session.messages}
            onSelectStarter={fillComposer}
          />
          <div className="sticky bottom-0 z-10 mt-3 bg-background pt-1 pb-4 lg:static lg:pb-0">
            <MessageComposer
              draft={draft}
              status={composerStatus}
              textareaRef={composerRef}
              onDraftChange={setDraft}
              onSubmit={handleSubmit}
            />
          </div>
        </section>

        <ContextPanel
          topic={session.topic}
          studyPlan={session.studyPlan}
          quiz={session.quiz}
          quizResult={session.quizResult}
          onTopicCommit={handleTopicCommit}
          onRequestQuiz={() => fillComposer(STARTER_QUIZ_PROMPT)}
        />
      </main>

      <ResetConfirmationDialog
        open={isResetOpen}
        onDismiss={() => setIsResetOpen(false)}
        onConfirm={handleResetConfirm}
      />
    </div>
  );
}
