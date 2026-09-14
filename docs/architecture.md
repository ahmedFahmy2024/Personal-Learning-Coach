# Learning Coach — Architecture

## System boundary

The MVP is one Next.js App Router project. Eve runs inside that project and
provides the durable agent endpoint. The browser is the only user channel.

```text
Browser UI
  ├─ localStorage: active chat, plan, recent quiz results
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
  lib/                  # Shared types and browser persistence helpers
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
| Chat display state | Browser | `localStorage` | No account or database needed |
| Study plan | Browser | `localStorage` | User can resume locally |
| Quiz answers and score | Browser | `localStorage` | Scores are personal and local |
| Agent workflow/session state | Eve runtime | Eve-managed | Supports durable streamed sessions |
| Model credentials | Server environment only | Vercel environment variables | Never expose credentials to the browser |

## Boundaries and safety

- The model may explain, plan, and write quiz content; it must not calculate a
  submitted score itself when the score tool can do so.
- The score tool accepts validated choices and returns a reproducible result.
- Browser persistence contains no secrets and must be treated as user-editable.
- The initial agent has no shell, file-write, web-browsing, connector, or
  subagent capability.

## Later, deliberately deferred

Authentication plus a database can replace local storage when cross-device
history becomes a goal. This is not part of the MVP.
