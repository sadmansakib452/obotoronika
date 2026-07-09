# Obotoronika Workspace

## Workspace Structure

```
obotoronika/                  ← workspace root
├── AGENTS.md                 ← workspace rules (this file)
├── opencode.json             ← opencode configuration
├── .opencode/
│   ├── agents/               ← custom subagents
│   ├── commands/             ← custom commands
│   ├── memory/               ← persistent memory (knowledge, progress, learning)
│   │   ├── MEMORY.md         ← memory index
│   │   ├── project-knowledge.md ← full project overview
│   │   ├── progress.md       ← current state, pending work, blockers
│   │   └── learning-log.md   ← mistakes & solutions tracker
│   └── skills/               ← reusable skills (new-endpoint, security-review)
└── web-obotoronika/          ← main Nuxt 3 e-commerce project (reference: @web)
```

## Key References

- **@web** — Main project. Always use `@web` to reference files under `web-obotoronika/`.
- Memory files in `.opencode/memory/` are auto-loaded via instructions.

## Project Overview (web-obotoronika)

- **Framework:** Nuxt 3.15.4 + Nitro 2.10.4 (file-based server engine, compatibilityVersion 4)
- **UI:** `@nuxt/ui` v2.21.0 with `ui.global: false` → ALL UI components imported from `#components`
- **Auth:** `@nuxtjs/supabase` (1.4.6) with PKCE flow, `useSsrCookies: true`
- **State:** Pinia (auto-imports from `app/stores/`)
- **Styling:** Tailwind CSS via `@nuxtjs/tailwindcss`
- **Validation:** Zod schemas on both client and server
- **Hosting:** NuxtHub / Cloudflare (edge-ready)
- **Payment:** SSLCommerz (Bangladeshi payment gateway)
- **Database:** Supabase (PostgreSQL) with 53 migrations, RPC functions for business logic

## Communication

- User prefers **Bengali** for conversation
- All code, comments, commit messages stay in **English**
- Be concise — no unnecessary summaries

---

## Workflow Rules

These rules apply to all work in this workspace.

### 1. Chapter-by-Chapter Planning
- Break into chapters/modules before coding
- Propose → user revises → finalized
- Each chapter: goal, DB changes, API endpoints, test plan, performance notes
- If a chapter grows too large during planning, split it into sub-chapters

### 2. Step-by-Step Execution
- NEVER implement everything at once
- One step at a time: propose → wait for "proceed" → code → verify → next step
- Each step = one logical unit (DTO, handler, RPC, test file)
- If a step fails verification: roll back, fix root cause, then re-propose
- After each step, summarize what was done and what's next

### 3. Error-First Mindset
- Before writing any implementation code: list all possible error cases first
- Consider: input validation, auth failures, business logic errors, external service failures, race conditions
- Write error handling BEFORE the success path
- Every error must have: proper HTTP status code, i18n message key (where applicable), and debug context data

### 4. Senior-Level Code Quality
- Every implementation must be optimized (no N+1 in RPCs, proper indexes, Cloudflare cache where needed)
- Follow clean code: meaningful names, single responsibility, no magic values (use enums/constants)
- Follow project patterns exactly: 5-step API handler, checkUserRole guard, RPC functions, envelope response
- No shortcuts, no premature abstractions
- **Self-review before presenting**: check for dead code, console.log, unused imports, naming consistency, error handling coverage. Only present polished code.

### 5. Ask Permission Before Coding
- Never write code without explicit approval
- Propose your plan → user says "yes proceed" or equivalent → then code
- Exception: fixing critical bugs that block the user's work

### 6. Built-in Performance (Not Optional)
- Check for N+1 queries in every Supabase RPC function (JOINs, nested subqueries)
- Add database indexes for frequently queried fields (use `EXPLAIN ANALYZE` to verify)
- Always paginate list endpoints (limit/offset in RPC functions)
- Use `.select()` to fetch only needed columns, avoid `SELECT *` in RPCs
- Use `supabaseAdmin` (service_role) client for admin operations, not user-level client
- Leverage NuxtHub cache for read-heavy, infrequently changing data

