# Repository Instructions

This repository contains the Ethiopian High School Management Information System (HSMIS), a single-school Grades 9-12 web application.

## Source documents and precedence

Read these documents before making substantial changes:

1. `srs.md` - functional and non-functional requirements, business rules, acceptance criteria, release criteria, and definition of done.
2. `sdd.md` - target architecture, module boundaries, data-scope rules, API/UI design, and integration extension points.
3. `task.md` - executable task register, dependencies, acceptance gates, and production checklist.
4. `plan.md` - implementation progress summary; update it when phase scope or release status changes.
5. `.kiro/specs/` - focused design artifacts for individual fixes; apply only when the task matches that specification.

When documents conflict, prefer the SRS for required behavior, the SDD for architecture, and `task.md` for current execution status. Do not silently relax a requirement; record the decision in the task register or ask for clarification.

## Product scope

The target system is a configurable Ethiopian secondary-school MIS for Grades 9-12 with two semesters and annual results. Required roles include administrators, principals, academic directors, registrars, accountants/cashiers, teachers, students, parents/guardians, and support staff.

Core domains:

- Authentication, account lifecycle, password reset, sessions, and RBAC.
- Schools, academic years, semesters, grades, sections, subjects, streams, departments, and timetables.
- Admission, student records, guardians, enrollment, transfer, withdrawal, and promotion.
- Student and staff attendance, corrections, approvals, alerts, and reports.
- Assessments, examinations, marks, result calculation, report cards, and publication.
- Fees, invoices, discounts, scholarships, payments, receipts, refunds, reversals, and reconciliation.
- Messages, announcements, in-app notifications, optional email/SMS delivery, and notification history.
- Role-scoped dashboards, reports, exports, audit history, and global search.
- Future extension points: HR, library, discipline, counseling, inventory, calendar, and private files.

Business rules must be configurable. Do not hardcode grading scales, assessment weights, promotion rules, streams, fees, currency, school calendar, or notification policy.

## Current implementation status

Implemented or substantially implemented:

- NestJS backend with Prisma/PostgreSQL, Swagger, Helmet, CORS, validation, JWT authentication, refresh tokens, and role guards.
- Auth, users, academic, attendance, grades, finance, communication, reports, search, and audit foundation modules.
- React/Vite frontend with role-protected routes for Admin, Teacher, Student, and Parent.
- Shared settings with profile editing, password change, notification preferences, and profile photo upload.
- Role dashboards, charts, reports, exports, notification center, announcements, messaging, student communication, and global search.
- Local development with npm and PostgreSQL. Docker-related files and documentation have intentionally been removed.

Known release gaps:

- `srs.md` policy decisions are not all approved.
- Automated unit, integration, security, and end-to-end tests are not yet in the repository.
- Fine-grained permission storage and relationship policies need completion and test coverage.
- Admissions, formal enrollment history, semester/result/promotion workflows, examination lifecycle, and historical policy versioning need completion.
- Finance still needs receipts, discounts, refunds, reversals, reconciliation, idempotency, and optional payment-provider integration.
- Real email/SMS providers, private object storage, backups, monitoring, CI/CD, and production hosting remain incomplete.

Do not describe the system as production-ready until the release blockers and gates in `srs.md` and `task.md` pass.

## Technology and commands

### Backend

Run commands from `backend/`:

| Purpose | Command |
|---|---|
| Install | `npm install` |
| Development | `npm run start:dev` |
| Build | `npm run build` |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Unit tests | `npm run test` |
| Coverage | `npm run test:cov` |
| E2E tests | `npm run test:e2e` |
| Prisma generate | `npm run prisma:generate` |
| Development migration | `npm run prisma:migrate` |
| Production migration | `npm run prisma:migrate:prod` |
| Seed | `npm run prisma:seed` |
| Database push | `npm run db:push` |

### Frontend

Run commands from `frontend/`:

| Purpose | Command |
|---|---|
| Install | `npm install` |
| Development | `npm run dev` |
| Build | `npm run build` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Preview | `npm run preview` |

There are no Docker commands or Docker deployment files in this repository. Use local Node.js/npm and a configured PostgreSQL instance.

## Architecture rules

### Backend

- Use the modular monolith structure under `backend/src/modules`.
- Each module owns its controller, service, DTOs, policies, and tests.
- Controllers handle HTTP concerns only; business logic belongs in services.
- Use Prisma through `PrismaService`; use transactions for cross-entity workflows.
- Use DTOs with class-validator for all external input.
- Apply `@Roles()` and service-level scope checks; frontend visibility is never authorization.
- Use `@CurrentUser()` for identity and `@Public()` only for intentionally public routes.
- Keep approved results, confirmed payments, closed academic periods, enrollments, and audit records immutable by default.
- Reports may read data but must not mutate domain state.
- Do not call one controller from another.
- Do not return passwords, refresh tokens, private files, or unnecessary sensitive fields.
- Use explicit NestJS exceptions and repository-standard error handling. Do not hide failures with broad catches or success-shaped fallbacks.

### Frontend

- Use TanStack Query for server state and invalidate related query keys after mutations.
- Keep API calls in `frontend/src/services/api.ts`; keep shared contracts in `frontend/src/types/api.ts`.
- Use React Hook Form/Zod for complex forms where the existing module uses them.
- Every page needs loading, empty, error, success, and responsive states.
- Every protected page must use the shared layout and role-aware routing.
- Use the existing green design system, shadcn/ui components, glass surfaces, accessible labels, keyboard navigation, and confirmation for destructive actions.
- Do not place mock/random production data in active routes.
- Keep legacy pages out of navigation unless they are verified and intentionally supported.

## Data access and security

The backend is the source of truth. All access goes through `/api` REST endpoints. Scope data before querying or returning it:

- Admin: school-wide scope permitted by role.
- Teacher: assigned classes, subjects, and students.
- Student: own records only.
- Parent: verified linked students only.
- Finance staff: assigned finance scope.

Sensitive operations require authorization, validation, audit logging, and tests. Protect against privilege escalation, unrelated-parent access, cross-student access, unassigned-teacher access, duplicate payments, unpublished-result exposure, and private-file leakage.

Never commit secrets, real credentials, production data, or sensitive personal information. Use environment variables and `.env.example`.

## Required workflow for changes

1. Read the relevant sections of `srs.md`, `sdd.md`, and `task.md`.
2. Identify the task ID and its dependencies before editing.
3. Inspect existing patterns and API contracts.
4. Make the smallest complete change across schema, backend, frontend, tests, and docs as required.
5. Add or update focused tests for new behavior and authorization boundaries.
6. Run the smallest relevant validation, then the required build/typecheck/lint commands.
7. Update `task.md` only when acceptance checks pass; update `plan.md` when phase status changes.
8. Document migrations, integration requirements, and unresolved blockers.

Never mark a task `DONE` because a screen exists. The SRS definition of done requires implementation, validation, permissions, audit behavior, tests, acceptance checks, documentation, and realistic data verification.

## Naming and editing conventions

- Files: kebab-case.
- Classes/components: PascalCase.
- Variables/functions: camelCase.
- Enums: PascalCase.
- Database names: snake_case through Prisma mappings.
- Prefer precise, surgical edits; do not revert unrelated work.
- Use ASCII by default and add comments only for non-obvious logic.
- Do not modify or delete user changes without explicit approval.
