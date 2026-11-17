# High School Management Information System
# Production Implementation Plan

**Source documents:** `srs.md` Version 1.0 and `sdd.md` Version 1.0
**Project type:** Single-school Ethiopian Grades 9-12 management system
**Architecture:** NestJS modular monolith, React frontend, PostgreSQL
**Plan status:** Production execution baseline

---

## 1. Plan purpose

This plan converts the requirements in `srs.md` and the design in `sdd.md` into an ordered delivery program.

The team must follow the dependency order below. A phase is not complete because screens exist; it is complete only when its data model, backend rules, frontend behavior, authorization, audit coverage, tests, documentation and acceptance criteria are complete.

### Mandatory delivery order

```text
Foundation
  -> Academic configuration
  -> Student lifecycle
  -> Teacher assignments and attendance
  -> Assessments and results
  -> Finance
  -> Portals and communication
  -> Administration extensions
  -> Analytics and production hardening
  -> User acceptance and release
```

---

## 2. Current baseline

### 2.1 Implemented foundation

- React/Vite frontend and NestJS/Prisma backend.
- PostgreSQL persistence.
- JWT authentication and refresh tokens.
- Global JWT and role guards.
- Global validation, exception handling and Swagger foundation.
- Green responsive portal layout.
- Admin, teacher, student and parent dashboards.
- User management with role-specific registration fields.
- Parent-child linking through direct and relation-based links.
- Admin password reset with refresh-token revocation.
- Authenticated API audit logging.
- Principal oversight activity view.
- Academic, attendance, grades, finance, communication, reports and search foundations.

### 2.2 Known implementation gaps

- The current role enum is narrower than the complete SRS role model.
- Academic years and classes exist, but semester lifecycle and policy versioning are incomplete.
- Admission, transfer and historical enrollment workflows need formal workflow models.
- Results, promotion and report-card approval need persisted workflow states.
- Finance needs complete receipts, discounts, refunds, reversals, reconciliation and immutable history.
- Parent and student scope must be covered by integration tests, not only frontend route guards.
- Library, HR, discipline, counseling, inventory and calendar are not complete.
- Production monitoring, backups, restore testing, CI/CD and user acceptance remain.

---

## 3. Delivery governance

### 3.1 Definition of ready

A work item may start only when:

- The related SRS requirement is identified.
- The affected SDD section is known.
- Dependencies are complete or explicitly waived.
- Acceptance tests are defined.
- Required school policy decisions are available.
- The database and API impact are understood.

### 3.2 Definition of done

Every feature must satisfy:

1. Database schema and migration are complete.
2. DTO validation and service business rules are complete.
3. Backend authorization and data scope are enforced.
4. Frontend route, navigation and responsive UI are complete.
5. Loading, empty, success and error states are complete.
6. Important writes create audit records.
7. Unit and integration tests pass.
8. Relevant end-to-end or acceptance tests pass.
9. Swagger/API documentation is updated.
10. Historical and correction behavior is verified.
11. User documentation is updated.
12. No critical or high-severity security defect remains.

### 3.3 Phase gate

At the end of each phase:

- Run the phase test suite.
- Verify database migrations on a clean database.
- Review authorization and audit behavior.
- Demonstrate the workflow using realistic data.
- Record open defects.
- Obtain phase owner approval before starting dependent work.

---

## 4. Phase roadmap

| Phase | Name | Status | Exit gate |
|---|---|---|---|
| 0 | Policy and architecture baseline | In progress | School policies approved and documents synchronized |
| 1 | Foundation and security | Partially complete | Secure account lifecycle and authorization tests pass |
| 2 | Academic configuration | Partially complete | Active year, two semesters, curriculum and policies work |
| 3 | Student lifecycle | Partially complete | Admission-to-enrollment workflow works |
| 4 | Teacher assignments and timetable | Partially complete | Valid assignments and conflict-free published timetable work |
| 5 | Attendance | Partially complete | Student/staff attendance, corrections and reports work |
| 6 | Assessment and examination | Partially complete | Draft-to-review marks workflow works |
| 7 | Results, report cards and promotion | Partially complete | Approved results and promotion lifecycle works |
| 8 | Finance | Partially complete | Reconciled invoice, payment and receipt lifecycle works |
| 9 | Portals and communication | Partially complete | All portal scope restrictions and notifications pass |
| 10 | Administration extensions | Not started | HR, library, discipline, counseling, inventory and calendar work |
| 11 | Analytics and exports | Partially complete | Reports are accurate, filtered and authorized |
| 12 | Production readiness | In progress | Security, backup, monitoring, CI/CD and UAT pass |
| 13 | Release and handover | Not started | Stakeholder sign-off and operational handover complete |

