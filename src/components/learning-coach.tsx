/**
 * The one client boundary in the app.
 *
 * `docs/code-standards.md` asks for `"use client"` only where browser state,
 * events, or hooks are needed, so this island owns the conversation draft, the
 * Eve chat session, the reset dialog, and the profile bootstrap — while study
 * plans and quiz results render from the server-provided database records and
 * are never kept in client state. Conversation persistence is Eve-owned; the
 * browser never stores the transcript or a learner ID.
 */

"use client";

import { useEveAgent } from "eve/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ensureLearnerAction, resetProfileAction } from "@/app/actions";
import { AppHeader } from "@/components/app-header";
import { ChatTimeline, eveMessageText } from "@/components/chat-timeline";
import { ContextPanel } from "@/components/context-panel";
import {
  type ComposerStatus,
  MessageComposer,
} from "@/components/message-composer";
import { ResetConfirmationDialog } from "@/components/reset-confirmation-dialog";
import { StatusNotice } from "@/components/status-notice";
import type { QuizAttemptSummary, StudyPlanSummary } from "@/lib/types";

interface LearningCoachProps {
  /** The learner's own records from Neon Postgres, newest first. */
  initialPlans: StudyPlanSummary[];
  latestAttempt: QuizAttemptSummary | null;
  /** Safe, secret-free message when the database could not be read. */
  dbError: string | null;
  /** True on a first visit without a profile cookie: create it once. */
  needsProfile: boolean;
}

const SEND_FAILED_MESSAGE =
  "Could not reach the Learning Coach. Check your connection and try again — your message was kept.";

const TURN_FAILED_MESSAGE =
  "The reply was interrupted before it finished. Your message is still in the conversation — retry to ask again.";

export function LearningCoach({
  initialPlans,
  latestAttempt,
  dbError,
  needsProfile,
}: LearningCoachProps) {
  const router = useRouter();
  // Same-origin Eve routes (`/eve/v1/*`, mounted by `withEve`). No host, no
  // credentials, and no learner ID leave the browser: the session is anonymous
  // and lives only for this page lifetime.
  const agent = useEveAgent();
  const [isDbErrorDismissed, setIsDbErrorDismissed] = useState(false);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isBootstrapping, startBootstrap] = useTransition();

  const composerRef = useRef<HTMLTextAreaElement>(null);
  const bootstrapStartedRef = useRef(false);

  const activeTopic = initialPlans[0]?.topic ?? "No topic yet";
  const databaseAvailable = dbError === null;

  const agentStatus = agent.status;
  const isBusy =
    agentStatus === "submitted" ||
    agentStatus === "streaming" ||
    agentStatus === "resuming";
  const isStreaming = agentStatus === "streaming";
  const isTurnFailed = agentStatus === "error";

  const composerStatus: ComposerStatus =
    agentStatus === "submitted"
      ? "sending"
      : agentStatus === "streaming"
        ? "streaming"
        : agentStatus === "resuming"
          ? "resuming"
          : "idle";

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

  async function sendText(text: string) {
    setSendError(null);
    try {
      await agent.send(text);
    } catch {
      // The turn never started, so nothing reached the timeline: hand the
      // exact text back to the composer instead of losing it.
      setDraft(text);
      setSendError(SEND_FAILED_MESSAGE);
      composerRef.current?.focus();
    }
  }

  function handleSubmit() {
    const text = draft.trim();
    if (text.length === 0 || isBusy) {
      return;
    }
    setDraft("");
    void sendText(text);
  }

  function handleRetry() {
    if (isBusy) {
      return;
    }
    // Re-ask the most recent user message as a fresh turn.
    const messages = agent.data.messages;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const candidate = messages[index];
      if (candidate.role === "user") {
        const text = eveMessageText(candidate).trim();
        if (text.length > 0) {
          void sendText(text);
          return;
        }
      }
    }
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
    agent.reset();
    setDraft("");
    setSendError(null);
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
          <ChatTimeline
            messages={agent.data.messages}
            isStreaming={isStreaming}
            onSelectStarter={fillComposer}
          />
          {sendError === null && !isTurnFailed ? null : (
            <div
              role="alert"
              className="mt-3 rounded-card border border-danger/40 bg-danger-surface p-3 text-sm"
            >
              <p className="leading-relaxed">
                <span className="font-semibold">Message not delivered: </span>
                {sendError ?? TURN_FAILED_MESSAGE}
              </p>
              <button
                type="button"
                onClick={sendError === null ? handleRetry : handleSubmit}
                disabled={isBusy}
                className="mt-2 rounded-full border border-border bg-surface px-3 py-1 text-sm font-medium transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          )}
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
