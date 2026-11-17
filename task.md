# Production Task Register

**Project:** Ethiopian High School Management Information System  
**Source:** `srs.md`, `sdd.md`, `plan.md`  
**Purpose:** Executable task list for completing, testing and releasing the system  
**Status values:** `TODO`, `IN PROGRESS`, `BLOCKED`, `DONE`

## How to use this file

1. Work from top to bottom unless a dependency is explicitly complete.
2. Before starting a task, record the owner, start date and expected completion date.
3. Do not mark a task complete until its acceptance checks pass.
4. Link implementation tasks to tests, migrations and documentation.
5. Mark blocked work with the blocking decision or dependency.
6. Update `plan.md` when phase scope or release gates change.

---

## 0. Project controls and decisions

### 0.1 Ownership

- [ ] `T-0001` Assign product owner from school administration.
- [ ] `T-0002` Assign technical lead.
- [ ] `T-0003` Assign backend owner.
- [ ] `T-0004` Assign frontend owner.
- [ ] `T-0005` Assign database/migration owner.
- [ ] `T-0006` Assign QA and UAT owner.
- [ ] `T-0007` Assign deployment and backup owner.
- [ ] `T-0008` Create a change log for requirements and policy decisions.
- [ ] `T-0009` Create a defect register with severity and release impact.

### 0.2 School policy decisions

- [x] `T-0010` Approve grading scale and pass marks.
- [x] `T-0011` Approve assessment types and weights.
- [x] `T-0012` Approve annual result formula.
- [x] `T-0013` Approve promotion and repetition rules.
- [x] `T-0014` Approve Grade 11-12 streams and subject combinations remain configurable.
- [x] `T-0015` Approve parent identity verification procedure.
- [x] `T-0016` Approve result approval hierarchy.
- [x] `T-0017` Approve finance authorization levels.
- [x] `T-0018` Approve discounts, scholarships, refunds and reversal policy.
- [x] `T-0019` Approve ETB as the default currency and confirm payment methods.
- [x] `T-0020` Approve UTC/Gregorian storage with Ethiopian calendar display where applicable.
- [x] `T-0021` Approve permanent academic/financial retention and 7-year audit retention.

### 0.3 Baseline review

- [ ] `T-0022` Review every SRS requirement and assign it to a phase.
- [ ] `T-0023` Review every SDD module and confirm implementation ownership.
- [ ] `T-0024` Compare Prisma schema against the SDD domain model.
- [ ] `T-0025` List required migrations in dependency order.
- [ ] `T-0026` Create requirements-to-test traceability matrix.
- [ ] `T-0027` Confirm current `/api` compatibility plan and future `/api/v1` plan.
- [ ] `T-0028` Confirm private file-storage approach.
- [ ] `T-0029` Confirm email, SMS and payment-provider decisions.

**Gate G0:** Policy decisions, ownership, traceability and migration order are approved.

---

## 1. Foundation and security

### 1.1 Authentication

- [x] `T-0101` Verify login, logout, refresh and profile endpoints.
- [x] `T-0102` Verify password reset and reset-token expiry.
- [x] `T-0103` Revoke refresh tokens after password reset.
- [x] `T-0104` Add account activation/invitation flow.
- [x] `T-0105` Add login history records.
- [x] `T-0106` Add configurable failed-login restriction.
- [x] `T-0107` Add inactive-session expiration policy.
- [x] `T-0108` Add optional two-factor authentication extension point.
- [x] `T-0109` Review secure cookie, refresh-token and local-storage strategy.
- [x] `T-0110` Add rate limits to login, reset and sensitive endpoints.

### 1.2 Authorization