---

## 5. Phase 0 - Policy and architecture baseline

### Objectives

Resolve school-specific decisions before building calculation and approval engines.

### Approved school policies

- **Grading scale:** 90-100 Excellent; 80-89 Very Good; 70-79 Good; 60-69 Satisfactory; 50-59 Fair; 0-49 Poor/Fail.
- **Pass mark:** 50.
- **Assessment weights:** Classwork 10%, homework 10%, quiz 10%, midterm 30%, final examination 50%.
- **Annual result:** `(Semester 1 + Semester 2) / 2`, equivalent to 50% per semester.
- **Promotion:** Students who pass all required subjects are promoted. Other students become `REVIEW_REQUIRED` for principal approval.
- **Grade 11-12 curriculum:** Streams and subjects remain configurable and must be approved before activating Grades 11-12.
- **Parent verification:** Registrar or administrator approval.
- **Finance authorization:** Accountant configures fees; cashier records payments; principal approves discounts, refunds and reversals.
- **Currency:** ETB.
- **Calendar:** Store UTC/Gregorian dates and display the Ethiopian calendar where applicable.
- **Retention:** Academic and financial records are retained permanently; audit records are retained for 7 years.

### Required decisions

- [x] Confirm grading scale, grade boundaries and pass marks.
- [x] Confirm assessment categories and weights for Grades 9-12.
- [x] Confirm semester and annual calculation formulas.
- [x] Confirm promotion, repetition and exceptional-review rules.
- [x] Confirm Grade 11-12 streams and subject combinations remain configurable.
- [x] Confirm parent identity verification process.
- [x] Confirm result approval hierarchy.
- [x] Confirm fee categories, discounts, refunds and payment authorization.
- [x] Confirm ETB as default currency or approve another value.
- [x] Confirm Gregorian/Ethiopian calendar display policy.
- [x] Confirm retention periods for financial, academic and audit records.

### Technical baseline

- [ ] Review `srs.md` and `sdd.md` with stakeholders.
- [ ] Create a requirements-to-test traceability matrix.
- [ ] Compare the Prisma schema to the SDD domain model.
- [ ] Identify schema changes and migration order.
- [ ] Confirm API compatibility strategy for current `/api` and future `/api/v1`.
- [ ] Confirm file storage strategy.
- [ ] Confirm notification providers and payment provider scope.

### Exit criteria

All policy decisions are signed off, unresolved decisions have owners and deadlines, and all planned migrations have a dependency order.

---

## 6. Phase 1 - Foundation and security

### Backend

- [x] Maintain JWT access and refresh token flow.
- [x] Maintain global JWT and role guards.
- [x] Maintain global validation and exception handling.
- [x] Revoke refresh tokens on logout, password reset and deactivation.
- [x] Record authenticated API activity.
- [x] Add configurable permission keys and permission assignments.
- [x] Add account activation and invitation flow.
- [x] Add login history.
- [x] Add failed-login counters and lockout policy.
- [x] Add inactivity and session-expiry policy.
- [x] Add optional two-factor authentication extension point.
- [x] Add request correlation IDs to logs and audit records.
- [x] Review refresh-token storage and secure cookie configuration.
- [x] Add rate limiting for login, reset and sensitive endpoints.

### Frontend

- [x] Maintain role-aware routing and green layout.
- [x] Maintain login, forgot-password and reset-password screens.
- [ ] Add account activation screen.
- [ ] Add session-expiry recovery behavior.
- [x] Add permission-aware navigation and action controls.
- [x] Add accessible form and table primitives.

