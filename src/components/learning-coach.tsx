/**
 * The one client boundary in the app.
 *
 * `docs/code-standards.md` asks for `"use client"` only where browser state,
 * events, or hooks are needed, so this island owns the conversation draft, the
 * reset dialog, and the profile bootstrap — while study plans and quiz results
 * render from the server-provided database records and are never kept in
 * client state. Chat messages stay in memory only; Eve owns conversation
 * persistence from Milestone 2.
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ensureLearnerAction, resetProfileAction } from "@/app/actions";
import { AppHeader } from "@/components/app-header";
import { ChatTimeline } from "@/components/chat-timeline";
import { ContextPanel } from "@/components/context-panel";
import {
  type ComposerStatus,
  MessageComposer,
} from "@/components/message-composer";
import { ResetConfirmationDialog } from "@/components/reset-confirmation-dialog";
import { StatusNotice } from "@/components/status-notice";
import type {
  ChatMessage,
  QuizAttemptSummary,
  StudyPlanSummary,
} from "@/lib/types";

/**
 * Stands in for the streamed Eve reply. Milestone 2 replaces this timer with a
 * real streamed agent response; until then it exists so the sending and
 * appended-reply states are demonstrable without a model.
 */
const LOCAL_REPLY_DELAY_MS = 600;

const PLACEHOLDER_REPLY =
  "Placeholder reply — Eve is not connected yet. Milestone 2 replaces this with a streamed tutoring response. For now, everything you send stays in this browser.";

interface LearningCoachProps {
  /** The learner's own records from Neon Postgres, newest first. */
  initialPlans: StudyPlanSummary[];
  latestAttempt: QuizAttemptSummary | null;
  /** Safe, secret-free message when the database could not be read. */
  dbError: string | null;
  /** True on a first visit without a profile cookie: create it once. */
  needsProfile: boolean;
}

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
  initialPlans,
  latestAttempt,
  dbError,
  needsProfile,
}: LearningCoachProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isDbErrorDismissed, setIsDbErrorDismissed] = useState(false);
  const [draft, setDraft] = useState("");
  const [composerStatus, setComposerStatus] = useState<ComposerStatus>("idle");
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isBootstrapping, startBootstrap] = useTransition();

  const composerRef = useRef<HTMLTextAreaElement>(null);
  const replyTimerRef = useRef<number | null>(null);
  const bootstrapStartedRef = useRef(false);

  const activeTopic = initialPlans[0]?.topic ?? "No topic yet";
  const databaseAvailable = dbError === null;

  // First visit: create the anonymous profile (server-set cookie plus
  // `learners` row), then reload the server records for this profile.
  useEffect(() => {
    if (!needsProfile || bootstrapStartedRef.current) {
      return;
    }
    bootstrapStartedRef.current = true;
    startBootstrap(async () => {
      await ensureLearnerAction();
      router.refresh();
    });
  }, [needsProfile, router]);

  // Abandon a pending placeholder reply if the island unmounts mid-flight.
  useEffect(() => {
    return () => {
      if (replyTimerRef.current !== null) {
        window.clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  function appendMessage(message: ChatMessage) {
    setMessages((current) => [...current, message]);
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

  async function handleResetConfirm() {
    setIsResetting(true);
    setResetError(null);
    const result = await resetProfileAction();
    setIsResetting(false);
    if (!result.ok) {
      setResetError(result.message);
      return;
    }
    if (replyTimerRef.current !== null) {
      window.clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
    setMessages([]);
    setDraft("");
    setComposerStatus("idle");
    setIsResetOpen(false);
    router.refresh();
  }

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <AppHeader
        topic={activeTopic}
        onResetRequest={() => setIsResetOpen(true)}
      />

      {dbError === null || isDbErrorDismissed ? null : (
        <StatusNotice
          title="Database unavailable"
          message={dbError}
          onDismiss={() => setIsDbErrorDismissed(true)}
        />
      )}

      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4 overflow-y-auto px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[minmax(0,1fr)] lg:gap-6 lg:overflow-hidden lg:py-6">
        <section
          aria-labelledby="conversation-heading"
          className="flex min-h-0 flex-col"
        >
          <h2 id="conversation-heading" className="sr-only">
            Conversation
          </h2>
          {isBootstrapping ? (
            <p aria-live="polite" className="py-2 text-sm text-muted">
              Setting up your anonymous profile…
            </p>
          ) : null}
          <ChatTimeline messages={messages} onSelectStarter={fillComposer} />
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
          plans={initialPlans}
          latestAttempt={latestAttempt}
          databaseAvailable={databaseAvailable}
        />
      </main>

      <ResetConfirmationDialog
        open={isResetOpen}
        isResetting={isResetting}
        error={resetError}
        onDismiss={() => {
          if (!isResetting) {
            setIsResetOpen(false);
            setResetError(null);
          }
        }}
        onConfirm={handleResetConfirm}
      />
    </div>
  );
}