- [x] `T-0111` Verify global JWT guard behavior.
- [x] `T-0112` Verify global role guard behavior.
- [x] `T-0113` Define permission-key constants.
- [x] `T-0114` Add permission storage and role-permission mapping.
- [x] `T-0115` Add reusable backend scope policies.
- [x] `T-0116` Add permission checks to finance, marks, results and audit endpoints.
- [x] `T-0117` Add parent-child relationship policy.
- [x] `T-0118` Add teacher assigned-class/subject policy.
- [x] `T-0119` Add student self-record policy.
- [x] `T-0120` Add permission-management UI.

### 1.3 Audit and observability

- [x] `T-0121` Verify global authenticated API audit interceptor.
- [x] `T-0122` Verify admin activity endpoint and pagination.
- [x] `T-0123` Add request correlation ID.
- [x] `T-0124` Add before/after audit snapshots for sensitive mutations.
- [x] `T-0125` Exclude passwords, tokens and unnecessary sensitive data from audit records.
- [x] `T-0126` Add structured application error logging.
- [x] `T-0127` Add health-check endpoint for API and database.

### 1.4 Foundation tests

- [ ] `T-0128` Test valid login and role redirect.
- [x] `T-0129` Test invalid password.
- [x] `T-0130` Test disabled/suspended account.
- [ ] `T-0131` Test expired access token and refresh flow.
- [ ] `T-0132` Test revoked refresh token.
- [ ] `T-0133` Test student access to admin endpoint is denied.
- [ ] `T-0134` Test parent access without verified link is denied.
- [x] `T-0135` Test password reset creates audit event.
- [ ] `T-0136` Test important mutations create audit events.

**Gate G1:** Secure account lifecycle, authorization, audit logging and foundation tests pass.

---

## 2. Academic configuration

### 2.1 Database and backend

- [ ] `T-0201` Add semester model and migration.
- [ ] `T-0202` Enforce two semesters for each active academic year.
- [ ] `T-0203` Add academic-year status: draft, active, closed, archived.
- [ ] `T-0204` Prevent overlapping active academic years.
- [ ] `T-0205` Add academic-year closure service.
- [ ] `T-0206` Add department model and service.
- [ ] `T-0207` Add required/elective subject configuration.
- [ ] `T-0208` Add Grade 11-12 stream and subject-combination models.
- [ ] `T-0209` Add subject workload/credit configuration.
- [ ] `T-0210` Add grading-policy model and versioning.
- [ ] `T-0211` Add promotion-policy model and versioning.
- [ ] `T-0212` Protect closed academic-period data from ordinary edits.

### 2.2 Frontend

- [ ] `T-0213` Build academic-year list and create form.
- [ ] `T-0214` Build semester configuration form.
- [ ] `T-0215` Build grade and section configuration.
- [ ] `T-0216` Build department and subject management.
- [ ] `T-0217` Build required/elective and stream configuration.
- [ ] `T-0218` Build grading-policy editor.
- [ ] `T-0219` Build promotion-policy editor.
- [ ] `T-0220` Add current-year and semester selectors.
- [ ] `T-0221` Add localization settings.
- [ ] `T-0222` Add Gregorian/Ethiopian date display.

### 2.3 Tests

- [ ] `T-0223` Test year with exactly two semesters.
- [ ] `T-0224` Test invalid and overlapping dates.
- [ ] `T-0225` Test active-year conflict.
- [ ] `T-0226` Test historical policy version preservation.
- [ ] `T-0227` Test closed-year update rejection.
- [ ] `T-0228` Test subject and stream scope by grade.

**Gate G2:** Academic year, semesters, curriculum and policy configuration work on a clean database.

---

## 3. Student lifecycle

### 3.1 Admission

- [ ] `T-0301` Add admission application model and migration.
- [ ] `T-0302` Add application document metadata model.
- [ ] `T-0303` Add application number generator.
- [ ] `T-0304` Add draft, submitted, correction, approved, rejected and waitlisted states.
- [ ] `T-0305` Add registrar review service.
- [ ] `T-0306` Add approval/rejection decision audit.
- [ ] `T-0307` Add admission statistics query.

### 3.2 Student and guardian records