### Tests and gate

- [ ] Valid login opens the correct dashboard.
- [ ] Invalid, disabled, suspended and expired accounts are rejected.
- [ ] Student cannot access admin endpoint.
- [x] Parent cannot access unrelated student data.
- [x] Teacher cannot access unassigned class data.
- [x] Password reset invalidates existing refresh tokens.
- [ ] Permission changes are audited.

---

## 7. Phase 2 - Academic configuration

### Backend and database

- [x] Maintain school, academic year, grade, class and subject foundations.
- [ ] Add semester records with start/end dates and status.
- [ ] Enforce exactly two configured semesters per active academic year.
- [ ] Add academic-year activation, closure and archival states.
- [ ] Prevent overlapping active academic-year configurations.
- [ ] Add departments and subject ownership.
- [ ] Add required/elective subject configuration.
- [ ] Add subject streams and Grade 11-12 combinations.
- [ ] Add subject credits/workload where required.
- [ ] Add versioned grading policies.
- [ ] Add versioned promotion policies.
- [ ] Prevent changes to closed academic periods without an approved correction workflow.

### Frontend

- [ ] Build academic-year and semester setup screens.
- [ ] Build grade, section, subject and department configuration screens.
- [ ] Build curriculum and stream configuration screens.
- [ ] Build grading and promotion policy forms.
- [ ] Add academic-year and semester selectors to relevant screens.
- [ ] Add localization settings for English, Afaan Oromoo and Amharic.
- [ ] Add Gregorian and Ethiopian date presentation.

### Tests and gate

- [ ] Create year with exactly two semesters.
- [ ] Reject overlapping active year.
- [ ] Reject invalid semester dates.
- [ ] Preserve historical subject and policy versions.
- [ ] Prevent ordinary changes after closure.

---

## 8. Phase 3 - Student lifecycle

### Backend and database

- [x] Maintain student profile and enrollment foundation.
- [ ] Add admission application and document models.
- [ ] Add application number generation and status workflow.
- [ ] Add registrar review, correction, approval, rejection and waitlist states.
- [ ] Generate unique student identifiers.
- [ ] Add emergency contacts, photos and private documents.
- [ ] Add guardian verification state and relationship history.
- [ ] Add formal enrollment history.
- [ ] Add transfer, withdrawal and status-history records.
- [ ] Enforce one active enrollment per school and academic year.
- [ ] Add admission statistics.
- [ ] Create student account only after approved enrollment.

### Frontend

- [x] Maintain admin role-specific user creation and parent-child linking.
- [ ] Build admission application list and review screens.
- [ ] Build complete student registration form.
- [ ] Build student profile, enrollment and transfer screens.
- [ ] Build guardian verification screen.
- [ ] Build document upload and secure download UI.
- [ ] Build admission and enrollment reports.

### Tests and gate

- [ ] Duplicate student number is rejected.
- [ ] Incomplete admission shows field-level validation.
- [ ] Approval creates student, enrollment, guardian link and account.
- [ ] Transfer preserves previous enrollment and records effective date.
- [ ] Parent sees only verified linked children.
- [ ] Unauthorized user cannot access private student documents.

---

## 9. Phase 4 - Teacher assignments and timetable

### Backend and database

- [ ] Add teacher employee record, qualification and status workflow.
- [ ] Add departments and historical teacher assignments.
- [ ] Add teacher-subject, teacher-class and homeroom assignments.
- [ ] Add assignment proposal, approval and publication states.
- [x] Maintain timetable foundation and conflict checks.
- [ ] Add configurable school days, periods, breaks and classrooms.
- [ ] Add timetable version and publication history.
- [ ] Add teacher workload reports.
- [ ] Add assignment notifications.

### Frontend

- [ ] Build teacher and department management screens.
- [ ] Build assignment proposal and approval screens.
- [ ] Build timetable editor with conflict feedback.
- [ ] Build teacher and student timetable views.
- [ ] Add published timetable version indicator.

