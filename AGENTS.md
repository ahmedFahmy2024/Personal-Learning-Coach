<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Learning Coach agent guide

## Dependency reference

Before implementing a feature that uses Eve, inspect the relevant current
documentation and resolved package source with OpenSrc. Treat it as the source
of truth for Eve APIs, conventions, and configuration; use model knowledge only
as context.

Before using a dependency declared in `package.json`, inspect its resolved
source through OpenSrc when its documentation or behavior materially affects the
change. If the `opensrc` CLI is unavailable, install it with
`npm install -g opensrc`. Fetch an uncached dependency with
`opensrc fetch --cwd . <package>`; `opensrc path --cwd . <package>` also fetches
on a cache miss. Use the resolved source path for inspection, for example:
`rg "pattern" $(opensrc path --cwd . <package>)`.

## Product boundaries

Build the personal Learning Coach defined in `docs/`. It is a single-user,
browser-first app for study plans, short quizzes, and understandable feedback.
The MVP uses Neon Postgres with an anonymous browser profile. It has no
accounts, OAuth, external channels, scraping, uploads, background schedules,
or paid services.

Read the relevant document before changing a related concern:

- `docs/project-overview.md` — product scope and non-goals
- `docs/architecture.md` — ownership, boundaries, and repository shape
- `docs/ui-spec.md` — interface states and interaction rules
- `docs/build-plan.md` — milestone sequence
- `docs/code-standards.md` — implementation conventions

Those documents are the project source of truth. Update the owning document in
the same change when a deliberate product or architecture decision changes.

## Workflow

1. Read this file, the relevant source-of-truth document, and the code that
   owns the behavior.
2. Read any user-named skill and the smallest applicable supporting skill.
3. State material assumptions; ask one focused question only when a choice
   would materially change the product or architecture.
4. Implement the smallest coherent, accessible change within the current
   milestone.
5. Run the checks that cover the changed surface and report their real result.
6. End with the outcome, changed files, and exact manual test steps.

Use a design note in `docs/` only for a durable decision that the existing
source-of-truth documents cannot own. Do not create a `prompts/` directory or
require a separate approval turn for ordinary implementation work.

## Next.js and Eve

- Before changing Next.js code, read the relevant installed Next.js guide under
  `node_modules/next/dist/docs/`, as required by the generated block above.
- Before writing or changing Eve files, read the `eve` skill and inspect Eve
  through OpenSrc. Once Eve is installed, also read
  `node_modules/eve/docs/README.md` plus the applicable bundled guide.
- Eve is not installed until Milestone 2. Do not create speculative Eve config
  or routes before it is installed and its bundled docs are available.
- Keep model credentials server-only. Use AI Gateway conservatively: bounded
  outputs, short quizzes, one intentional model action per user interaction.
- Agent instructions and skills govern tutoring behavior. TypeScript tools
  handle validated, deterministic work such as quiz scoring.

## Implementation rules

- Use TypeScript, App Router, and Tailwind already present in the project.
- Default to Server Components; use Client Components only for browser state,
  event handlers, or client hooks.
- Keep database access in server-only modules. Read the anonymous learner ID
  from the HTTP-only cookie. Never accept a learner ID from the client.
- Treat any browser state as editable, untrusted data. Validate it before use.
- Keep the initial agent least-privileged: no shell, file-write, web, connector,
  subagent, or scheduling capability.
- Build semantic, keyboard-accessible interfaces. Preserve typed text on an
  error, make loading and streaming states clear, and do not use color as the
  only correctness signal.

## Checks

Run checks from the repository root. Select the smallest relevant set, and run
the production build for route, configuration, server, or dependency changes:

- `pnpm exec tsc --noEmit` — TypeScript validation
- `pnpm lint` — Biome checks
- `pnpm build` — Next.js production build

Use `pnpm dev` for local manual testing. Report only commands actually run and
their result.
