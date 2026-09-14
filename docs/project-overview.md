# Learning Coach — Product Source of Truth

## Purpose

Learning Coach is a personal web app that helps one learner turn a topic into a
small study plan, practice with quizzes, and understand mistakes. It is a
learning project for Next.js and the Eve agent framework, not a public SaaS.

## MVP outcome

A learner can open the app, start a chat with a tutoring agent, ask for a
study plan or quiz, answer quiz questions, and see a session-level score.

## First-release capabilities

1. A responsive web-chat interface with streamed agent messages.
2. A learner supplies a topic, goal, and available time; the agent produces a
   concise study plan.
3. The agent creates multiple-choice quizzes for the selected topic.
4. Deterministic application code calculates quiz scores.
5. The browser preserves the active chat, plan, and recent quiz results with
   `localStorage`.

## Explicit non-goals

- Accounts, login, and multi-user data.
- A database, Redis, file uploads, external channels, or OAuth.
- Long-term memory shared between devices.
- Autonomous actions, paid integrations, and background schedules.
- Claims that generated content is academically authoritative.

## User journey

1. The learner chooses or types a topic.
2. They describe their goal and time available.
3. The agent proposes a plan; the learner can revise it through chat.
4. The learner asks for a quiz and submits answers.
5. The app shows the calculated score and the agent explains incorrect answers.

## Cost guardrails

The application must work within Vercel Hobby and AI Gateway's current free
allowance. The UI must keep messages short by default, cap generated quiz size,
and expose no features that silently cause repeated model calls. No paid
service is a requirement for the MVP.

## Document precedence

When documents conflict: this file defines *what* is built; `architecture.md`
defines *how data and services fit together*; `ui-spec.md` defines the user
experience; `build-plan.md` defines sequencing; and `code-standards.md`
defines implementation conventions.