### Tests and gate

- [ ] Teacher qualification and assignment scope are validated.
- [ ] Teacher, class and classroom conflicts are rejected.
- [ ] Unauthorized teacher cannot view another assignment.
- [ ] Published timetable is visible to authorized portals.
- [ ] Historical assignments remain visible to authorized users.

---

## 10. Phase 5 - Attendance

### Backend and database

- [x] Maintain attendance sessions and records.
- [ ] Enforce assigned teacher and class scope.
- [ ] Enforce unique attendance per session and student.
- [ ] Add subject-based attendance configuration.
- [ ] Add correction records with old/new values and reason.
- [ ] Add attendance lock and authorized reopen workflow.
- [ ] Add staff attendance and leave integration.
- [ ] Add configurable parent absence notification rules.

### Frontend

- [x] Maintain teacher attendance screen and reports.
- [ ] Add correction history and approval screen.
- [ ] Add daily, monthly and semester report screens.
- [ ] Add staff attendance screen.
- [ ] Add absent/late notification status.

### Tests and gate

- [ ] Assigned teacher loads the correct roster.
- [ ] Unauthorized class access is rejected.
- [ ] Duplicate attendance is prevented.
- [ ] Correction requires authorization and is audited.
- [ ] Closed session cannot be edited without reopen permission.
- [ ] Attendance percentages match approved records.

---

## 11. Phase 6 - Assessment and examination

### Backend and database

- [x] Maintain assessment and mark foundations.
- [ ] Add examination and schedule entities.
- [ ] Add assessment types and configurable maximum marks.
- [ ] Add assessment weights by policy/version.
- [ ] Add teacher responsibility and class/subject scope.
- [ ] Add examination attendance.
- [ ] Add mark statuses: draft, submitted, returned, approved, published.
- [ ] Add absent, exempt and incomplete states.
- [ ] Add mark-change history.
- [ ] Enforce no self-approval for marks.
- [ ] Add controlled post-publication correction.

### Frontend

- [x] Maintain assessment and grade screens.
- [ ] Build examination creation and schedule screens.
- [ ] Build marks entry with draft/save/submit states.
- [ ] Build reviewer queue and return-for-correction flow.
- [ ] Build examination attendance screen.
- [ ] Show missing, incomplete and exception states clearly.

### Tests and gate

- [ ] Mark above maximum is rejected.
- [ ] Teacher can enter only assigned marks.
- [ ] Missing mark is not converted to zero.
- [ ] Submitted marks cannot be edited without return workflow.
- [ ] Reviewer cannot approve own submission.
- [ ] All corrections are auditable.

---

## 12. Phase 7 - Results, report cards and promotion

### Backend and database

- [ ] Add persisted semester and annual result snapshots.
- [ ] Implement normalized weighted calculation.
- [ ] Implement configured grade mapping and pass/fail rules.
- [ ] Store grading and promotion policy version on every result.
- [ ] Calculate subject, class and grade averages.
- [ ] Add optional GPA and ranking configuration.
- [ ] Add result approval and publication states.
- [ ] Prevent access to unpublished results.
- [ ] Add report-card and transcript generation.
- [ ] Add teacher and principal comments.
- [ ] Add Grade 12 eligibility and completion records.
- [ ] Add promotion proposal, review, approval, repetition and exceptional-review states.
- [ ] Create next-year enrollment only after final approval.

### Frontend

- [ ] Build semester result review and approval screens.
- [ ] Build annual result and policy calculation screens.
- [ ] Build report-card preview and PDF download.
- [ ] Build promotion preparation and approval screens.
- [ ] Build Grade 12 completion tracking.
- [ ] Show publication status in student and parent portals.

### Tests and gate

- [ ] Weighted result calculation matches approved examples.
- [ ] Missing or incomplete results block finalization.
- [ ] Historical policy changes do not recalculate old results.
- [ ] Student cannot view unpublished results.
- [ ] Published correction requires authorization and audit.
- [ ] Promotion creates next-year enrollment without deleting history.

---

## 13. Phase 8 - Finance