- [x] `T-0308` Verify student profile CRUD.
- [x] `T-0309` Verify role-specific admin registration forms.
- [x] `T-0310` Verify parent-child linking through `ParentStudent`.
- [ ] `T-0311` Add unique student identifier service.
- [ ] `T-0312` Add emergency contacts.
- [ ] `T-0313` Add photograph upload metadata.
- [ ] `T-0314` Add private student documents.
- [ ] `T-0315` Add guardian verification state.
- [ ] `T-0316` Add guardian relationship history.

### 3.3 Enrollment, transfer and withdrawal

- [ ] `T-0317` Add formal student enrollment history model.
- [ ] `T-0318` Enforce one active enrollment per academic year.
- [ ] `T-0319` Add transfer request workflow.
- [ ] `T-0320` Add withdrawal workflow.
- [ ] `T-0321` Preserve class, attendance, marks and finance history.
- [ ] `T-0322` Generate student account after approved enrollment.
- [ ] `T-0323` Add admission confirmation document.

### 3.4 Student tests

- [ ] `T-0324` Test duplicate student identifier rejection.
- [ ] `T-0325` Test incomplete admission validation.
- [ ] `T-0326` Test approval creates student and enrollment.
- [ ] `T-0327` Test guardian verification and parent access.
- [ ] `T-0328` Test unrelated parent access denial.
- [ ] `T-0329` Test transfer preserves history.
- [ ] `T-0330` Test duplicate active enrollment prevention.
- [ ] `T-0331` Test private document authorization.

**Gate G3:** An approved applicant can become an enrolled student with a verified guardian and secure account.

---

## 4. Teacher assignments and timetable

- [ ] `T-0401` Add employee/teacher qualification and employment status fields.
- [ ] `T-0402` Add department assignment.
- [ ] `T-0403` Add teacher-subject assignment.
- [ ] `T-0404` Add teacher-class assignment.
- [ ] `T-0405` Add homeroom assignment.
- [ ] `T-0406` Add proposal, approval and publication states.
- [ ] `T-0407` Add historical assignment records.
- [ ] `T-0408` Add configurable school days.
- [ ] `T-0409` Add periods and break configuration.
- [ ] `T-0410` Add classroom configuration.
- [x] `T-0411` Verify timetable conflict detection.
- [ ] `T-0412` Add timetable versions and publication history.
- [ ] `T-0413` Add teacher workload report.
- [ ] `T-0414` Build teacher/department management UI.
- [ ] `T-0415` Build assignment approval UI.
- [ ] `T-0416` Build timetable editor UI.
- [ ] `T-0417` Build published teacher/student timetable views.
- [ ] `T-0418` Test teacher, class and classroom conflict rejection.
- [ ] `T-0419` Test teacher assigned-scope access.
- [ ] `T-0420` Test timetable publication and history.

**Gate G4:** Approved assignments and a conflict-free published timetable are available to authorized users.

---

## 5. Attendance

- [x] `T-0501` Verify attendance session creation and closure.
- [x] `T-0502` Verify attendance record submission.
- [ ] `T-0503` Enforce teacher and class scope in attendance service.
- [ ] `T-0504` Enforce unique session/student attendance.
- [ ] `T-0505` Add subject-based attendance setting.
- [ ] `T-0506` Add attendance correction entity.
- [ ] `T-0507` Add correction approval and audit.
- [ ] `T-0508` Add attendance lock and authorized reopen.
- [ ] `T-0509` Add staff attendance.
- [ ] `T-0510` Add leave integration.
- [ ] `T-0511` Add absence notification rules.
- [ ] `T-0512` Build correction history UI.
- [ ] `T-0513` Build daily/monthly/semester reports.
- [ ] `T-0514` Build staff attendance UI.
- [ ] `T-0515` Test assigned teacher roster.
- [ ] `T-0516` Test unauthorized class denial.
- [ ] `T-0517` Test duplicate attendance prevention.
- [ ] `T-0518` Test correction audit.
- [ ] `T-0519` Test closed session protection.
- [ ] `T-0520` Test attendance percentage calculations.

