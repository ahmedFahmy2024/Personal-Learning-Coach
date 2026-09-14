<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## OpenSrc reference

Before implementing a feature that uses Vercel Eve, consult the relevant current documentation at [opensrc.sh](https://opensrc.sh). Treat that documentation as the source of truth for Eve APIs, conventions, and configuration; use training-data knowledge only as context, not as an implementation authority.

Before using any dependency declared in `package.json`, inspect its source through OpenSrc at the version resolved for this project. If the `opensrc` CLI is unavailable, install it with `npm install -g opensrc`. Fetch an uncached dependency with `opensrc fetch --cwd . <package>`; `opensrc path --cwd . <package>` also fetches it on cache miss. Use the resolved source path in inspection commands, for example: `rg "pattern" $(opensrc path --cwd . <package>)`.

# 2. Workflow

For every implementation request:

1. Read `AGENTS.md`.
2. Read the skills explicitly mentioned by the user.
3. Read clearly needed supporting skills from the approved skill list.
4. Inspect relevant code.
5. Ask a focused question only if the task has meaningful ambiguity.
6. Create a detailed prompt file in `prompts/`.
7. Ask: `I prepared the implementation prompt at prompts/<file-name>.md. Is this good to execute?`
8. Implement only after user approval.
9. Run available checks.
10. Share exact steps to test or run the completed feature.

Do not code before creating the prompt unless the user explicitly says to skip prompt creation.

---

# 3. Skills

Use only these skills:

- `.agents/skills/clerk`
- `.agents/skills/supabase`
- `.agents/skills/oxylabs-web-scraper`
- `.agents/skills/ai-sdk`

Use them for:

- `node_modules/next/dist/docs/`: Next.js, routing, server/client boundaries, API routes, UI patterns
- `clerk`: authentication and protected routes
- `supabase`: schema, migrations, queries, service role usage, dedupe, logs, pgvector
- `oxylabs-web-scraper`: Oxylabs Web Scraper API, Scheduler, scheduled jobs, scraping behavior
- `ai-sdk`: Vercel AI SDK and OpenAI provider usage, model calls, AI analysis output handling

Do not invent new skills.

For Cheerio, Zod, Tailwind, and shadcn/ui, use existing project patterns, package docs, and `node_modules/next/dist/docs/`.

---

# 4. Prompt files

Prompt files live in the `prompts/` directory. Use names like:

- `prompts/oxylabs-scraping.md`
- `prompts/oxylabs-scheduler.md`
- `prompts/ai-analysis.md`
- `prompts/news-details-page-ui.md`

Each prompt must include:

- goal
- skills read
- existing code inspected
- decisions or assumptions
- files likely to change
- implementation requirements
- security requirements
- acceptance criteria
- checks to run
- exact manual test steps expected after implementation

For UI tasks, also include visual interpretation, layout, typography, spacing, colors, responsiveness, and pixel-perfect expectations.

---

# 22. Commands and checks

"Run available checks" (sections 2 and 21) means running these from the project root and reporting the results:

- `pnpm run typecheck` â€” TypeScript, no emit (`tsc --noEmit`)
- `pnpm run lint` â€” ESLint (`eslint`)
- `pnpm run build` â€” Next.js production build, only when the change could affect the build

Development and runtime:

- `pnpm run dev` â€” start the Next.js dev server; watch its terminal for scrape and analysis logs (section 17)
- `pnpm run start` â€” run the production build locally after `pnpm run build`

After implementation, run `typecheck` and `lint` at minimum. Add `build` when routes, config, or server modules changed. Report the exact command output; do not claim a check passed without running it.