### Backend and database

- [x] Maintain fee structures, invoices, payments and dashboard foundations.
- [ ] Add fee categories and fee itemization.
- [ ] Support tuition, registration, examination and optional fees.
- [ ] Support grade-specific and student-specific fees.
- [ ] Add discounts and scholarship approval.
- [ ] Add receipts with unique receipt numbers.
- [ ] Add refunds and transaction reversals.
- [ ] Prevent deletion of confirmed payments.
- [ ] Add idempotency for payment and bulk-invoice requests.
- [ ] Add reconciliation status and settlement reports.
- [ ] Add duplicate reference detection.
- [ ] Add authorized accountant/cashier scopes.
- [ ] Add optional payment-provider adapter.

### Frontend

- [x] Maintain green finance workspace and finance reports.
- [ ] Add receipt preview and download.
- [ ] Add discount/scholarship approval flow.
- [ ] Add refund/reversal workflow.
- [ ] Add reconciliation screen.
- [ ] Add parent/student balance and receipt views.
- [ ] Add payment gateway status when enabled.

### Tests and gate

- [ ] Invoice amount is calculated correctly.
- [ ] Partial payment updates outstanding balance.
- [ ] Full payment marks invoice paid.
- [ ] Duplicate reference is rejected.
- [ ] Confirmed payment requires reversal/refund.
- [ ] Unauthorized teacher cannot access finance endpoints.
- [ ] Financial reports reconcile with invoice and payment totals.

---

## 14. Phase 9 - Portals and communication

### Backend

- [x] Maintain role dashboards, announcements, messages and notifications foundations.
- [ ] Enforce verified parent-child scope on every relevant endpoint.
- [ ] Enforce student self-scope on every relevant endpoint.
- [ ] Enforce teacher assigned-class and subject scope.
- [ ] Add assignment notifications.
- [ ] Add result publication notifications.
- [ ] Add invoice and payment notifications.
- [ ] Add notification preferences and delivery history.
- [ ] Add email/SMS adapters with retry and failure states.

### Frontend

- [x] Maintain role-aware green portals.
- [ ] Complete teacher classes, assignments, attendance and marks portal.
- [ ] Complete student timetable, assignments, exams and published results portal.
- [ ] Complete parent children, attendance, results, report cards, fees and requests portal.
- [ ] Add notification center, read state and preferences.
- [ ] Add authorized messaging history.

### Tests and gate

- [ ] Parent cannot request unrelated student by ID.
- [ ] Student cannot view another student.
- [ ] Teacher cannot view unassigned classes.
- [ ] Unpublished result remains hidden.
- [ ] Notifications are created for configured events.
- [ ] Provider failure does not corrupt the business transaction.

---

## 15. Phase 10 - Administration extensions

### HR

- [ ] Employee records.
- [ ] Staff attendance.
- [ ] Leave requests and approval.
- [ ] Restricted salary/payroll records if enabled.

### Library

- [ ] Books, authors and categories.
- [ ] Copies and availability.
- [ ] Loans, returns, reservations and overdue fines.

### Discipline and counseling

- [ ] Restricted incident records.
- [ ] Investigation and resolution workflow.
- [ ] Counseling cases, referrals and follow-ups.
- [ ] Separate permissions and audit coverage.

### Inventory

- [ ] Assets and stock categories.
- [ ] Purchases, issuance, returns and damage.
- [ ] Low-stock alerts and reports.

### Calendar and files

- [ ] Academic events, holidays, exams and meetings.
- [ ] Private storage abstraction.
- [ ] Authorized upload, download and retention rules.

### Exit criteria

Each enabled administration module has a complete workflow, permissions, audit coverage, tests and user documentation.

---

## 16. Phase 11 - Analytics and exports