**Gate G5:** Student and staff attendance workflows, corrections and reports pass.

---

## 6. Assessment and examination

- [x] `T-0601` Verify assessment type and assessment foundations.
- [x] `T-0602` Verify grade entry foundation.
- [ ] `T-0603` Add examination entity and lifecycle.
- [ ] `T-0604` Add exam schedule entity.
- [ ] `T-0605` Add assessment category configuration.
- [ ] `T-0606` Add maximum-mark and weight validation.
- [ ] `T-0607` Add class, subject and teacher responsibility scope.
- [ ] `T-0608` Add examination attendance.
- [ ] `T-0609` Add draft/submitted/returned/approved/published statuses.
- [ ] `T-0610` Add absent, exempt and incomplete mark statuses.
- [ ] `T-0611` Add mark-change history.
- [ ] `T-0612` Prevent teacher self-approval.
- [ ] `T-0613` Add post-publication correction workflow.
- [ ] `T-0614` Build examination creation and schedule UI.
- [ ] `T-0615` Build marks entry with draft/save/submit.
- [ ] `T-0616` Build reviewer queue.
- [ ] `T-0617` Build return-for-correction UI.
- [ ] `T-0618` Build exam attendance UI.
- [ ] `T-0619` Test maximum-mark validation.
- [ ] `T-0620` Test missing marks are not treated as zero.
- [ ] `T-0621` Test assigned-teacher scope.
- [ ] `T-0622` Test review and approval transitions.
- [ ] `T-0623` Test correction history.

**Gate G6:** Teachers can submit valid marks and authorized reviewers can approve or return them.

---

## 7. Results, report cards and promotion

- [ ] `T-0701` Add grading policy version reference to result records.
- [ ] `T-0702` Add semester-result model and migration.
- [ ] `T-0703` Add annual-result model and migration.
- [ ] `T-0704` Implement normalized weighted calculation.
- [ ] `T-0705` Implement grade mapping and pass/fail rules.
- [ ] `T-0706` Implement subject, class and grade averages.
- [ ] `T-0707` Add optional GPA calculation.
- [ ] `T-0708` Add optional ranking configuration.
- [ ] `T-0709` Add result approval state.
- [ ] `T-0710` Add result publication state.
- [ ] `T-0711` Prevent access to unpublished results.
- [ ] `T-0712` Add report-card snapshot model.
- [ ] `T-0713` Add transcript generation.
- [ ] `T-0714` Add teacher and principal comments.
- [ ] `T-0715` Add Grade 12 eligibility checklist.
- [ ] `T-0716` Add external examination result distinction.
- [ ] `T-0717` Add completion record.
- [ ] `T-0718` Add promotion proposal and review states.
- [ ] `T-0719` Add promoted/repeating/graduated/review-required decisions.
- [ ] `T-0720` Create next-year enrollment only after approval.
- [ ] `T-0721` Build result review and approval UI.
- [ ] `T-0722` Build annual result UI.
- [ ] `T-0723` Build report-card preview/PDF UI.
- [ ] `T-0724` Build promotion preparation UI.
- [ ] `T-0725` Build Grade 12 completion UI.
- [ ] `T-0726` Test configured weighted calculation.
- [ ] `T-0727` Test incomplete results block finalization.
- [ ] `T-0728` Test historical policy immutability.
- [ ] `T-0729` Test unpublished result isolation.
- [ ] `T-0730` Test approved correction and audit.
- [ ] `T-0731` Test promotion preserves historical enrollment.

**Gate G7:** Results are calculated, approved, published and used for controlled promotion.

---

## 8. Finance

### 8.1 Data and workflows

