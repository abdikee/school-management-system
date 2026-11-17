# Agent Operating Guide

This file defines the required behavior for coding agents working in this repository.

## Read first

Before planning or editing:

- Read `CLAUDE.md`.
- Read the relevant requirements in `srs.md`.
- Read the relevant architecture section in `sdd.md`.
- Find the task ID and acceptance checks in `task.md`.
- Check `git status` and preserve unrelated worktree changes.

The SRS is the behavior source of truth. The SDD is the architecture source of truth. `task.md` is the execution and release-gate source of truth. `plan.md` is a progress summary, not a replacement for the requirements.

## Repository scope

This is a NestJS 10 + Prisma + PostgreSQL backend and a React 19 + Vite + TypeScript + Tailwind + TanStack Query frontend for an Ethiopian Grades 9-12 school MIS.

The active roles are:

- `ADMIN`
- `TEACHER`
- `STUDENT`
- `PARENT`

The target specification also includes principal, academic director, registrar, accountant/cashier, and support responsibilities. Do not add a new role or permission model without checking the SRS and current Prisma schema.

## Implementation requirements

### Backend

- Place domain code in `backend/src/modules/<module>`.
- Use controller, service, DTO, policy, and test boundaries.
- Validate all request bodies, params, and query values.
- Enforce authorization in the backend, including record ownership and relationship scope.
- Use transactions for admission, enrollment, result approval/publication, promotion, payment, refund, and other multi-record workflows.
- Preserve historical academic, financial, enrollment, audit, and published-result data.
- Add audit events for important mutations without recording passwords, tokens, or unnecessary personal data.
- Keep reports read-only.
- Add Prisma migrations for schema changes; never rely on an undocumented manual database edit.
- Update Swagger metadata when adding or changing endpoints.

### Frontend

- Use `frontend/src/services/api.ts` for API access.
- Update `frontend/src/types/api.ts` when contracts change.
- Use TanStack Query keys containing all request filters.
- Invalidate affected queries after successful mutations.
- Use shared layouts, route guards, UI components, and design tokens.
- Provide loading, empty, error, success, responsive, and accessible states.
- Never rely on UI hiding for security.
- Do not use fake, random, or local-only data for active product behavior.

## Security rules

Agents must treat the following as release-blocking defects:

- A parent can access an unrelated student.
- A student can access another student's records.
- A teacher can access an unassigned class or subject.
- An unpublished result is visible to a student or parent.
- A confirmed payment can be silently deleted or duplicated.
- A private file can be downloaded without authorization.
- Secrets or production data are committed.

Use explicit errors for invalid or unsupported operations. Do not silently default, swallow errors, or claim external delivery succeeded when no provider is configured.

## Task and status discipline

Before work:

1. Locate the task ID in `task.md`.
2. Check dependencies and the relevant gate.
3. Record an implementation plan in the conversation or session state.

After work:

1. Run focused tests and checks.
2. Run backend build/typecheck or frontend typecheck/build/lint as applicable.
3. Update task checkboxes only for verified acceptance checks.
4. Update `plan.md` when a phase or release status changes.
5. Record blockers explicitly instead of marking incomplete work done.

Do not call a module complete merely because its UI route renders. Completion requires backend behavior, authorization, validation, auditability, tests, acceptance checks, documentation, and realistic data verification.

## Validation commands

Backend, from `backend/`:

```bash
npm run build
npx tsc --noEmit
npm run lint
npm run test
npm run test:e2e
```

Frontend, from `frontend/`:

```bash
npm run typecheck
npm run build
npm run lint
```

Run the smallest command that covers the change first, then broaden validation when failures or shared contracts justify it.

## Change boundaries

- Do not reset, checkout, clean, or discard unrelated changes.
- Do not commit secrets, credentials, database dumps, or private user data.
- Do not add Docker files or Docker instructions; Docker support was intentionally removed.
- Do not add external dependencies unless the manifest is updated and the dependency is required.
- Do not introduce a new architecture pattern when an existing repository pattern works.
- Keep changes surgical and explain necessary deviations.

## Definition of done

A change is ready only when:

- It satisfies the applicable SRS requirement.
- It follows the SDD module and data-scope rules.
- It has server-side validation and authorization.
- It handles errors and edge cases explicitly.
- It includes focused tests or documents why testing is blocked.
- Relevant builds, typechecks, lint, and migrations pass.
- API/UI documentation and task status are updated.
- No release blocker is introduced.

