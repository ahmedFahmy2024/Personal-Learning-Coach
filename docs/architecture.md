# Learning Coach — Architecture

## System boundary

The MVP is one Next.js App Router project. Eve runs inside that project and
provides the durable agent endpoint. The browser is the only user channel.

```text
Browser UI
  ├─ HTTP-only cookie: anonymous learner ID
  ├─ Next.js server actions and route handlers
  │    └─ Neon Postgres through Drizzle ORM
  └─ same-origin Eve web-chat route
         ├─ instructions.md: tutoring identity and boundaries
         ├─ skills/: study-plan and quiz playbooks
         └─ tools/: typed, deterministic score calculation
                └─ AI Gateway: one model request per user interaction
```

## Planned repository shape

```text
src/
  app/                  # Next.js pages and routes
  components/           # Presentational and interactive UI
  db/                   # Drizzle schema, connection, migrations, repositories
  lib/                  # Shared types and browser-safe helpers
agent/
  instructions.md       # Eve agent identity and guardrails
  skills/               # On-demand Markdown playbooks
  tools/                # TypeScript tools callable by the agent
docs/                   # Project source-of-truth documents
```

The exact Eve route and React integration will follow the documentation that
ships with the installed `eve` package. Do not guess its configuration.

## Data ownership

| Data | Owner | Persistence | Reason |
| --- | --- | --- | --- |
| Anonymous learner ID | Server and browser | HTTP-only cookie | Scopes data without sign-in |
| Study plan | Neon Postgres | `study_plans` table | Survives refresh and redeploys |
| Quiz answers and score | Neon Postgres | `quiz_attempts` table | Keeps real attempt history |
| Agent workflow/session state | Eve runtime | Eve-managed | Supports durable streamed sessions |
| Model credentials | Server environment only | Vercel environment variables | Never expose credentials to the browser |

## Boundaries and safety

- The model may explain, plan, and write quiz content; it must not calculate a
  submitted score itself when the score tool can do so.
- The score tool accepts validated choices and returns a reproducible result.
- The server creates the learner ID and stores it in a secure, HTTP-only,
  same-site cookie. Route handlers and server actions derive ownership from the
  cookie. The client never supplies a learner ID.
- `DATABASE_URL` remains server-only. The browser never receives a connection
  string or database credentials.
- The initial agent has no shell, file-write, web-browsing, connector, or
  subagent capability.

## Later, deliberately deferred

Authentication can add cross-device access later. It must replace the anonymous
learner ID with an authenticated user ID before it exposes saved data across
devices.