- [x] `T-0801` Verify fee structure CRUD.
- [x] `T-0802` Verify invoice generation.
- [x] `T-0803` Verify payment recording.
- [x] `T-0804` Verify finance dashboard payload and reports.
- [ ] `T-0805` Add fee categories and invoice items.
- [ ] `T-0806` Support tuition, registration, exam and optional fees.
- [ ] `T-0807` Support grade-specific fees.
- [ ] `T-0808` Support student-specific fees.
- [ ] `T-0809` Add discount and scholarship approval.
- [ ] `T-0810` Add unique receipt generation.
- [ ] `T-0811` Add receipt download/print.
- [ ] `T-0812` Add refund workflow.
- [ ] `T-0813` Add reversal workflow.
- [ ] `T-0814` Prevent hard deletion of confirmed payments.
- [ ] `T-0815` Add idempotency for payment and bulk invoices.
- [ ] `T-0816` Add duplicate reference detection.
- [ ] `T-0817` Add reconciliation status.
- [ ] `T-0818` Add accountant and cashier scopes.
- [ ] `T-0819` Add payment-provider adapter if approved.

### 8.2 Frontend

- [x] `T-0820` Verify green finance workspace.
- [ ] `T-0821` Build receipt preview and download.
- [ ] `T-0822` Build discount/scholarship approval.
- [ ] `T-0823` Build refund/reversal confirmation.
- [ ] `T-0824` Build reconciliation screen.
- [ ] `T-0825` Build parent/student balance and receipt screens.
- [ ] `T-0826` Build payment-provider status UI if enabled.

### 8.3 Finance tests

- [ ] `T-0827` Test invoice amount.
- [ ] `T-0828` Test partial payment balance.
- [ ] `T-0829` Test full payment status.
- [ ] `T-0830` Test duplicate payment reference.
- [ ] `T-0831` Test confirmed-payment correction workflow.
- [ ] `T-0832` Test unauthorized finance access.
- [ ] `T-0833` Test reconciliation totals.
- [ ] `T-0834` Test retry does not duplicate payment.

**Gate G8:** Financial records reconcile and confirmed transactions are protected.

---

## 9. Portals and communication

- [x] `T-0901` Verify role-specific dashboard routes.
- [x] `T-0902` Verify green responsive layout.
- [ ] `T-0903` Complete teacher assigned classes and subjects portal.
- [ ] `T-0904` Complete teacher assignments, attendance and marks portal.
- [ ] `T-0905` Complete student timetable and examination portal.
- [ ] `T-0906` Complete student assignments and published-results portal.
- [ ] `T-0907` Complete parent child, attendance, results and fees portal.
- [ ] `T-0908` Add parent report-card and receipt access.
- [ ] `T-0909` Add parent authorized absence/request workflow.
- [ ] `T-0910` Add notification preferences.
- [ ] `T-0911` Add notification history and read-state management.
- [ ] `T-0912` Add assignment notifications.
- [ ] `T-0913` Add result publication notifications.
- [ ] `T-0914` Add invoice/payment notifications.
- [ ] `T-0915` Add email adapter if approved.
- [ ] `T-0916` Add SMS adapter if approved.
- [ ] `T-0917` Add retry and provider-failure handling.
- [ ] `T-0918` Add authorized messaging history.
- [ ] `T-0919` Test parent unrelated-child denial.
- [ ] `T-0920` Test student self-scope.
- [ ] `T-0921` Test teacher assigned-scope.
- [ ] `T-0922` Test unpublished result isolation.
- [ ] `T-0923` Test notification creation and delivery failure behavior.

**Gate G9:** All enabled portals work with backend-enforced scope and required notifications.

---

## 10. Administration extensions

### HR

- [ ] `T-1001` Add employee records.
- [ ] `T-1002` Add staff attendance.
- [ ] `T-1003` Add leave requests and approval.
- [ ] `T-1004` Add restricted payroll fields only if approved.

### Library

- [ ] `T-1011` Add books, authors and categories.
- [ ] `T-1012` Add book copies and statuses.
- [ ] `T-1013` Add issue, return and reservation workflows.
- [ ] `T-1014` Add overdue and fine reports.

