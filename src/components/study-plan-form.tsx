/**
 * Create-study-plan form. Rendered inside the client boundary declared in
 * `learning-coach.tsx`.
 *
 * The form posts to a Server Action, so the learner ID is resolved from the
 * server-set cookie — the topic, goal, and study time are the only values that
 * travel from the browser, and each is validated again on the server. Inputs
 * are uncontrolled, so typed text survives a failed submission; the form
 * resets only after a confirmed save.
 */

"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import type { CreateStudyPlanState } from "@/app/actions";
import { createStudyPlanAction } from "@/app/actions";

/**
 * Local initial state. It lives here rather than in `src/app/actions.ts`
 * because a `"use server"` module must only export async functions — any
 * other value import resolves to `undefined` in the client bundle.
 */
const initialCreateStudyPlanState: CreateStudyPlanState = {
  ok: false,
  message: "",
  errors: {},
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (message === undefined) {
    return null;
  }
  return (
    <p id={id} role="alert" className="mt-1 text-xs font-medium text-danger">
      {message}
    </p>
  );
}

export function StudyPlanForm() {
  const [state, formAction, isPending] = useActionState(
    createStudyPlanAction,
    initialCreateStudyPlanState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      successRef.current?.focus();
      router.refresh();
    }
  }, [state, router]);

  return (
    <section
      aria-labelledby="study-plan-form-heading"
      className="rounded-card border border-border bg-surface p-4"
    >
      <h2 id="study-plan-form-heading" className="text-sm font-semibold">
        Create a study plan
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Saved to your anonymous browser profile. A topic, a goal, and your
        available study time are required.
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="mt-3 flex flex-col gap-3"
      >
        <div>
          <label
            htmlFor="plan-topic"
            className="block text-xs font-semibold tracking-wide uppercase"
          >
            Topic
          </label>
          <input
            id="plan-topic"
            name="topic"
            type="text"
            autoComplete="off"
            maxLength={200}
            aria-invalid={state.errors.topic !== undefined}
            aria-describedby={
              state.errors.topic !== undefined ? "plan-topic-error" : undefined
            }
            placeholder="Spanish preterite tense"
            className="mt-1 w-full rounded-card border border-border bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-accent"
          />
          <FieldError id="plan-topic-error" message={state.errors.topic} />
        </div>

        <div>
          <label
            htmlFor="plan-goal"
            className="block text-xs font-semibold tracking-wide uppercase"
          >
            Goal
          </label>
          <textarea
            id="plan-goal"
            name="goal"
            rows={2}
            maxLength={500}
            aria-invalid={state.errors.goal !== undefined}
            aria-describedby={
              state.errors.goal !== undefined ? "plan-goal-error" : undefined
            }
            placeholder="Talk about last weekend for two minutes without slipping into the present tense."
            className="mt-1 w-full resize-y rounded-card border border-border bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-accent"
          />
          <FieldError id="plan-goal-error" message={state.errors.goal} />
        </div>

        <div>
          <label
            htmlFor="plan-minutes"
            className="block text-xs font-semibold tracking-wide uppercase"
          >
            Available study time (minutes)
          </label>
          <input
            id="plan-minutes"
            name="availableMinutes"
            type="number"
            inputMode="numeric"
            min={1}
            max={1440}
            step={1}
            aria-invalid={state.errors.availableMinutes !== undefined}
            aria-describedby={
              state.errors.availableMinutes !== undefined
                ? "plan-minutes-error"
                : undefined
            }
            placeholder="60"
            className="mt-1 w-full rounded-card border border-border bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-accent"
          />
          <FieldError
            id="plan-minutes-error"
            message={state.errors.availableMinutes}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save study plan"}
          </button>
          <p aria-live="polite" className="text-xs text-muted">
            {isPending ? "Saving your plan…" : ""}
          </p>
        </div>

        {state.message.length > 0 ? (
          <p
            ref={successRef}
            tabIndex={-1}
            role={state.ok ? "status" : "alert"}
            className={`text-sm font-medium outline-none ${state.ok ? "text-success" : "text-danger"}`}
          >
            {state.ok ? "✓ " : ""}
            {state.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