- [x] Maintain reports module and dashboard foundations.
- [ ] Validate student and enrollment reports.
- [ ] Validate academic and result reports.
- [ ] Validate attendance and staff reports.
- [ ] Validate examination and marks-submission reports.
- [ ] Validate financial reports against transactional data.
- [ ] Complete principal, academic director, registrar and accountant dashboards.
- [ ] Complete teacher, student and parent dashboards.
- [ ] Add filter combinations for year, semester, grade, section and subject.
- [ ] Add authorized CSV, PDF and XLSX-compatible exports.
- [ ] Add report-card and transcript PDF validation.
- [ ] Add export audit events where sensitive data is involved.

### Exit criteria

Every report has a known source query, expected sample values, permission test and export test.

---

## 17. Phase 12 - Production readiness

### Security

- [ ] Run security review against SRS security requirements.
- [ ] Test authentication, privilege escalation and data isolation.
- [ ] Confirm HTTPS and secure cookie configuration.
- [ ] Confirm CORS and Helmet settings.
- [ ] Confirm rate limiting.
- [ ] Scan dependencies and resolve high-severity vulnerabilities.
- [ ] Verify secrets are outside source control.

### Quality

- [ ] Run backend unit tests.
- [ ] Run backend integration tests.
- [ ] Run frontend tests.
- [ ] Run Playwright end-to-end tests.
- [ ] Run acceptance tests from `srs.md`.
- [ ] Run Prisma validation and clean-database migration tests.
- [ ] Run performance tests for dashboard, search, reports and payment operations.

### Operations

- [ ] Configure production environment variables.
- [ ] Configure CI/CD build, test and deployment stages.
- [ ] Configure database backups.
- [ ] Perform and document restoration test.
- [ ] Configure application and database monitoring.
- [ ] Configure error alerts.
- [ ] Configure log retention and sensitive-data filtering.
- [ ] Document rollback procedure.
- [ ] Document incident response and support escalation.

### Documentation and training

- [ ] Administrator manual.
- [ ] Principal manual.
- [ ] Registrar manual.
- [ ] Teacher manual.
- [ ] Accountant/cashier manual.
- [ ] Student guide.
- [ ] Parent guide.
- [ ] Deployment and backup runbook.

### Exit criteria

All production blockers are closed, restore testing is successful, monitoring is active and UAT users are trained.

---

## 18. Phase 13 - Release and handover

### Release checklist

- [ ] Stakeholders approve grading and promotion results.
- [ ] Financial totals reconcile.
- [ ] Parent and student access restrictions pass.
- [ ] Report cards are validated.
- [ ] Backup restoration is signed off.
- [ ] Production smoke tests pass.
- [ ] No critical or high-severity defect remains.
- [ ] UAT sign-off is recorded.
- [ ] Support contacts and escalation process are documented.
- [ ] Production credentials are transferred securely.
- [ ] First-week monitoring schedule is assigned.

### Post-release

- [ ] Monitor errors, latency, login failures and financial operations daily.
- [ ] Review backup success daily.
- [ ] Review audit anomalies weekly.
- [ ] Hold a production review after seven days.
- [ ] Prioritize deferred SRS modules for the next release.

---

## 19. Production release criteria

Production release is allowed only when:

1. Foundation authentication and authorization tests pass.
2. Student admission, enrollment and parent linking work.
3. Academic-year and semester configuration works.
4. Attendance and assessment workflows work.
5. Semester and annual results are calculated, approved and published correctly.
6. Promotion and historical records are preserved.
7. Finance invoices, partial/full payments, receipts and reconciliation work.
8. Parent and student data isolation is verified.
9. Required reports and exports are accurate.
10. Backups and restoration are tested.
11. Monitoring and error logging are active.
12. Deployment and rollback procedures are documented.
13. School representatives complete UAT and sign off.

---

## 20. Change control

Any change to SRS requirements, SDD architecture, database relationships, grading policy, promotion rules, payment behavior or access scope must:

1. Be recorded with a change identifier.
2. Identify affected requirements and modules.
3. Include migration and data-impact analysis.
4. Include updated tests.
5. Receive technical and school-policy approval where applicable.
6. Update `srs.md`, `sdd.md`, `plan.md` or `task.md` when the baseline changes.

**Plan status:** Follow `task.md` for the executable task sequence. Update this plan only when phase scope, dependencies or release gates change.