### Discipline and counseling

- [ ] `T-1021` Add restricted discipline incidents.
- [ ] `T-1022` Add investigation and resolution workflow.
- [ ] `T-1023` Add parent notification policy.
- [ ] `T-1024` Add counseling cases and follow-ups.
- [ ] `T-1025` Add referral workflow.
- [ ] `T-1026` Add dedicated permissions and audit tests.

### Inventory and calendar

- [ ] `T-1031` Add inventory items and categories.
- [ ] `T-1032` Add stock purchase, issue, return and damage transactions.
- [ ] `T-1033` Add minimum stock alerts.
- [ ] `T-1034` Add school calendar events, holidays and meetings.
- [ ] `T-1035` Add event notifications and authorized calendar views.

### Files

- [ ] `T-1041` Implement private storage adapter.
- [ ] `T-1042` Implement authorized upload endpoint.
- [ ] `T-1043` Implement authorized download endpoint.
- [ ] `T-1044` Validate size, type and content.
- [ ] `T-1045` Add file retention and deletion policy.

**Gate G10:** Each enabled operational module has complete workflow, authorization, audit, tests and documentation.

---

## 11. Analytics and exports

- [x] `T-1101` Verify report dashboard foundation.
- [x] `T-1102` Verify finance dashboard and fee collection response.
- [ ] `T-1103` Validate enrollment and student reports.
- [ ] `T-1104` Validate academic and result reports.
- [ ] `T-1105` Validate attendance and staff reports.
- [ ] `T-1106` Validate examination and marks-submission reports.
- [ ] `T-1107` Validate financial reports against transactional fixtures.
- [ ] `T-1108` Complete principal dashboard.
- [ ] `T-1109` Complete academic director dashboard.
- [ ] `T-1110` Complete registrar dashboard.
- [ ] `T-1111` Complete accountant dashboard.
- [ ] `T-1112` Complete teacher, student and parent dashboards.
- [ ] `T-1113` Add year, semester, grade, section and subject filters.
- [ ] `T-1114` Add pagination to large report results.
- [ ] `T-1115` Add CSV export tests.
- [ ] `T-1116` Add PDF report-card/transcript tests.
- [ ] `T-1117` Add spreadsheet-compatible export where required.
- [ ] `T-1118` Audit sensitive report exports.

**Gate G11:** Reports are accurate, permission-filtered, performant and exportable.

---

## 12. Production engineering

### 12.1 Automated tests

- [ ] `T-1201` Run backend unit test suite.
- [ ] `T-1202` Add missing backend unit tests.
- [ ] `T-1203` Run backend integration tests against test PostgreSQL.
- [ ] `T-1204` Add frontend component tests.
- [ ] `T-1205` Add frontend route and form tests.
- [ ] `T-1206` Add Playwright authentication tests.
- [ ] `T-1207` Add Playwright student lifecycle test.
- [ ] `T-1208` Add Playwright results publication test.
- [ ] `T-1209` Add Playwright finance test.
- [ ] `T-1210` Add Playwright parent isolation test.
- [ ] `T-1211` Run acceptance tests AT-001 through AT-058 from `srs.md`.

### 12.2 Security

- [ ] `T-1221` Run authentication security review.
- [ ] `T-1222` Run authorization and privilege-escalation review.
- [ ] `T-1223` Run parent/student/teacher data-isolation tests.
- [ ] `T-1224` Run input-validation and injection tests.
- [ ] `T-1225` Run private-file access tests.
- [ ] `T-1226` Verify HTTPS and secure cookies in staging.
- [ ] `T-1227` Verify CORS and Helmet production settings.
- [ ] `T-1228` Verify rate limiting.
- [ ] `T-1229` Scan dependencies.
- [ ] `T-1230` Remove secrets from repository and build logs.
- [ ] `T-1231` Confirm audit logs cannot be edited through ordinary APIs.

