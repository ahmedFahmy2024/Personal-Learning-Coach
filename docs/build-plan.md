# Learning Coach — Build Plan

## Milestone 0 — Foundation

- Keep the generated Next.js project healthy.
- Replace the starter screen with the static Learning Coach shell.
- Add shared domain types for a study plan, quiz, quiz answer, and result.
- Use temporary local state only to demonstrate the static interface.

**Done when:** a user can navigate the interface and exercise every static
state.

## Milestone 1 — Data foundation

- Create a Neon project on its Free plan.
- Add Drizzle ORM, the Neon serverless driver, and migration tooling.
- Add a server-only database connection and a committed Drizzle schema.
- Add `learners`, `study_plans`, and `quiz_attempts` tables with foreign keys,
  timestamps, and indexes for the planned learner-scoped queries.
- Issue an anonymous learner ID through an HTTP-only cookie. Create the learner
  record on first use.
- Replace all sample plans and quiz results with database-backed empty states
  and user-created records.
- Add `.env.example` with `DATABASE_URL` and no real credentials.

**Done when:** a learner can create a real study plan, refresh the page, and
see the same plan from Neon Postgres. No visible screen uses dummy data.

## Milestone 2 — Eve integration

- Install `eve` and read the documentation bundled with that installed version.
- Create the minimal `agent/instructions.md`.
- Add Eve's supported Next.js integration and web-chat client.
- Configure a low-cost model through AI Gateway and an explicit session output
  limit.

**Done when:** the browser receives a streamed tutoring response from Eve.

## Milestone 3 — Study-plan and quiz behavior

- Add a study-plan skill that produces a structured, achievable plan.
- Add a quiz skill that produces short multiple-choice quizzes.
- Add a typed scoring tool and render feedback in the UI.

**Done when:** a learner can complete one five-question quiz and get an
accurate score plus explanations.

## Milestone 4 — Quality pass

- Handle loading, empty, network-error, and invalid-storage states.
- Verify keyboard navigation and narrow-screen layouts.
- Add focused tests around scoring and persistence.
- Run formatting, linting, type checking, and a production build.

**Done when:** the MVP is usable locally and deployable to Vercel Hobby.

## Working rule

Complete and verify one milestone before expanding scope. A new integration or
service requires a concrete user benefit and a free-tier check first.