### 7. Built-in Testing
- Generate tests (Vitest) alongside every API handler and utility function
- Test coverage: happy path, all error cases, edge cases (empty, null, boundary values)
- At minimum: each handler should have 2-3 test cases covering different scenarios
- Test file naming: `{target}.spec.ts` (e.g., `refunds.get.spec.ts`)
- Mock Supabase client with `vi.mock()` when testing handlers in isolation
- **Always run tests and confirm they pass** before declaring a step complete

### 8. Incremental Delivery (30-40% per Session)
- Default: implement 30-40% of a chapter per session, then stop
- Implement a focused portion, verify it works, save progress
- Use memory files to persist what's done and what's next
- Next session: load memory → continue seamlessly
- **Exception**: user can explicitly say "continue, more today" to extend beyond 40%

### 9. Chapter-Wise Commit Reminder
- When a chapter/step is finished, tested, and user confirms it's ready: remind them to commit
- Provide a clear, descriptive commit message summarizing exactly what was done in that chapter
- Let the user run the commit themselves — just remind + suggest message
- Never commit automatically; the user owns the git history

### 10. Progress Persistence
- After each coding session, update `progress.md` in `.opencode/memory/`
- Save: what was implemented, what's pending, blockers encountered, key decisions made, next step
- After saving, ask user to confirm the progress summary is accurate
- This ensures you can pick up exactly where you left off

### 11. Existing System Analysis (Pre-Implementation)
- Before implementing any new feature:
  a. Search/grep to check if similar functionality already exists in `@web`
  b. Read the existing implementation — understand patterns, naming, structure
  c. Check if the new feature will break existing systems
  d. Propose a decision: extend existing code / modify it / create new
  e. Risk assessment: what problems may arise and what solutions exist
- Do not start implementation until user approves

### 12. Database Design Phase
- When a new feature is detected, check if DB design is needed
- If needed: propose the full schema — tables, relationships, indexes, enums, constraints
- After approval: create a new Supabase SQL migration
  → `supabase migration new description` → edit the generated `.sql` file → `supabase db push`
- **Include a rollback strategy** for every migration (DROP/ALTER statements to revert)
- Do not start API implementation until DB design is finalized and migration succeeds
- Small changes (single nullable field add) → skip DB design phase, go straight to implementation

### 13. Communication
- User prefers **Bengali** for conversation
- All code, comments, commit messages stay in **English**
- Be concise — no unnecessary summaries of what you just did

### 14. Security Review
- Every new endpoint must have a proper auth layer — check:
  a. Public endpoint? → no auth needed (rare)
  b. JWT required? → `getServerSupabase(event)` called in handler
  c. Role required? → `checkUserRole(supabase, ['super_admin', ...])` present
  d. Admin-only operation? → use `supabaseAdmin` (service_role) client, not user-level client
- Check: input sanitization via Zod schemas, rate limiting, SQL injection prevention in RPC functions
- Never expose internal IDs (auto-increment IDs), secrets, or sensitive data in API responses
- SSLCommerz: validate signature in IPN handler, verify original transaction before refund

### 15. Environment & Configuration
- If a new feature needs environment variables:
  a. Add to `.env.example` with placeholder values
  b. Register in `nuxt.config.ts` → `runtimeConfig` block (server-side) or `runtimeConfig.public` (client-side)
  c. Set safe defaults for local development
- Never hardcode environment-specific values (URLs, secrets, API keys) in code

### 16. Error Recovery (When Things Go Wrong)
- If implementation fails at any point (migration error, test failure, unexpected behavior):
  a. **Stop immediately** — never continue with a broken state
  b. Analyze root cause before proposing a fix
  c. Report to user: what happened, why, proposed solution
  d. Get approval before applying the fix
- For DB migrations: always have the rollback ready before running forward

### 17. API Documentation (Redocly / OpenAPI)
- New endpoints need a registry entry in `server/docs/registry.chapter*.ts`
- Request body validation → use Zod schemas via `requestBodyZod`
- Query params → use Zod schemas via `queryZod` or plain `queryParams`
- Response data → add `responseDataJsonSchema` for the "data" envelope
- Auth-required endpoints → set `requiresAuth: true` in registry
- Verify docs render correctly at `/docs` (dev server only)