### 12.3 Performance and reliability

- [ ] `T-1241` Load-test dashboard endpoints.
- [ ] `T-1242` Load-test search and paginated lists.
- [ ] `T-1243` Load-test report and export endpoints.
- [ ] `T-1244` Test payment retry/idempotency.
- [ ] `T-1245` Review slow database queries and indexes.
- [ ] `T-1246` Verify application error handling and alerting.
- [ ] `T-1247` Verify graceful restart and database reconnect.

### 12.4 CI/CD

- [ ] `T-1251` Create CI dependency installation job.
- [ ] `T-1252` Create backend lint, type-check, build and test jobs.
- [ ] `T-1253` Create frontend lint, type-check, build and test jobs.
- [ ] `T-1254` Create Prisma validation and migration job.
- [ ] `T-1255` Create security/dependency scan job.
- [ ] `T-1256` Create staging deployment job.
- [ ] `T-1257` Add protected production deployment approval.
- [ ] `T-1258` Add rollback documentation and smoke-test job.

### 12.5 Backup and monitoring

- [ ] `T-1261` Configure daily full database backup.
- [ ] `T-1262` Encrypt and retain backups.
- [ ] `T-1263` Store an off-host backup copy.
- [ ] `T-1264` Test restoration on a clean database.
- [ ] `T-1265` Document RPO and RTO.
- [ ] `T-1266` Monitor backup success/failure.
- [ ] `T-1267` Monitor API errors, latency and database health.
- [ ] `T-1268` Configure alerts for critical failures.
- [ ] `T-1269` Document incident response and escalation.

**Gate G12:** Automated quality checks, security review, performance checks, CI/CD, monitoring and restore testing pass.

---

## 13. Documentation and training

- [ ] `T-1301` Update `srs.md` after approved requirement changes.
- [ ] `T-1302` Update `sdd.md` after approved design changes.
- [ ] `T-1303` Keep `plan.md` synchronized with phase status.
- [ ] `T-1304` Maintain Swagger/OpenAPI documentation.
- [ ] `T-1305` Write administrator manual.
- [ ] `T-1306` Write principal manual.
- [ ] `T-1307` Write registrar manual.
- [ ] `T-1308` Write teacher manual.
- [ ] `T-1309` Write accountant/cashier manual.
- [ ] `T-1310` Write student guide.
- [ ] `T-1311` Write parent guide.
- [ ] `T-1312` Write deployment runbook.
- [ ] `T-1313` Write backup and restoration runbook.
- [ ] `T-1314` Write incident response runbook.
- [ ] `T-1315` Train administrators and principals.
- [ ] `T-1316` Train registrar, teachers and finance staff.
- [ ] `T-1317` Prepare student and parent onboarding material.

---

## 14. User acceptance testing

### UAT preparation

- [ ] `T-1401` Create sanitized realistic UAT dataset.
- [ ] `T-1402` Create UAT accounts for each enabled role.
- [ ] `T-1403` Prepare UAT scripts from SRS acceptance tests.
- [ ] `T-1404` Confirm school representatives and test dates.
- [ ] `T-1405` Deploy release candidate to staging.

### UAT execution

- [ ] `T-1411` Principal tests dashboard, oversight and approvals.
- [ ] `T-1412` Academic director tests year, semester, marks and results.
- [ ] `T-1413` Registrar tests admission, enrollment and transfer.
- [ ] `T-1414` Teacher tests timetable, attendance, assignments and marks.
- [ ] `T-1415` Accountant tests fees, invoices, payments and reports.
- [ ] `T-1416` Student tests portal and published information.
- [ ] `T-1417` Parent tests linked-child access and fees.
- [ ] `T-1418` QA verifies security and error behavior.
- [ ] `T-1419` Record every UAT defect with severity and owner.
- [ ] `T-1420` Re-test all fixed UAT defects.

### UAT exit

