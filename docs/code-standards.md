# Learning Coach — Code Standards

## General

- Use TypeScript throughout; avoid `any`.
- Keep domain types in one clear location and validate data at boundaries.
- Prefer small, named functions over implicit, tightly coupled logic.
- Keep application behavior deterministic where it can be: especially scoring,
  state migration, and input validation.

## Next.js

- Use the App Router.
- Default to Server Components; add `"use client"` only for browser state,
  events, or hooks.
- Keep secrets in server-only environment variables.
- Do not call an AI provider from a Client Component.

## Eve

- Agent behavior belongs in `agent/instructions.md` and focused skills.
- Tool inputs must use a Zod schema; tool output must be JSON-serializable.
- Write tools for deterministic actions, not vague model decisions.
- Read the bundled Eve documentation before changing Eve configuration.

## UI and accessibility

- Use semantic elements and native controls first.
- Every interactive control needs an accessible name and visible keyboard focus.
- Do not rely on color alone to communicate quiz correctness or errors.

## Verification

Before declaring a change complete, run the smallest relevant check and, for
meaningful UI changes, manually exercise the affected interaction.
