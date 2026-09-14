# Learning Coach — Build Plan

## Milestone 0 — Foundation

- Keep the generated Next.js project healthy.
- Replace the starter screen with the static Learning Coach shell.
- Add shared domain types for a study plan, quiz, quiz answer, and result.
- Implement local-only persistence with a versioned `localStorage` key.

**Done when:** a user can navigate the interface with sample data and refresh
without losing that local sample state.

## Milestone 1 — Eve integration

- Install `eve` and read the documentation bundled with that installed version.
- Create the minimal `agent/instructions.md`.
- Add Eve's supported Next.js integration and web-chat client.
- Configure a low-cost model through AI Gateway and an explicit session output
  limit.

**Done when:** the browser receives a streamed tutoring response from Eve.

## Milestone 2 — Study-plan and quiz behavior

- Add a study-plan skill that produces a structured, achievable plan.
- Add a quiz skill that produces short multiple-choice quizzes.
- Add a typed scoring tool and render feedback in the UI.

**Done when:** a learner can complete one five-question quiz and get an
accurate score plus explanations.

## Milestone 3 — Quality pass

- Handle loading, empty, network-error, and invalid-storage states.
- Verify keyboard navigation and narrow-screen layouts.
- Add focused tests around scoring and persistence.
- Run formatting, linting, type checking, and a production build.

**Done when:** the MVP is usable locally and deployable to Vercel Hobby.

## Working rule

Complete and verify one milestone before expanding scope. A new integration or
service requires a concrete user benefit and a free-tier check first.