- [ ] `T-1421` Obtain principal sign-off.
- [ ] `T-1422` Obtain academic sign-off.
- [ ] `T-1423` Obtain registrar sign-off.
- [ ] `T-1424` Obtain finance sign-off.
- [ ] `T-1425` Obtain technical release approval.

---

## 15. Production release and handover

### Release preparation

- [ ] `T-1501` Freeze release scope.
- [ ] `T-1502` Confirm all release blockers are closed.
- [ ] `T-1503` Back up production database.
- [ ] `T-1504` Verify production environment variables.
- [ ] `T-1505` Apply reviewed database migrations.
- [ ] `T-1506` Deploy backend.
- [ ] `T-1507` Deploy frontend.
- [ ] `T-1508` Run production smoke tests.
- [ ] `T-1509` Verify login for every enabled role.
- [ ] `T-1510` Verify finance and report endpoints.
- [ ] `T-1511` Verify backup monitoring.

### Handover

- [ ] `T-1521` Transfer operational credentials securely.
- [ ] `T-1522` Transfer support contacts and escalation process.
- [ ] `T-1523` Confirm daily backup owner.
- [ ] `T-1524` Confirm audit review owner.
- [ ] `T-1525` Confirm incident response owner.
- [ ] `T-1526` Schedule seven-day production review.
- [ ] `T-1527` Schedule thirty-day improvement review.
- [ ] `T-1528` Archive release notes and UAT sign-off.

**Gate G13:** Production is accepted, documented, monitored and handed over.

---

## 16. Release blocker checklist

The release must remain blocked if any item below is true:

- [ ] Critical or high-severity security defect remains.
- [ ] Parent can access an unrelated student.
- [ ] Student can access another student's private record.
- [ ] Teacher can access an unassigned class or subject.
- [ ] Payment can be duplicated by retry.
- [ ] Confirmed payment can be silently deleted.
- [ ] Result calculation does not match approved policy.
- [ ] Unpublished result is visible to a student or parent.
- [ ] Historical enrollment, result or payment data is lost.
- [ ] Backup restoration has not been successfully tested.
- [ ] Production secrets are present in source control.
- [ ] Required UAT sign-offs are missing.
- [ ] Monitoring and error alerting are not active.

---

## 17. Daily production operation checklist

### Daily

- [ ] Verify API and database health.
- [ ] Verify backup completed successfully.
- [ ] Review authentication failures.
- [ ] Review payment failures and duplicate-reference alerts.
- [ ] Review failed notifications.
- [ ] Review critical application errors.

### Weekly

- [ ] Review audit activity anomalies.
- [ ] Review inactive and suspended accounts.
- [ ] Review outstanding invoices and reconciliation.
- [ ] Review storage usage.
- [ ] Review unresolved support issues.

### Monthly

- [ ] Test a backup restoration sample.
- [ ] Review permissions and staff changes.
- [ ] Review performance and slow queries.
- [ ] Review dependency and security updates.
- [ ] Review report accuracy with school stakeholders.

---

## 18. Task status summary

Record the current count at each project review:

| Category | TODO | IN PROGRESS | BLOCKED | DONE |
|---|---:|---:|---:|---:|
| Policy and controls |  |  |  |  |
| Foundation/security |  |  |  |  |
| Academic configuration |  |  |  |  |
| Student lifecycle |  |  |  |  |
| Teacher/timetable |  |  |  |  |
| Attendance |  |  |  |  |
| Assessment/examination |  |  |  |  |
| Results/promotion |  |  |  |  |
| Finance |  |  |  |  |
| Portals/communication |  |  |  |  |
| Administration extensions |  |  |  |  |
| Analytics/exports |  |  |  |  |
| Production engineering |  |  |  |  |
| Documentation/training |  |  |  |  |
| UAT/release |  |  |  |  |

**Operational rule:** Never declare the system production-ready based only on completed frontend screens. Production readiness requires the phase gates, acceptance tests, security checks, restore test and stakeholder sign-off defined above.
