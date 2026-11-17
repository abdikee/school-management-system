# **Software Requirements Specification (SRS)**

## **Ethiopian High School Management Information System (Grades 9–12)**

Development-ready specification

Version 1.0

# **High School Management Information System**

**Project type:** Web-based School Management Information System

**Target institution:** Ethiopian secondary school

**Academic levels:** Grade 9, Grade 10, Grade 11 and Grade 12

**Academic structure:** Two semesters and annual results

**Deployment:** One school, single-school installation

**Architecture:** Modular monolithic application

**Document purpose:** Requirements, workflows, permissions, database design, technical constraints and acceptance testing.

This specification defines the system that should be built, not merely a list of features. It establishes what each user can do, how modules interact, which business rules must be enforced, how information is stored and what conditions must be satisfied before the system is considered complete.

**Important design decision:** The system will be configurable. Ethiopian curriculum structures, grading scales, promotion requirements, examination weights and administrative policies must be maintained as school configuration rather than permanently hardcoded assumptions.

## **Document control**

| Item           | Description                                                          |
| -------------- | -------------------------------------------------------------------- |
| Document       | Software Requirements Specification                                  |
| Version        | 1.0                                                                  |
| Status         | Baseline specification                                               |
| System name    | High School Management System                                        |
| Users          | School administration, teachers, students, parents and support staff |
| Database       | PostgreSQL                                                           |
| Frontend       | React + TypeScript                                                   |
| Backend        | NestJS                                                               |
| API            | REST                                                                 |
| Authentication | Secure role-based authentication                                     |

## **Table of contents**

1. Introduction
2. Project objectives
3. Scope and system boundaries
4. Stakeholders and actors
5. Role and permission matrix
6. Functional requirements
7. Detailed academic requirements
8. Complete operational workflows
9. Business rules
10. Database design
11. System architecture
12. UI/UX requirements
13. Reports and dashboards
14. Security requirements
15. Non-functional requirements
16. Integration requirements
17. Acceptance criteria
18. Testing strategy
19. Implementation phases
20. Definition of Done

# 1. INTRODUCTION

## 1.1 Purpose

The purpose of this document is to define the functional and non-functional requirements of an Ethiopian High School Management Information System (HSMIS) serving Grades 9–12.

The system will centralize school administration, student information, academic operations, examinations, attendance, financial activities, communication and reporting.

This SRS is intended for:

- Software developers.
- System architects.
- Database designers.
- UI/UX designers.
- Software testers.
- School administrators.
- Project stakeholders.

## 1.2 Problem statement

Many school operations are performed using paper documents, spreadsheets and disconnected applications.

This creates problems such as:

- Duplicate student records.
- Difficulty tracking student academic history.
- Delayed examination results.
- Errors in calculating marks.
- Poor attendance monitoring.
- Difficult fee tracking.
- Limited communication with parents.
- Time-consuming report preparation.
- Unauthorized access to confidential information.
- Difficulty monitoring school-wide performance.

The proposed system will provide one centralized source of accurate school information.

## 1.3 Product vision

To develop a secure, reliable, responsive and user-friendly school management platform that manages the complete student lifecycle from admission in Grade 9 to graduation or completion in Grade 12.

## 1.4 Definitions

| Term             | Meaning                                                          |
| ---------------- | ---------------------------------------------------------------- |
| HSMIS            | High School Management Information System                        |
| SRS              | Software Requirements Specification                              |
| RBAC             | Role-Based Access Control                                        |
| ERD              | Entity Relationship Diagram                                      |
| API              | Application Programming Interface                                |
| GPA              | Grade Point Average, where applicable                            |
| CRUD             | Create, Read, Update and Delete                                  |
| Academic Year    | School's annual academic period                                  |
| Semester         | One of two configured academic periods                           |
| Enrollment       | A student's registration in a particular academic year and grade |
| Section          | A subdivision of a grade, such as 9A or 10B                      |
| Homeroom Teacher | Teacher responsible for a particular class group                 |
| Assessment       | A test, quiz, assignment, practical or examination               |
| Audit Log        | Record of important system activities                            |

# 2. PROJECT OBJECTIVES

The system shall achieve the following objectives:

OBJ-01. Digitize student registration and admission.

OBJ-02. Centralize student, teacher and staff information.

OBJ-03. Manage Grades 9–12 and their academic structures.

OBJ-04. Support two-semester academic operations.

OBJ-05. Automatically calculate semester and annual academic results.

OBJ-06. Manage teacher assignments and timetables.

OBJ-07. Improve student and staff attendance management.

OBJ-08. Manage examinations, assessments and report cards.

OBJ-09. Provide separate portals for students and parents.

OBJ-10. Manage school fees, payments and financial records.

OBJ-11. Improve communication between the school and its stakeholders.

OBJ-12. Provide accurate administrative and academic reports.

OBJ-13. Protect confidential student and financial information.

OBJ-14. Preserve academic history throughout a student's school lifecycle.

# 3. SCOPE AND SYSTEM BOUNDARIES

## 3.1 Included in the system

The system shall include:

1. Authentication and authorization.
2. User and role management.
3. Student information management.
4. Admission and enrollment.
5. Academic year management.
6. Semester management.
7. Grade and section management.
8. Subject and curriculum management.
9. Teacher and department management.
10. Teacher-subject assignment.
11. Timetable management.
12. Student attendance.
13. Staff attendance.
14. Examination management.
15. Assessment and marks management.
16. Semester result calculation.
17. Annual result calculation.
18. Report card generation.
19. Student promotion and repetition.
20. Grade 12 examination tracking.
21. Assignment and homework management.
22. Parent portal.
23. Student portal.
24. Teacher portal.
25. Fee and payment management.
26. Communication and notifications.
27. Library management.
28. Discipline management.
29. Guidance and counseling.
30. Inventory management.
31. School calendar.
32. Reports and analytics.
33. System configuration.
34. Audit logging and backup management.

## 3.2 Excluded from the initial system

The following are outside the first release unless separately approved:

- Operating a national examination authority.
- Issuing official national examination results.
- National student identity verification services.
- Full government payroll integration.
- Full banking infrastructure.
- Native Android and iOS applications.
- Multi-school tenant management.
- AI-based automated decisions about student promotion.
- Online video conferencing infrastructure.

The system may later integrate with external services where authorized APIs are available.

## 3.3 System assumptions

ASM-01. The school operates Grades 9–12.

ASM-02. The academic year is divided into two semesters.

ASM-03. The school may configure annual result calculation rules.

ASM-04. Each student has one active enrollment in the school per academic year.

ASM-05. The school determines its own authorized grading and promotion policies.

ASM-06. The school has at least one authorized system administrator.

ASM-07. Users have access to a supported browser and internet connection.

ASM-08. Some school activities must remain operational during temporary connectivity problems through controlled offline-capable interfaces where implemented.

ASM-09. The school is the only institution in this deployment. No multi-tenant functionality is required.

# 4. STAKEHOLDERS AND ACTORS

## 4.1 Primary actors

| Actor                   | Main responsibility                        |
| ----------------------- | ------------------------------------------ |
| System Administrator    | Technical configuration and access control |
| Principal               | Overall school management                  |
| Vice Principal          | Delegated administrative supervision       |
| Academic Director       | Academic planning and result supervision   |
| Registrar               | Student admission and enrollment           |
| Examination Coordinator | Examination administration                 |
| Department Head         | Subject and teacher coordination           |
| Teacher                 | Teaching, attendance, assessment and marks |
| Homeroom Teacher        | Student monitoring and class supervision   |
| Accountant              | Financial configuration and oversight      |
| Cashier                 | Payment collection and receipts            |
| HR Officer              | Employee and staff records                 |
| Librarian               | Library operations                         |
| Guidance Counselor      | Student guidance and counseling            |
| Student                 | Access to personal academic information    |
| Parent/Guardian         | Access to linked children's information    |

## 4.2 Secondary actors

- SMS service provider.
- Email service provider.
- Payment service provider, if integrated.
- Backup storage service.
- External examination authority, where integration or authorized data exchange is possible.

# 5. ROLE AND PERMISSION REQUIREMENTS

The system shall implement Role-Based Access Control with additional data-scope restrictions.

A role grants permission to perform an action. Data scope determines which records the user can access.

## 5.1 Roles

### R01 — Super Administrator

Responsibilities:

- Configure system-wide settings.
- Create and deactivate user accounts.
- Create roles and permissions.
- Configure school profile.
- Manage backups and audit logs.
- Configure academic system parameters.
- Manage integrations.

The Super Administrator must not automatically receive unrestricted access to confidential student medical records or other restricted data merely by virtue of technical administration.

### R02 — Principal

Responsibilities:

- View school-wide dashboards.
- Approve admissions where required.
- Approve academic results.
- Approve promotion decisions.
- Monitor staff and student performance.
- Approve financial policies and authorized discounts.
- View administrative reports.
- Approve delegated operations.

### R03 — Vice Principal

Responsibilities:

- Support principal operations.
- Monitor student attendance.
- Supervise discipline.
- Review assigned academic operations.
- Approve actions delegated by the principal.

### R04 — Academic Director

Responsibilities:

- Configure academic years and semesters.
- Manage grades, sections and subjects.
- Coordinate examinations.
- Monitor marks submission.
- Review results.
- Manage promotion preparation.
- Supervise academic reporting.

### R05 — Registrar

Responsibilities:

- Manage admission applications.
- Register students.
- Manage student records.
- Assign students to classes.
- Process transfers and withdrawals.
- Maintain guardian information.
- Generate student identifiers.

### R06 — Examination Coordinator

Responsibilities:

- Create examination schedules.
- Manage examination sessions.
- Monitor examination attendance.
- Monitor marks submission.
- Validate examination completion.
- Coordinate result preparation.

### R07 — Department Head

Responsibilities:

- Manage assigned department.
- Review subject assignments.
- Monitor teacher performance.
- Review subject results.
- Coordinate departmental reports.

### R08 — Teacher

Responsibilities:

- View assigned classes and subjects.
- Mark attendance.
- Create assignments.
- Record assessment marks.
- Provide student feedback.
- View assigned student performance.

### R09 — Homeroom Teacher

Responsibilities:

- Monitor assigned class.
- View students' overall performance.
- Monitor attendance.
- Submit student comments.
- Communicate with authorized parents.
- Refer students for academic or disciplinary support.

### R10 — Accountant

Responsibilities:

- Configure fees.
- Generate invoices.
- Monitor payments.
- Manage discounts and refunds within assigned authority.
- Generate financial reports.

### R11 — Cashier

Responsibilities:

- Record authorized payments.
- Generate receipts.
- View relevant invoice balances.
- Print payment receipts.

### R12 — HR Officer

Responsibilities:

- Manage staff records.
- Process leave requests.
- Manage staff attendance.
- Prepare payroll records where enabled.

### R13 — Librarian

Responsibilities:

- Manage library books.
- Issue and receive books.
- Track overdue books.
- Manage library fines.

### R14 — Guidance Counselor

Responsibilities:

- Manage permitted counseling records.
- Record student interventions.
- Refer students for support.
- Monitor assigned intervention cases.

### R15 — Student

Responsibilities:

- View personal profile.
- View timetable.
- View attendance.
- View assignments.
- View published examination results.
- Download report cards.
- View announcements.

### R16 — Parent/Guardian

Responsibilities:

- View verified linked students.
- Monitor attendance.
- View published results.
- View assignments.
- View fee balances.
- View receipts.
- Receive announcements.
- Submit authorized requests.

## 5.3 Permission matrix

Legend:

- F = Full authorized module access.
- R = Read.
- C = Create.
- U = Update.
- A = Approve.
- S = Restricted self/assigned-record access.
- — = No access by default.

| Module              | Admin | Principal | Academic Director | Registrar   | Teacher      | Student | Parent          | Accountant |
| ------------------- | ----- | --------- | ----------------- | ----------- | ------------ | ------- | --------------- | ---------- |
| User management     | F     | R         | —                 | —           | —            | —       | —               | —          |
| Student records     | F     | R         | R                 | F           | S            | S       | S               | Limited    |
| Admission           | F     | A         | R                 | F           | —            | —       | S               | —          |
| Academic setup      | F     | A         | F                 | R           | —            | —       | —               | —          |
| Teacher assignments | F     | A         | F                 | —           | S            | —       | —               | —          |
| Attendance          | F     | R         | R                 | R           | C/U assigned | S       | S               | —          |
| Timetable           | F     | R         | F                 | R           | S            | S       | S               | —          |
| Examinations        | F     | A         | F                 | R           | C/U assigned | S       | S               | —          |
| Marks               | F     | A         | R/A               | —           | C/U assigned | S       | S               | —          |
| Results             | F     | A         | A                 | R           | S            | S       | S               | —          |
| Finance             | F     | A/R       | —                 | R limited   | —            | Limited | S               | F          |
| HR                  | F     | A/R       | —                 | —           | S            | —       | —               | Limited    |
| Library             | F     | R         | R                 | —           | S            | S       | —               | —          |
| Reports             | F     | F         | F academic        | F admission | Assigned     | Own     | Linked children | F finance  |

The complete permission system must support more granular controls than this summary matrix.

For example:

- `student.read`
- `student.create`
- `student.update`
- `student.archive`
- `attendance.mark`
- `attendance.correct`
- `marks.enter`
- `marks.submit`
- `marks.review`
- `results.approve`
- `results.publish`
- `invoice.create`
- `payment.record`
- `payment.reverse`
- `user.manage`
- `audit.read`

## 5.4 Permission scope rules

PER-01. Teachers may only access their assigned classes and subjects.

PER-02. Students may only access their own personal and academic records.

PER-03. Parents may only access students linked through verified guardian relationships.

PER-04. Department Heads may access only their assigned department's records.

PER-05. Homeroom Teachers may access their assigned class's authorized information.

PER-06. Cashiers may record payments but cannot independently change fee structures.

PER-07. Teachers cannot publish official results.

PER-08. The person who enters marks must not approve their own submitted marks unless an explicitly authorized exception policy applies.

PER-09. Medical and counseling records must have separate restricted permissions.

PER-10. All permission checks must be enforced by the backend, not only by hiding frontend buttons.

# 6. FUNCTIONAL REQUIREMENTS

All requirements use unique identifiers. Each requirement must be implemented and tested unless explicitly excluded from the approved release.

## 6.1 Authentication and user management

### AUTH requirements

AUTH-001. The system shall allow authorized users to log in using their username or configured email and password.

AUTH-002. The system shall verify credentials securely.

AUTH-003. The system shall redirect users to the appropriate role-based dashboard.

AUTH-004. The system shall allow users to log out.

AUTH-005. The system shall allow users to change their passwords.

AUTH-006. The system shall support password reset through an approved verification method.

AUTH-007. The system shall allow administrators to create user accounts.

AUTH-008. The system shall support account activation and deactivation.

AUTH-009. The system shall enforce role and permission checks on every protected backend operation.

AUTH-010. The system shall maintain login history.

AUTH-011. The system shall implement configurable failed-login restrictions.

AUTH-012. The system shall automatically expire inactive sessions according to security policy.

AUTH-013. The system shall support optional two-factor authentication.

AUTH-014. The system shall prevent disabled users from accessing protected services.

AUTH-015. The system shall record important account and permission changes.

### User account generation

When a student is successfully enrolled:

1. Generate or confirm the student identifier.
2. Create the linked user account.
3. Assign the Student role.
4. Connect the account to the student profile.
5. Set an initial password or secure activation flow.
6. Notify the student through an approved channel.

Parent accounts must use a separate guardian verification and account-linking process.

## 6.2 School configuration

SCH-001. The system shall store the school's name, logo, address and contact information.

SCH-002. The system shall support school-specific academic configuration.

SCH-003. The system shall support Gregorian and Ethiopian calendar date presentation.

SCH-004. The system shall allow configuration of the academic year's start and end dates.

SCH-005. The system shall allow configuration of two semesters.

SCH-006. The system shall support English, Afaan Oromoo and Amharic interface translations.

SCH-007. The system shall support ETB as the default financial currency, with currency configuration where necessary.

SCH-008. The system shall allow administrators to configure grading policies.

SCH-009. The system shall allow authorized users to configure promotion policies.

SCH-010. The system shall allow configuration of school notification preferences.

## 6.3 Student management

STD-001. The system shall allow authorized users to register student records.

STD-002. Each student shall have a unique student identifier.

STD-003. The system shall store personal information.

STD-004. The system shall store guardian information.

STD-005. The system shall store emergency contacts.

STD-006. The system shall support student photographs.

STD-007. The system shall support student document uploads.

STD-008. The system shall maintain academic enrollment history.

STD-009. The system shall maintain transfer and withdrawal history.

STD-010. The system shall support student status management.

STD-011. The system shall provide student search and filtering.

STD-012. The system shall allow authorized profile updates.

STD-013. The system shall prevent unauthorized deletion of student records.

STD-014. The system shall allow authorized student profile exports.

STD-015. The system shall provide a consolidated student profile containing permitted academic, attendance and financial summaries.

### Student profile fields

Personal:

- Student ID.
- First name.
- Middle name.
- Last name.
- Gender.
- Date of birth.
- Photograph.
- Address.
- Contact information.

Academic:

- Admission number.
- Admission date.
- Academic year.
- Grade.
- Section.
- Enrollment status.
- Previous school.

Guardian:

- Guardian name.
- Relationship.
- Phone.
- Email.
- Address.
- Emergency contact.

Other:

- Uploaded documents.
- Attendance history.
- Assessment history.
- Semester results.
- Annual results.
- Promotion history.
- Authorized discipline records.

## 6.4 Admission and enrollment

ADM-001. The system shall allow admission applications to be registered.

ADM-002. The system shall generate unique application numbers.

ADM-003. The system shall store application documents.

ADM-004. The system shall support application status tracking.

ADM-005. The system shall allow registrars to review applications.

ADM-006. The system shall support admission approval and rejection.

ADM-007. The system shall support waiting-list status.

ADM-008. The system shall generate a student record after approval.

ADM-009. The system shall assign students to an academic year, grade and section.

ADM-010. The system shall link guardians to students.

ADM-011. The system shall preserve previous enrollment information.

ADM-012. The system shall prevent duplicate active enrollments in the same school and academic year.

ADM-013. The system shall support student transfer and withdrawal.

ADM-014. The system shall allow authorized users to print admission confirmations.

ADM-015. The system shall generate admission statistics.

## 6.5 Academic year and semester management

ACA-001. The system shall support academic-year creation.

ACA-002. Each academic year shall contain two semesters.

ACA-003. Each semester shall have configurable start and end dates.

ACA-004. The system shall support academic-year activation and closure.

ACA-005. The system shall prevent overlapping active academic-year configurations unless explicitly authorized.

ACA-006. The system shall associate enrollment records with academic years.

ACA-007. The system shall preserve historical academic data.

ACA-008. The system shall support semester-specific examination and result periods.

ACA-009. The system shall support annual result calculation.

ACA-010. The system shall restrict changes to closed academic periods.

## 6.6 Grade, section and subject management

ACA-011. The system shall support Grades 9, 10, 11 and 12.

ACA-012. The system shall support multiple sections within each grade.

ACA-013. The system shall support configurable subject lists.

ACA-014. The system shall support required and elective subjects.

ACA-015. The system shall support grade-specific subject availability.

ACA-016. The system shall support configurable subject combinations and academic streams.

ACA-017. The system shall allow subjects to be assigned to departments.

ACA-018. The system shall support subject credit or workload information where applicable.

ACA-019. The system shall support subject activation and deactivation without deleting historical results.

ACA-020. The system shall allow authorized users to configure subject requirements for each grade.

## 6.7 Department and teacher management

TCH-001. The system shall allow teacher registration.

TCH-002. Each teacher shall have a unique employee identifier.

TCH-003. The system shall store teacher qualifications.

TCH-004. The system shall support department assignments.

TCH-005. The system shall support teacher-subject assignments.

TCH-006. The system shall support teacher-grade and section assignments.

TCH-007. The system shall support homeroom teacher assignment.

TCH-008. The system shall support teacher employment status.

TCH-009. The system shall maintain historical teaching assignments.

TCH-010. The system shall support teacher workload reports.

TCH-011. The system shall support staff attendance and leave records.

TCH-012. The system shall notify teachers of approved assignments.

## 6.8 Timetable management

TIM-001. The system shall allow authorized users to create class timetables.

TIM-002. The system shall support configurable school days.

TIM-003. The system shall support configurable periods and break times.

TIM-004. The system shall assign teachers, subjects, classes and classrooms.

TIM-005. The system shall detect teacher scheduling conflicts.

TIM-006. The system shall detect class scheduling conflicts.

TIM-007. The system shall detect classroom scheduling conflicts.

TIM-008. The system shall provide teacher timetable views.

TIM-009. The system shall provide student timetable views.

TIM-010. The system shall allow timetable publication.

TIM-011. The system shall preserve previous timetable versions.

## 6.9 Student attendance

ATT-001. Teachers shall be able to open assigned class attendance sessions.

ATT-002. The system shall automatically load enrolled students.

ATT-003. Teachers shall record present, absent, late and excused statuses.

ATT-004. The system shall support subject-based attendance where enabled.

ATT-005. The system shall prevent duplicate attendance for the same student and session.

ATT-006. The system shall calculate attendance summaries.

ATT-007. The system shall calculate attendance percentages.

ATT-008. The system shall allow authorized attendance corrections.

ATT-009. The system shall record attendance correction history.

ATT-010. The system shall allow homeroom teachers to view assigned-class attendance.

ATT-011. The system shall generate daily, monthly and semester attendance reports.

ATT-012. The system shall support configurable absence notifications to parents.

ATT-013. The system shall support attendance locking and authorized reopening.

## 6.10 Examination and assessment management

EXM-001. The system shall allow authorized users to create examinations.

EXM-002. The system shall support examination types.

EXM-003. The system shall support quizzes, assignments, classwork, practical work, midterms and final examinations.

EXM-004. The system shall associate assessments with academic years and semesters.

EXM-005. The system shall associate assessments with grades, sections and subjects.

EXM-006. The system shall assign assessment responsibilities to authorized teachers.

EXM-007. The system shall define maximum assessment marks.

EXM-008. The system shall support configurable assessment weights.

EXM-009. The system shall support examination schedules.

EXM-010. The system shall support examination attendance.

EXM-011. The system shall allow teachers to enter marks.

EXM-012. The system shall validate marks against configured maximum scores.

EXM-013. The system shall support absent, exempt and incomplete assessment statuses.

EXM-014. The system shall allow marks to be saved as drafts.

EXM-015. The system shall allow marks to be submitted for review.

EXM-016. The system shall allow authorized academic officers to review marks.

EXM-017. The system shall support returning marks for correction.

EXM-018. The system shall preserve mark-change history.

EXM-019. The system shall prevent unauthorized result publication.

EXM-020. The system shall support controlled correction after result publication.

## 6.11 Semester and annual results

RES-001. The system shall calculate assessment totals according to configured rules.

RES-002. The system shall calculate subject totals.

RES-003. The system shall calculate subject percentages.

RES-004. The system shall map percentages to configured grades.

RES-005. The system shall support configured pass/fail rules.

RES-006. The system shall calculate semester results.

RES-007. The system shall calculate annual results.

RES-008. The system shall support subject averages.

RES-009. The system shall support class averages.

RES-010. The system shall support GPA calculations where applicable.

RES-011. The system shall support class ranking only when enabled by school policy.

RES-012. The system shall support result approval.

RES-013. The system shall support result publication.

RES-014. The system shall prevent students from accessing unpublished results.

RES-015. The system shall maintain historical semester and annual results.

RES-016. The system shall generate individual student result summaries.

RES-017. The system shall generate class and grade performance reports.

RES-018. The system shall support annual results that are calculated from the two semesters using the school's configured policy.

## 6.12 Report cards and transcripts

RPT-001. The system shall generate semester report cards.

RPT-002. The system shall generate annual report cards.

RPT-003. Report cards shall display student identity and enrollment information.

RPT-004. Report cards shall display subjects and corresponding marks.

RPT-005. Report cards shall display grades and performance summaries.

RPT-006. Report cards shall display attendance summaries.

RPT-007. Report cards shall support teacher comments.

RPT-008. Report cards shall support authorized principal comments.

RPT-009. Report cards shall include approval and publication information.

RPT-010. The system shall support printable PDF report cards.

RPT-011. The system shall generate academic transcripts for authorized students.

RPT-012. The system shall preserve previously issued report cards.

## 6.13 Student promotion and progression

PRO-001. The system shall support promotion from Grades 9 to 10, 10 to 11 and 11 to 12.

PRO-002. The system shall evaluate students using configured promotion policies.

PRO-003. The system shall generate proposed promotion decisions.

PRO-004. The system shall support promoted, repeating, graduated and review-required statuses.

PRO-005. The system shall allow authorized review of promotion decisions.

PRO-006. The system shall require appropriate approval before finalizing promotion.

PRO-007. The system shall create the next academic-year enrollment for promoted students.

PRO-008. The system shall preserve previous academic records.

PRO-009. The system shall support manual review of exceptional cases.

PRO-010. The system shall prevent automatic promotion when required results are incomplete.

## 6.14 Grade 12 examination tracking

G12-001. The system shall identify Grade 12 students.

G12-002. The system shall support examination eligibility checklists configured by the school.

G12-003. The system shall manage mock examinations.

G12-004. The system shall monitor Grade 12 subject performance.

G12-005. The system shall record national examination registration information where available.

G12-006. The system shall record external examination identifiers where authorized.

G12-007. The system shall record official external results when supplied through authorized sources or manual entry.

G12-008. The system shall distinguish school examination results from external national examination results.

G12-009. The system shall support graduation/completion verification.

G12-010. The system shall generate Grade 12 completion reports.

## 6.15 Assignment and homework management

ASN-001. Teachers shall create assignments for assigned classes.

ASN-002. Assignments shall contain title, instructions and deadline.

ASN-003. Teachers shall attach learning materials.

ASN-004. Students shall view assigned work.

ASN-005. Students shall submit answers or permitted attachments.

ASN-006. Teachers shall review submissions.

ASN-007. Teachers shall provide feedback.

ASN-008. Teachers shall record scores.

ASN-009. The system shall identify late submissions.

ASN-010. Students shall view feedback on their own submissions.

## 6.16 Finance and fee management

FIN-001. The system shall allow authorized users to create fee categories.

FIN-002. The system shall support tuition, registration, examination and other approved fees.

FIN-003. The system shall allow fees to be assigned by grade or individual student.

FIN-004. The system shall generate student invoices.

FIN-005. The system shall support partial payments.

FIN-006. The system shall calculate outstanding balances.

FIN-007. The system shall record payment date, amount and reference.

FIN-008. The system shall generate receipts.

FIN-009. The system shall support authorized discounts and scholarships.

FIN-010. The system shall support refunds and transaction reversals.

FIN-011. The system shall maintain financial transaction history.

FIN-012. The system shall generate daily and monthly financial reports.

FIN-013. The system shall restrict payment recording to authorized users.

FIN-014. The system shall prevent confirmed payments from being permanently deleted.

FIN-015. The system shall support reconciliation of invoices and payments.

## 6.17 Parent portal

PAR-001. Parents shall have separate authenticated accounts.

PAR-002. Parents shall view only verified linked students.

PAR-003. Parents shall view student attendance.

PAR-004. Parents shall view published semester results.

PAR-005. Parents shall view published annual results.

PAR-006. Parents shall download available report cards.

PAR-007. Parents shall view assignments.

PAR-008. Parents shall view fee invoices and balances where permitted.

PAR-009. Parents shall view payment receipts.

PAR-010. Parents shall receive configured school notifications.

PAR-011. Parents shall submit authorized absence explanations.

PAR-012. Parents shall update permitted contact information subject to school verification.

## 6.18 Student portal

STP-001. Students shall access personal profiles.

STP-002. Students shall view their assigned grade and section.

STP-003. Students shall view their timetable.

STP-004. Students shall view attendance history.

STP-005. Students shall view assignments.

STP-006. Students shall view examination schedules.

STP-007. Students shall view published results.

STP-008. Students shall download report cards.

STP-009. Students shall view announcements.

STP-010. Students shall update only permitted profile fields.

## 6.19 Communication and notifications

COM-001. Authorized users shall create announcements.

COM-002. Announcements shall target specific grades, sections or user groups.

COM-003. The system shall support in-app notifications.

COM-004. The system shall support email notifications when configured.

COM-005. The system shall support SMS integration through an approved provider.

COM-006. The system shall notify parents of configured attendance events.

COM-007. The system shall notify students of assignments.

COM-008. The system shall notify relevant users when examination schedules are published.

COM-009. The system shall notify relevant users when results are published.

COM-010. The system shall notify parents about invoices and payment confirmations.

COM-011. The system shall maintain notification history.

COM-012. The system shall allow authorized users to configure notification preferences.

## 6.20 Library management

LIB-001. The system shall register library books.

LIB-002. The system shall manage book copies.

LIB-003. The system shall manage book categories and authors.

LIB-004. The system shall issue books to authorized students and staff.

LIB-005. The system shall record issue and return dates.

LIB-006. The system shall track overdue books.

LIB-007. The system shall support book reservations.

LIB-008. The system shall support configurable library fines.

LIB-009. The system shall generate borrowing reports.

## 6.21 Discipline and guidance counseling

DIS-001. Authorized staff shall record student incidents.

DIS-002. Incidents shall include category, date, description and responsible staff member.

DIS-003. The system shall support incident investigation.

DIS-004. The system shall support approved disciplinary actions.

DIS-005. The system shall track incident resolution.

DIS-006. The system shall support parent notification according to policy.

DIS-007. The system shall restrict sensitive disciplinary information.

GUI-001. Authorized counselors shall create intervention records.

GUI-002. Counseling records shall have restricted permissions.

GUI-003. The system shall support follow-up dates.

GUI-004. The system shall support student referrals.

GUI-005. The system shall preserve confidentiality.

## 6.22 Human resources and staff administration

HR-001. The system shall register employees.

HR-002. The system shall store employment information.

HR-003. The system shall manage employee departments.

HR-004. The system shall record staff attendance.

HR-005. The system shall manage leave applications.

HR-006. The system shall support leave approval workflows.

HR-007. The system shall maintain staff employment history.

HR-008. The system shall support payroll records if enabled.

HR-009. Salary information shall have restricted access.

## 6.23 Inventory management

INV-001. Authorized users shall register school assets.

INV-002. The system shall manage stock categories.

INV-003. The system shall record stock purchases.

INV-004. The system shall record stock issuance.

INV-005. The system shall record stock returns.

INV-006. The system shall track damaged assets.

INV-007. The system shall support minimum stock alerts.

INV-008. The system shall generate inventory reports.

## 6.24 School calendar

CAL-001. The system shall manage academic events.

CAL-002. The system shall manage examination dates.

CAL-003. The system shall manage holidays.

CAL-004. The system shall manage school meetings.

CAL-005. The system shall support event notifications.

CAL-006. Users shall view calendar events according to permissions.

## 6.25 Reports and analytics

ANA-001. The system shall provide role-specific dashboards.

ANA-002. The principal shall view school-wide enrollment statistics.

ANA-003. The principal shall view attendance statistics.

ANA-004. The academic director shall view grade and subject performance.

ANA-005. The system shall identify students below configured academic thresholds.

ANA-006. The system shall identify attendance patterns requiring attention.

ANA-007. Teachers shall view assigned-class performance.

ANA-008. Registrars shall view admission statistics.

ANA-009. Accountants shall view financial summaries.

ANA-010. The system shall support report filtering by academic year, semester, grade, section and subject.

ANA-011. The system shall support PDF and spreadsheet exports where authorized.

ANA-012. Reports shall respect user permissions and data scope.

## 6.26 Audit logs and system administration

AUD-001. The system shall record important user activities.

AUD-002. Audit records shall include actor, action, target record, timestamp and relevant change information.

AUD-003. The system shall record mark changes.

AUD-004. The system shall record financial corrections.

AUD-005. The system shall record permission changes.

AUD-006. The system shall record result publication.

AUD-007. The system shall restrict audit-log access.

AUD-008. The system shall support backup and restoration procedures.

AUD-009. The system shall provide system health and error monitoring.

AUD-010. Audit records shall not be editable through ordinary application interfaces.

# **7. DETAILED OPERATIONAL WORKFLOWS**

The following workflows define the expected behavior across departments. A workflow must be implemented as a controlled sequence of actions, not just a collection of CRUD screens.

## **7.1 Academic year initialization**

**Actor:** Principal, Academic Director, System Administrator.

\#chatgpt-mermaid-\_r_100\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_100\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_100\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_100\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_100\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_100\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_100\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_100\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_100\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_100\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_100\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_100\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_100\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_100\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_100\_ p{margin:0;}#chatgpt-mermaid-\_r_100\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_100\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_100\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_100\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_100\_ .label text,#chatgpt-mermaid-\_r_100\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_100\_ .node rect,#chatgpt-mermaid-\_r_100\_ .node circle,#chatgpt-mermaid-\_r_100\_ .node ellipse,#chatgpt-mermaid-\_r_100\_ .node polygon,#chatgpt-mermaid-\_r_100\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_100\_ .rough-node .label text,#chatgpt-mermaid-\_r_100\_ .node .label text,#chatgpt-mermaid-\_r_100\_ .image-shape .label,#chatgpt-mermaid-\_r_100\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_100\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_100\_ .rough-node .label,#chatgpt-mermaid-\_r_100\_ .node .label,#chatgpt-mermaid-\_r_100\_ .image-shape .label,#chatgpt-mermaid-\_r_100\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_100\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_100\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_100\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_100\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_100\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_100\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_100\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_100\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_100\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_100\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_100\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_100\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_100\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_100\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_100\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_100\_ .icon-shape,#chatgpt-mermaid-\_r_100\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_100\_ .icon-shape p,#chatgpt-mermaid-\_r_100\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_100\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_100\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_100\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_100\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_100\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_100\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_100\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_100\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_100\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_100\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_100\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_100\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_100\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_100\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_100\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_100\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_100\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_100\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_100\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_100\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_100\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_100\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_100\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_100\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_100\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_100\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_100\_ .node rect,#chatgpt-mermaid-\_r_100\_ .node circle,#chatgpt-mermaid-\_r_100\_ .node ellipse,#chatgpt-mermaid-\_r_100\_ .node polygon,#chatgpt-mermaid-\_r_100\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_100\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_100\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_100\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_100\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_100\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Principal Requests NewAcademic YearCreate Academic YearConfigure Semester 1 and 2Configure Grades 9–12Configure SectionsConfigure Subjects andCurriculumAssign TeachersAssign Homeroom TeachersConfigure Grading RulesConfigure TimetableConfigure FeesConfiguration Valid?Return MissingConfigurationPrincipal ApprovesActivate Academic YearOpen EnrollmentNoYes

**Preconditions**

- User has the required academic administration permission.
- The previous academic year is appropriately closed or archived.
- The academic year does not conflict with an existing active configuration.

**Postconditions**

- Academic year is available.
- Both semesters are configured.
- Grade and section structures are available.
- Teachers can be assigned.
- Enrollment can begin.

## **7.2 Admission and student enrollment**

**Actors:** Applicant/Parent, Registrar, Principal, Accountant.

\#chatgpt-mermaid-\_r_107\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_107\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_107\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_107\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_107\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_107\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_107\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_107\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_107\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_107\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_107\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_107\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_107\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_107\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_107\_ p{margin:0;}#chatgpt-mermaid-\_r_107\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_107\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_107\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_107\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_107\_ .label text,#chatgpt-mermaid-\_r_107\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_107\_ .node rect,#chatgpt-mermaid-\_r_107\_ .node circle,#chatgpt-mermaid-\_r_107\_ .node ellipse,#chatgpt-mermaid-\_r_107\_ .node polygon,#chatgpt-mermaid-\_r_107\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_107\_ .rough-node .label text,#chatgpt-mermaid-\_r_107\_ .node .label text,#chatgpt-mermaid-\_r_107\_ .image-shape .label,#chatgpt-mermaid-\_r_107\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_107\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_107\_ .rough-node .label,#chatgpt-mermaid-\_r_107\_ .node .label,#chatgpt-mermaid-\_r_107\_ .image-shape .label,#chatgpt-mermaid-\_r_107\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_107\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_107\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_107\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_107\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_107\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_107\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_107\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_107\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_107\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_107\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_107\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_107\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_107\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_107\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_107\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_107\_ .icon-shape,#chatgpt-mermaid-\_r_107\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_107\_ .icon-shape p,#chatgpt-mermaid-\_r_107\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_107\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_107\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_107\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_107\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_107\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_107\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_107\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_107\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_107\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_107\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_107\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_107\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_107\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_107\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_107\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_107\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_107\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_107\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_107\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_107\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_107\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_107\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_107\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_107\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_107\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_107\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_107\_ .node rect,#chatgpt-mermaid-\_r_107\_ .node circle,#chatgpt-mermaid-\_r_107\_ .node ellipse,#chatgpt-mermaid-\_r_107\_ .node polygon,#chatgpt-mermaid-\_r_107\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_107\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_107\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_107\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_107\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_107\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Applicant / ParentSubmit ApplicationGenerate ApplicationNumberUpload Required DocumentsRegistrar ReviewsComplete?Request CorrectionsAdmission AssessmentPrincipal / DelegateDecisionApproved?Reject or WaitlistCreate Student ProfileGenerate Student IDLink GuardianAssign Grade and SectionCreate EnrollmentGenerate Fee InvoiceCreate Student AccountConfirm EnrollmentNoYesNoYes

**Alternative scenarios**

- Application is rejected.
- Applicant is placed on a waiting list.
- Documents are incomplete.
- A duplicate student record is detected.
- No suitable class capacity is available.
- Parent account verification fails.

**Postconditions**

- A valid student record exists.
- Guardian relationships are stored.
- Student enrollment is active.
- The student appears in the appropriate class list.
- Student account is linked to the correct student.

## **7.3 Student transfer workflow**

**Actor:** Registrar.

1. Search for the existing student.
2. Open the student profile.
3. Create a transfer request.
4. Enter transfer date and reason.
5. Verify outstanding requirements according to school policy.
6. Obtain required approval.
7. Close the active enrollment with an effective date.
8. Change student status to transferred.
9. Preserve all previous attendance, marks and financial records.
10. Generate a transfer document if required.

The system must not delete the student record.

## **7.4 Teacher assignment workflow**

**Actors:** Department Head, Academic Director, Principal.

1. Academic Director configures subjects.
2. Department Head reviews available teachers.
3. Department Head proposes assignments.
4. System checks subject qualification and scheduling conflicts.
5. Academic Director reviews assignments.
6. Principal approves where required.
7. System publishes assignments.
8. Teachers receive notifications.
9. Teacher dashboards display assigned subjects and classes.

## **7.5 Daily teaching workflow**

**Actor:** Teacher.

\#chatgpt-mermaid-\_r_10e\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_10e\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_10e\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_10e\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_10e\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10e\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_10e\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_10e\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_10e\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_10e\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_10e\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_10e\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_10e\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_10e\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_10e\_ p{margin:0;}#chatgpt-mermaid-\_r_10e\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10e\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10e\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10e\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_10e\_ .label text,#chatgpt-mermaid-\_r_10e\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10e\_ .node rect,#chatgpt-mermaid-\_r_10e\_ .node circle,#chatgpt-mermaid-\_r_10e\_ .node ellipse,#chatgpt-mermaid-\_r_10e\_ .node polygon,#chatgpt-mermaid-\_r_10e\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_10e\_ .rough-node .label text,#chatgpt-mermaid-\_r_10e\_ .node .label text,#chatgpt-mermaid-\_r_10e\_ .image-shape .label,#chatgpt-mermaid-\_r_10e\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_10e\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_10e\_ .rough-node .label,#chatgpt-mermaid-\_r_10e\_ .node .label,#chatgpt-mermaid-\_r_10e\_ .image-shape .label,#chatgpt-mermaid-\_r_10e\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_10e\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_10e\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_10e\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_10e\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_10e\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_10e\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_10e\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_10e\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_10e\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_10e\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_10e\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10e\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10e\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_10e\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10e\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_10e\_ .icon-shape,#chatgpt-mermaid-\_r_10e\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_10e\_ .icon-shape p,#chatgpt-mermaid-\_r_10e\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_10e\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_10e\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_10e\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_10e\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_10e\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_10e\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_10e\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_10e\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_10e\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10e\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_10e\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_10e\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_10e\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10e\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_10e\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_10e\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10e\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_10e\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_10e\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10e\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_10e\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10e\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_10e\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_10e\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_10e\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_10e\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_10e\_ .node rect,#chatgpt-mermaid-\_r_10e\_ .node circle,#chatgpt-mermaid-\_r_10e\_ .node ellipse,#chatgpt-mermaid-\_r_10e\_ .node polygon,#chatgpt-mermaid-\_r_10e\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_10e\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_10e\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_10e\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_10e\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_10e\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Teacher Logs InOpen Teacher DashboardView Today's TimetableSelect Class and SubjectOpen Attendance SessionMark AttendanceSubmit AttendanceConduct LessonCreate Assignment ifNeededStudents Submit WorkTeacher Reviews WorkEnter Assessment MarksSave Draft or Submit

The teacher must not access classes that are not assigned to them without explicit additional authorization.

## **7.6 Examination workflow**

**Actors:** Examination Coordinator, Teachers, Academic Director, Principal.

\#chatgpt-mermaid-\_r_10l\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_10l\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_10l\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_10l\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_10l\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10l\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_10l\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_10l\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_10l\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_10l\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_10l\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_10l\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_10l\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_10l\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_10l\_ p{margin:0;}#chatgpt-mermaid-\_r_10l\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10l\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10l\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10l\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_10l\_ .label text,#chatgpt-mermaid-\_r_10l\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10l\_ .node rect,#chatgpt-mermaid-\_r_10l\_ .node circle,#chatgpt-mermaid-\_r_10l\_ .node ellipse,#chatgpt-mermaid-\_r_10l\_ .node polygon,#chatgpt-mermaid-\_r_10l\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_10l\_ .rough-node .label text,#chatgpt-mermaid-\_r_10l\_ .node .label text,#chatgpt-mermaid-\_r_10l\_ .image-shape .label,#chatgpt-mermaid-\_r_10l\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_10l\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_10l\_ .rough-node .label,#chatgpt-mermaid-\_r_10l\_ .node .label,#chatgpt-mermaid-\_r_10l\_ .image-shape .label,#chatgpt-mermaid-\_r_10l\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_10l\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_10l\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_10l\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_10l\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_10l\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_10l\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_10l\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_10l\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_10l\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_10l\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_10l\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10l\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10l\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_10l\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10l\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_10l\_ .icon-shape,#chatgpt-mermaid-\_r_10l\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_10l\_ .icon-shape p,#chatgpt-mermaid-\_r_10l\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_10l\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_10l\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_10l\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_10l\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_10l\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_10l\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_10l\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_10l\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_10l\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10l\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_10l\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_10l\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_10l\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10l\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_10l\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_10l\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10l\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_10l\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_10l\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10l\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_10l\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10l\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_10l\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_10l\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_10l\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_10l\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_10l\_ .node rect,#chatgpt-mermaid-\_r_10l\_ .node circle,#chatgpt-mermaid-\_r_10l\_ .node ellipse,#chatgpt-mermaid-\_r_10l\_ .node polygon,#chatgpt-mermaid-\_r_10l\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_10l\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_10l\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_10l\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_10l\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_10l\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Create ExaminationConfigure Academic PeriodSelect Grades and SubjectsSet Assessment RulesCreate Exam SchedulePublish ScheduleConduct ExaminationRecord Exam AttendanceTeachers Enter MarksValidate MarksSubmit MarksAcademic ReviewApproved?Return to TeacherCalculate Subject ResultsPrepare Semester ResultsPrincipal ApprovalPublish ResultsGenerate Report CardsNoYes

**Postconditions**

- All approved marks are stored.
- Subject results are calculated.
- Approved semester results are published.
- Students and verified parents can view the published information.

## **7.7 Semester result calculation**

The system must distinguish assessment totals, semester results and annual results.

Example configuration:

| Assessment        | Weight |
| ----------------- | ------ |
| Classwork         | 10%    |
| Homework          | 10%    |
| Quiz              | 10%    |
| Midterm           | 20%    |
| Final examination | 50%    |
| Total             | 100%   |

These are illustrative weights, not mandatory national grading rules.

If the marks are recorded on their configured maximum scales, the system normalizes each component and applies its configured weight.

\\[ S=\sum\_{i=1}^{n}\left(\frac{M_i}{X_i}\times W_i\right) \\]

Where:

- \\(M_i\\) = student's mark.
- \\(X_i\\) = maximum possible mark.
- \\(W_i\\) = assessment contribution in points.
- \\(S\\) = final semester score.

For example:

| Assessment | Student mark | Maximum | Weight |
| ---------- | ------------ | ------- | ------ |
| Classwork  | 8            | 10      | 10     |
| Homework   | 9            | 10      | 10     |
| Quiz       | 7            | 10      | 10     |
| Midterm    | 16           | 20      | 20     |
| Final      | 40           | 50      | 50     |

The final result is 80/100.

The system must also handle:

- Exempt assessments.
- Approved absences.
- Missing marks.
- Incomplete assessments.
- Different maximum marks.
- Different grading policies by academic year or grade.

Missing marks must not silently become zero.

## **7.8 Annual result calculation**

The school configures the annual calculation policy.

For a simple equal-semester policy:

\\[ A=\frac{S_1+S_2}{2} \\]

Where:

- \\(S_1\\) = Semester 1 result.
- \\(S_2\\) = Semester 2 result.
- \\(A\\) = Annual result.

If the school chooses different semester contributions:

\\[ A=(S_1\times W_1)+(S_2\times W_2) \\]

The annual weights must total 100%.

The system must preserve the calculation method used for each academic year, so changing a future grading policy does not silently recalculate historical results.

## **7.9 Promotion workflow**

**Actors:** Academic Director, Class Teacher, Principal.

1. Close the relevant semester assessment period.
2. Verify all required subject results.
3. Calculate annual results.
4. Apply configured promotion rules.
5. Generate proposed promotion outcomes.
6. Identify students requiring review.
7. Allow authorized teachers to provide recommendations.
8. Academic Director reviews the proposals.
9. Principal approves final decisions.
10. Create the next academic-year enrollments.
11. Archive the previous academic enrollment.
12. Publish promotion decisions to authorized users.

Possible outcomes:

- Promoted.
- Repeating.
- Graduated.
- Withdrawn.
- Transfer pending.
- Review required.

## **7.10 Grade 12 completion workflow**

1. Identify Grade 12 students.
2. Verify school academic records.
3. Review required subject results.
4. Verify configured completion requirements.
5. Record national examination registration information.
6. Record official external examination results when available.
7. Separate internal school marks from external examination marks.
8. Verify outstanding administrative requirements.
9. Approve completion status.
10. Generate final transcript or completion document according to school authorization.
11. Archive the student's academic history.

The system must not independently declare a student eligible for a government-issued certificate without the relevant official authority's confirmation.

## **7.11 Finance workflow**

**Actors:** Accountant, Cashier, Parent/Student.

1. Accountant creates fee categories.
2. Accountant configures applicable fees.
3. Fees are assigned to students.
4. System generates invoices.
5. Parent or student views the invoice.
6. Cashier receives payment.
7. Cashier records payment details.
8. System validates the transaction.
9. System updates the invoice balance.
10. System generates a receipt.
11. Parent receives a confirmation notification.
12. Accountant reviews reconciliation reports.

## **7.12 Parent linking workflow**

1. Registrar records guardian details.
2. Guardian receives an account invitation or requests access.
3. Guardian completes identity verification according to school policy.
4. System links guardian to the relevant student.
5. Authorized school officer confirms the relationship.
6. Guardian accesses only the linked student's permitted records.
7. Changes to guardian relationships are recorded in audit logs.

# **8. SYSTEM BUSINESS RULES**

Business rules must be enforced on the backend and at the database level where appropriate.

| ID     | Rule                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------- |
| BR-001 | Every student must have a unique identifier.                                                    |
| BR-002 | Every teacher must have a unique employee identifier.                                           |
| BR-003 | Every academic year must have two configured semesters.                                         |
| BR-004 | A student may have only one active enrollment in this school per academic year.                 |
| BR-005 | A student must be enrolled before appearing in active class lists.                              |
| BR-006 | A teacher can only enter marks for authorized assignments.                                      |
| BR-007 | Marks cannot exceed the assessment maximum.                                                     |
| BR-008 | Missing marks must not automatically be interpreted as zero.                                    |
| BR-009 | Only authorized users can approve results.                                                      |
| BR-010 | Published results require an authorized correction workflow for changes.                        |
| BR-011 | Semester and annual results must use the applicable saved grading policy.                       |
| BR-012 | Annual results cannot be finalized if required semester results are incomplete.                 |
| BR-013 | Promotion decisions must use approved school policy.                                            |
| BR-014 | Previous academic enrollments must remain accessible to authorized users.                       |
| BR-015 | Attendance records cannot be duplicated within the same session.                                |
| BR-016 | Attendance corrections must be traceable.                                                       |
| BR-017 | A payment must reference a valid financial transaction or invoice.                              |
| BR-018 | Confirmed payments cannot be permanently deleted.                                               |
| BR-019 | Financial corrections must use authorized reversals or refunds.                                 |
| BR-020 | Parents may access only verified linked students.                                               |
| BR-021 | Students may access only their own private records.                                             |
| BR-022 | Teachers may access only authorized class and subject records.                                  |
| BR-023 | Medical and counseling information requires restricted permissions.                             |
| BR-024 | Academic-year closure must not destroy historical records.                                      |
| BR-025 | Every important approval must identify the approving user.                                      |
| BR-026 | Every important system operation must be auditable.                                             |
| BR-027 | School grading and promotion policies must be versioned.                                        |
| BR-028 | Timetable assignments must not create teacher, classroom or class conflicts.                    |
| BR-029 | Result publication must be an explicit authorized action.                                       |
| BR-030 | Changes to historical academic configuration must not silently modify already approved results. |

# **9. EXCEPTION AND ERROR HANDLING**

The system must explicitly handle abnormal conditions.

| Scenario                        | Expected behavior                                |
| ------------------------------- | ------------------------------------------------ |
| Duplicate student registration  | Warn and prevent duplicate enrollment            |
| Missing required student data   | Reject submission with field-specific validation |
| Teacher not assigned to subject | Deny marks entry                                 |
| Marks above maximum             | Reject invalid marks                             |
| Missing assessment marks        | Flag incomplete result                           |
| Unauthorized result publication | Deny and log attempt                             |
| Parent not verified             | Deny student record access                       |
| Duplicate payment reference     | Detect and prevent duplicate transaction         |
| Partial payment                 | Update remaining balance                         |
| Student transfer                | Preserve historical records                      |
| Teacher leaves school           | Preserve historical assignments                  |
| Section changes                 | Record old and new section with effective date   |
| Academic year closed            | Prevent ordinary modifications                   |
| Network interruption            | Avoid duplicate operations on retry              |
| Failed PDF generation           | Report error without corrupting academic records |
| Backup failure                  | Notify administrator and record failure          |

# **10. DATABASE DESIGN**

## **10.1 Database technology**

Recommended: PostgreSQL.

The database shall use:

- Relational tables.
- Primary keys.
- Foreign keys.
- Unique constraints.
- Check constraints.
- Transactions.
- Indexes.
- Referential integrity.
- Appropriate historical record handling.

Use UUID primary keys for major entities or another consistent identifier strategy. Human-readable student IDs should be separate from database primary keys.

## **10.2 Database domains and tables**

### **A. Identity and authorization**

| Table            | Important fields                                        |
| ---------------- | ------------------------------------------------------- |
| users            | id, username, email, password_hash, status              |
| roles            | id, name, description                                   |
| permissions      | id, key, description                                    |
| user_roles       | user_id, role_id                                        |
| role_permissions | role_id, permission_id                                  |
| user_sessions    | id, user_id, expires_at                                 |
| login_history    | id, user_id, login_time, result                         |
| audit_logs       | id, user_id, action, entity_type, entity_id, created_at |

### **B. School configuration**

| Table              | Important fields                                 |
| ------------------ | ------------------------------------------------ |
| school_profile     | id, name, logo, address, phone                   |
| system_settings    | id, setting_key, setting_value                   |
| academic_years     | id, name, start_date, end_date, status           |
| semesters          | id, academic_year_id, name, start_date, end_date |
| grading_policies   | id, name, version, status                        |
| promotion_policies | id, academic_year_id, policy_data                |

### **C. Student management**

| Table                  | Important fields                                                       |
| ---------------------- | ---------------------------------------------------------------------- |
| students               | id, student_number, first_name, last_name, date_of_birth, status       |
| guardians              | id, name, phone, email, address                                        |
| student_guardians      | student_id, guardian_id, relationship, is_primary, verification_status |
| student_documents      | id, student_id, document_type, file_path                               |
| student_enrollments    | id, student_id, academic_year_id, grade_id, section_id, status         |
| student_transfers      | id, student_id, from_section_id, to_section_id, effective_date         |
| student_status_history | id, student_id, old_status, new_status, changed_at                     |

### **D. Admission**

| Table                  | Important fields                                                |
| ---------------------- | --------------------------------------------------------------- |
| admission_applications | id, application_number, applicant_name, requested_grade, status |
| admission_documents    | id, application_id, document_type, file_path                    |
| admission_reviews      | id, application_id, reviewer_id, decision, comments             |
| admission_decisions    | id, application_id, decision, approved_by, approved_at          |

### **E. Academic management**

| Table                     | Important fields                       |
| ------------------------- | -------------------------------------- |
| grades                    | id, name, grade_number                 |
| sections                  | id, grade_id, name, capacity           |
| departments               | id, name, description                  |
| subjects                  | id, code, name, department_id          |
| grade_subjects            | id, grade_id, subject_id, subject_type |
| subject_combinations      | id, grade_id, name                     |
| subject_combination_items | combination_id, subject_id             |
| classrooms                | id, name, capacity                     |
| periods                   | id, name, start_time, end_time         |

### **F. Teacher management**

| Table                | Important fields                                         |
| -------------------- | -------------------------------------------------------- |
| teachers             | id, employee_number, user_id, qualification, status      |
| teacher_departments  | teacher_id, department_id                                |
| teacher_assignments  | id, teacher_id, subject_id, section_id, academic_year_id |
| homeroom_assignments | id, teacher_id, section_id, academic_year_id             |
| staff_attendance     | id, teacher_id, date, status                             |
| leave_requests       | id, employee_id, start_date, end_date, status            |

### **G. Timetable**

| Table             | Important fields                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------ |
| timetables        | id, academic_year_id, semester_id, status                                                  |
| timetable_entries | id, timetable_id, section_id, subject_id, teacher_id, classroom_id, period_id, day_of_week |

### **H. Attendance**

| Table                  | Important fields                                               |
| ---------------------- | -------------------------------------------------------------- |
| attendance_sessions    | id, section_id, subject_id, teacher_id, date, period_id        |
| attendance_records     | id, session_id, student_id, status, remarks                    |
| attendance_corrections | id, attendance_record_id, old_status, new_status, corrected_by |

### **I. Examination and assessment**

| Table               | Important fields                                         |
| ------------------- | -------------------------------------------------------- |
| examinations        | id, name, academic_year_id, semester_id, type            |
| exam_schedules      | id, examination_id, subject_id, section_id, exam_date    |
| assessments         | id, subject_id, semester_id, title, maximum_mark, weight |
| marks               | id, assessment_id, student_id, mark, status              |
| mark_submissions    | id, assessment_id, teacher_id, submitted_at, status      |
| mark_change_history | id, mark_id, old_value, new_value, changed_by            |
| result_approvals    | id, result_batch_id, approved_by, status                 |

### **J. Results and promotion**

| Table               | Important fields                                             |
| ------------------- | ------------------------------------------------------------ |
| subject_results     | id, student_id, subject_id, semester_id, total_mark, grade   |
| semester_results    | id, student_id, semester_id, total, status                   |
| annual_results      | id, student_id, academic_year_id, total, status              |
| report_cards        | id, student_id, academic_year_id, semester_id, document_path |
| promotion_decisions | id, student_id, academic_year_id, decision, approved_by      |
| graduation_records  | id, student_id, completion_date, status                      |

### **K. Assignments**

| Table                  | Important fields                                        |
| ---------------------- | ------------------------------------------------------- |
| assignments            | id, teacher_id, subject_id, section_id, title, deadline |
| assignment_attachments | id, assignment_id, file_path                            |
| assignment_submissions | id, assignment_id, student_id, submitted_at, status     |
| assignment_feedback    | id, submission_id, teacher_id, score, comments          |

### **L. Finance**

| Table            | Important fields                                       |
| ---------------- | ------------------------------------------------------ |
| fee_categories   | id, name, description                                  |
| fee_structures   | id, grade_id, academic_year_id, amount                 |
| student_invoices | id, student_id, invoice_number, total_amount, status   |
| invoice_items    | id, invoice_id, fee_category_id, amount                |
| payments         | id, invoice_id, reference_number, amount, payment_date |
| receipts         | id, payment_id, receipt_number, issued_at              |
| discounts        | id, student_id, amount, reason, approved_by            |
| refunds          | id, payment_id, amount, reason, approved_by            |

### **M. Other school operations**

| Table                  | Important fields                                |
| ---------------------- | ----------------------------------------------- |
| announcements          | id, title, content, created_by                  |
| announcement_targets   | id, announcement_id, target_type, target_id     |
| notifications          | id, user_id, title, message, read_at            |
| books                  | id, isbn, title, author, category_id            |
| book_copies            | id, book_id, copy_number, status                |
| book_loans             | id, copy_id, student_id, issue_date, due_date   |
| discipline_incidents   | id, student_id, category, incident_date, status |
| counseling_cases       | id, student_id, counselor_id, status            |
| inventory_items        | id, name, category_id, quantity                 |
| inventory_transactions | id, item_id, transaction_type, quantity         |
| school_events          | id, title, start_date, end_date                 |

## **10.3 Critical database relationships**

\#chatgpt-mermaid-\_r_10s\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_10s\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_10s\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_10s\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_10s\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10s\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_10s\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_10s\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_10s\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_10s\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_10s\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_10s\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_10s\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_10s\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_10s\_ p{margin:0;}#chatgpt-mermaid-\_r_10s\_ .entityBox{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_10s\_ .relationshipLabelBox{fill:rgb(243, 243, 243);opacity:0.7;background-color:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_10s\_ .relationshipLabelBox rect{opacity:0.5;}#chatgpt-mermaid-\_r_10s\_ .labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_10s\_ .edgeLabel{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_10s\_ .edgeLabel .label rect{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_10s\_ .edgeLabel .label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10s\_ .edgeLabel .label{fill:rgb(83, 154, 248);font-size:14px;}#chatgpt-mermaid-\_r_10s\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_10s\_ .edge-pattern-dashed{stroke-dasharray:8,8;}#chatgpt-mermaid-\_r_10s\_ .node rect,#chatgpt-mermaid-\_r_10s\_ .node circle,#chatgpt-mermaid-\_r_10s\_ .node ellipse,#chatgpt-mermaid-\_r_10s\_ .node polygon{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_10s\_ .relationshipLine{stroke:rgb(143, 143, 143);stroke-width:1px;fill:none;}#chatgpt-mermaid-\_r_10s\_ .marker{fill:none!important;stroke:rgb(143, 143, 143)!important;stroke-width:1;}#chatgpt-mermaid-\_r_10s\_ [data-look=neo].labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_10s\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_10s\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_10s\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_10s\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_10s\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10s\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_10s\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_10s\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_10s\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10s\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_10s\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_10s\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10s\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_10s\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_10s\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10s\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_10s\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_10s\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}STUDENTSTUDENT_ENROLLMENTACADEMIC_YEARSEMESTERGRADESECTIONSTUDENT_GUARDIANGUARDIANTEACHERTEACHER_ASSIGNMENTSUBJECTATTENDANCE_SESSIONATTENDANCE_RECORDASSESSMENTMARKSEMESTER_RESULTANNUAL_RESULTSTUDENT_INVOICEPAYMENTSenrollscontainscontainscontainsreceiveslinkedlinkedassignedtaughtreceiveshascontainsreceivescontainsreceivesreceivescontainsreceivesbilledreceives

## **10.4 Database integrity requirements**

DB-001. Every major table must have a primary key.

DB-002. Foreign keys must enforce valid relationships.

DB-003. Student numbers must be unique.

DB-004. Employee numbers must be unique.

DB-005. Invoice numbers must be unique.

DB-006. Receipt numbers must be unique.

DB-007. Duplicate student enrollment in the same academic year must be prevented.

DB-008. Attendance uniqueness must be enforced for the configured attendance session and student.

DB-009. Payment operations must use database transactions.

DB-010. Financial and academic historical records must not be permanently deleted through normal application workflows.

DB-011. File records must reference controlled storage locations.

DB-012. Sensitive fields must be protected through authorization and appropriate encryption practices.

DB-013. All important changes must be traceable to a user and timestamp.

DB-014. Database migrations must be version controlled.

DB-015. Historical result records must retain the grading-policy version used to calculate them.

# **11. SYSTEM ARCHITECTURE**

## **11.1 Recommended architecture**

The system shall use a **modular monolithic architecture**.

This means one deployable backend application with independent business modules, a shared database and well-defined internal boundaries.

Microservices are not recommended for the initial release because they introduce unnecessary deployment and maintenance complexity.

\#chatgpt-mermaid-\_r_113\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_113\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_113\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_113\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_113\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_113\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_113\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_113\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_113\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_113\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_113\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_113\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_113\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_113\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_113\_ p{margin:0;}#chatgpt-mermaid-\_r_113\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_113\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_113\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_113\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_113\_ .label text,#chatgpt-mermaid-\_r_113\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_113\_ .node rect,#chatgpt-mermaid-\_r_113\_ .node circle,#chatgpt-mermaid-\_r_113\_ .node ellipse,#chatgpt-mermaid-\_r_113\_ .node polygon,#chatgpt-mermaid-\_r_113\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_113\_ .rough-node .label text,#chatgpt-mermaid-\_r_113\_ .node .label text,#chatgpt-mermaid-\_r_113\_ .image-shape .label,#chatgpt-mermaid-\_r_113\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_113\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_113\_ .rough-node .label,#chatgpt-mermaid-\_r_113\_ .node .label,#chatgpt-mermaid-\_r_113\_ .image-shape .label,#chatgpt-mermaid-\_r_113\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_113\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_113\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_113\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_113\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_113\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_113\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_113\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_113\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_113\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_113\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_113\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_113\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_113\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_113\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_113\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_113\_ .icon-shape,#chatgpt-mermaid-\_r_113\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_113\_ .icon-shape p,#chatgpt-mermaid-\_r_113\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_113\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_113\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_113\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_113\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_113\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_113\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_113\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_113\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_113\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_113\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_113\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_113\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_113\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_113\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_113\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_113\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_113\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_113\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_113\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_113\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_113\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_113\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_113\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_113\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_113\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_113\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_113\_ .node rect,#chatgpt-mermaid-\_r_113\_ .node circle,#chatgpt-mermaid-\_r_113\_ .node ellipse,#chatgpt-mermaid-\_r_113\_ .node polygon,#chatgpt-mermaid-\_r_113\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_113\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_113\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_113\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_113\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_113\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Users: Admin, Principal,Teachers, Students, ParentsReact + TypeScript FrontendNestJS REST APIAuthentication andAuthorizationApplication ServicesBusiness ModulesPostgreSQL DatabasePrivate File StorageNotification ServiceReporting and PDF ServiceBackup and Recovery

## **11.2 Technology stack**

| Component            | Technology                                              | Responsibility                        |
| -------------------- | ------------------------------------------------------- | ------------------------------------- |
| Frontend             | React                                                   | User interface                        |
| Programming language | TypeScript                                              | Frontend and backend type safety      |
| Build tool           | Vite                                                    | Frontend development and builds       |
| Styling              | Tailwind CSS                                            | Responsive design                     |
| UI components        | shadcn/ui                                               | Reusable interface components         |
| Icons                | Lucide                                                  | Interface icons                       |
| Backend              | NestJS                                                  | Business logic and APIs               |
| API style            | REST                                                    | Frontend/backend communication        |
| Database             | PostgreSQL                                              | Persistent application data           |
| ORM                  | Prisma                                                  | Database access and migrations        |
| Validation           | class-validator / Zod                                   | Input validation                      |
| Authentication       | Secure server sessions or appropriately implemented JWT | Identity and session management       |
| Charts               | Recharts                                                | Analytics                             |
| PDF                  | Server-side PDF generation                              | Report cards and receipts             |
| File storage         | Private object storage or controlled server storage     | Documents and attachments             |
| Testing              | Jest and Playwright                                     | Unit, integration and browser testing |
| Version control      | Git and GitHub                                          | Source control                        |
| Deployment           | Linux VPS or suitable cloud hosting                     | Production infrastructure             |

The frontend must not connect directly to PostgreSQL.

All protected operations must go through the backend API.

## **11.3 Backend module boundaries**

The backend should be organized into these modules:

```
src/
├── auth/
├── users/
├── roles/
├── permissions/
├── school-settings/
├── students/
├── guardians/
├── admissions/
├── academic-years/
├── semesters/
├── grades/
├── sections/
├── subjects/
├── departments/
├── teachers/
├── teacher-assignments/
├── timetable/
├── attendance/
├── examinations/
├── assessments/
├── marks/
├── results/
├── report-cards/
├── promotions/
├── assignments/
├── finance/
├── payments/
├── library/
├── discipline/
├── counseling/
├── hr/
├── inventory/
├── notifications/
├── announcements/
├── reports/
├── audit/
├── files/
└── common/
```

Each module should contain:

- Controllers.
- Services.
- Data access logic.
- DTOs.
- Validation.
- Permissions.
- Tests.

Do not put all business logic inside controllers.

## **11.4 API design requirements**

The system shall expose versioned REST endpoints.

Base path:

`/api/v1`

Suggested endpoint groups:

| Domain         | Example endpoint       |
| -------------- | ---------------------- |
| Authentication | `/auth/login`          |
| Users          | `/users`               |
| Students       | `/students`            |
| Admissions     | `/admissions`          |
| Academic years | `/academic-years`      |
| Semesters      | `/semesters`           |
| Grades         | `/grades`              |
| Sections       | `/sections`            |
| Subjects       | `/subjects`            |
| Teachers       | `/teachers`            |
| Assignments    | `/teacher-assignments` |
| Timetable      | `/timetables`          |
| Attendance     | `/attendance`          |
| Examinations   | `/examinations`        |
| Assessments    | `/assessments`         |
| Marks          | `/marks`               |
| Results        | `/results`             |
| Report cards   | `/report-cards`        |
| Promotions     | `/promotions`          |
| Invoices       | `/invoices`            |
| Payments       | `/payments`            |
| Notifications  | `/notifications`       |
| Reports        | `/reports`             |
| Audit logs     | `/audit-logs`          |

### **API behavior**

- Use appropriate HTTP methods.
- Validate every incoming request.
- Return consistent response structures.
- Use proper HTTP status codes.
- Apply authorization at the backend.
- Support pagination.
- Support search and filtering.
- Handle errors consistently.
- Prevent duplicate financial and academic submissions.
- Document APIs using OpenAPI/Swagger.
- Maintain API versioning.

Example response structure:

```
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "studentId": "STU-2026-0001"
  }
}
```

The example identifier is illustrative; actual identifiers must be generated according to the school's configuration.

# **12. USER INTERFACE AND UX REQUIREMENTS**

## **12.1 General interface requirements**

UI-001. The system shall provide a responsive interface.

UI-002. The system shall provide role-specific dashboards.

UI-003. The system shall provide consistent navigation.

UI-004. The system shall provide reusable form components.

UI-005. The system shall display validation messages near invalid fields.

UI-006. The system shall support tables with sorting and filtering.

UI-007. The system shall support pagination for large datasets.

UI-008. The system shall provide confirmation dialogs for destructive or important actions.

UI-009. The system shall provide loading, empty, success and error states.

UI-010. The system shall support a consistent visual design.

UI-011. The system shall support keyboard navigation and accessible form labels.

UI-012. The system shall support localization.

## **12.2 Main application layout**

The application should use:

**Sidebar**

- Dashboard.
- Navigation to authorized modules.
- Role-specific menu items.
- Collapsible sections.

**Top navigation**

- School name/logo.
- Academic year selector where appropriate.
- Semester selector where appropriate.
- Notifications.
- User profile.
- Language selector.

**Main content**

- Page title.
- Breadcrumb navigation.
- Summary cards.
- Data tables.
- Forms.
- Charts.
- Relevant actions.

**Footer**

- Application version.
- School information.
- Help/support information.

## **12.3 Screen inventory**

The following screens should be designed before implementation.

| Area           | Required screens                                                   |
| -------------- | ------------------------------------------------------------------ |
| Authentication | Login, password reset, account activation                          |
| Administration | Admin dashboard, user management, role management, permissions     |
| Principal      | Principal dashboard, approval queue, school reports                |
| Academic       | Academic years, semesters, grades, sections, subjects, departments |
| Admissions     | Application list, application details, review, admission approval  |
| Students       | Student list, registration, profile, enrollment, transfer          |
| Teachers       | Teacher list, profile, departments, assignments                    |
| Attendance     | Class attendance, attendance history, correction, reports          |
| Timetable      | Timetable editor, teacher schedule, student schedule               |
| Examination    | Exam list, exam creation, schedules, marks entry, review           |
| Results        | Semester results, annual results, result approval, publication     |
| Reports        | Report card preview, transcript, PDF export                        |
| Promotion      | Promotion preparation, proposed decisions, approval                |
| Finance        | Fee configuration, invoices, payments, receipts, refunds           |
| Teacher portal | Teacher dashboard, classes, assignments, attendance, marks         |
| Student portal | Student dashboard, results, assignments, timetable                 |
| Parent portal  | Parent dashboard, children, attendance, payments, results          |
| HR             | Employee records, attendance, leave                                |
| Library        | Books, copies, loans, returns                                      |
| Discipline     | Incidents, investigation, resolution                               |
| Counseling     | Cases, follow-ups, referrals                                       |
| Inventory      | Items, stock, transactions                                         |
| Communication  | Announcements, notifications, message history                      |
| Reporting      | Analytics, exports, filters                                        |
| System         | Settings, audit logs, backup status                                |

## **12.4 Dashboard specifications**

### **Principal dashboard**

Must display:

- Total active students.
- Student counts by grade.
- Total active teachers.
- Student attendance today.
- Staff attendance today.
- Semester performance.
- Annual performance.
- Students requiring academic support.
- Admission statistics.
- Financial summary.
- Pending approvals.
- Recent school activities.

### **Academic Director dashboard**

Must display:

- Active academic year.
- Semester status.
- Total classes and subjects.
- Marks submission progress.
- Examination schedule.
- Class and subject averages.
- Students below configured academic thresholds.
- Incomplete result records.
- Promotion preparation status.

### **Registrar dashboard**

Must display:

- Total applications.
- Pending applications.
- Approved applications.
- Rejected applications.
- Current student enrollment.
- Students by grade and section.
- Recent admissions.
- Transfer and withdrawal requests.

### **Teacher dashboard**

Must display:

- Assigned classes.
- Assigned subjects.
- Today's timetable.
- Attendance sessions.
- Pending marks.
- Assignments.
- Upcoming examinations.
- Student progress indicators.

### **Accountant dashboard**

Must display:

- Total invoices.
- Total collected.
- Outstanding balances.
- Daily payments.
- Monthly collections.
- Pending refunds.
- Recent receipts.

### **Student dashboard**

Must display:

- Student identity.
- Current academic year.
- Grade and section.
- Attendance summary.
- Subject results.
- Assignments.
- Examination timetable.
- Published report cards.
- Announcements.

### **Parent dashboard**

Must display:

- Linked children.
- Each child's attendance.
- Published academic results.
- Upcoming examinations.
- Assignments.
- Fee balances.
- Payment history.
- School announcements.

# **13. REPORTING REQUIREMENTS**

The system shall support the following reports.

## **13.1 Student reports**

- Complete student list.
- Student profile report.
- Student enrollment report.
- Students by grade.
- Students by section.
- New admissions.
- Transfers.
- Withdrawals.
- Graduated students.
- Student demographic summaries.

## **13.2 Academic reports**

- Semester results.
- Annual results.
- Subject performance.
- Grade performance.
- Section performance.
- Class averages.
- Subject averages.
- Students failing subjects.
- Students requiring academic support.
- Promotion statistics.
- Grade 12 performance.

## **13.3 Attendance reports**

- Daily attendance.
- Monthly attendance.
- Semester attendance.
- Student absence history.
- Late-arrival report.
- Class attendance percentage.
- Teacher attendance.
- Staff attendance.

## **13.4 Examination reports**

- Examination schedules.
- Marks submission status.
- Missing marks.
- Examination attendance.
- Subject results.
- Result approval status.
- Result publication status.

## **13.5 Financial reports**

- Daily payment report.
- Monthly collection report.
- Outstanding fee report.
- Student payment history.
- Invoice report.
- Discount report.
- Refund report.
- Financial transaction history.

## **13.6 Report export requirements**

The system should support:

- PDF.
- Excel-compatible XLSX.
- CSV where appropriate.
- Printing.
- Date and academic-period filtering.
- Grade and section filtering.
- Subject filtering.
- Role-based export permissions.

# **14. SECURITY AND PRIVACY REQUIREMENTS**

## **14.1 Authentication security**

SEC-001. Passwords must be stored using an appropriate password hashing algorithm such as Argon2id or bcrypt with appropriate parameters.

SEC-002. Passwords must never be stored in plain text.

SEC-003. Authentication must use secure session handling.

SEC-004. Session cookies must use appropriate Secure, HttpOnly and SameSite settings.

SEC-005. Password reset tokens must expire.

SEC-006. Repeated failed login attempts must be restricted.

## **14.2 Authorization security**

SEC-007. All protected operations must be authorized server-side.

SEC-008. The system must prevent horizontal privilege escalation.

SEC-009. The system must prevent vertical privilege escalation.

SEC-010. Parent-child relationships must be verified before exposing student data.

SEC-011. Financial permissions must be separated from academic permissions.

SEC-012. Medical and counseling information must be protected by dedicated permissions.

## **14.3 Application security**

SEC-013. The system must protect against SQL injection.

SEC-014. The system must protect against cross-site scripting.

SEC-015. The system must use CSRF protection where applicable.

SEC-016. File uploads must validate type, size and content.

SEC-017. Private documents must not be accessible through unrestricted public URLs.

SEC-018. Sensitive configuration values must be stored outside source control.

SEC-019. Production traffic must use HTTPS.

SEC-020. The application must follow relevant OWASP security guidance.

## **14.4 Audit requirements**

The system must record:

- User login.
- User logout where required.
- User creation.
- Permission changes.
- Student record modifications.
- Marks modifications.
- Result approvals.
- Result publication.
- Attendance corrections.
- Payment entries.
- Refunds.
- Financial reversals.
- Academic-year closure.
- Promotion approvals.

Audit records should include:

- Actor ID.
- Action.
- Target entity.
- Target record ID.
- Timestamp.
- Relevant before-and-after values where appropriate.
- Request correlation identifier.

Sensitive information must not be unnecessarily copied into logs.

# **15. NON-FUNCTIONAL REQUIREMENTS**

## **15.1 Performance**

| ID      | Requirement                                                                           |
| ------- | ------------------------------------------------------------------------------------- |
| NFR-001 | Normal application pages should load within 3 seconds under the agreed test workload. |
| NFR-002 | Common database queries should normally complete within 1 second.                     |
| NFR-003 | Dashboard requests should normally complete within 4 seconds.                         |
| NFR-004 | Search operations should normally complete within 2 seconds.                          |
| NFR-005 | Normal report generation should target 10 seconds or less.                            |
| NFR-006 | The application must support concurrent school users.                                 |

These are target values. Performance testing must establish the actual supported workload.

## **15.2 Availability and reliability**

NFR-007. The system should target at least 99.5% monthly availability, excluding agreed maintenance windows.

NFR-008. The system shall implement database backups.

NFR-009. The system shall support backup restoration.

NFR-010. The system shall log application errors.

NFR-011. Critical operations shall use database transactions.

NFR-012. The system shall avoid duplicate financial transactions caused by retries.

## **15.3 Backup and recovery**

Recommended initial targets:

- Daily automated full database backup.
- More frequent transaction-log or incremental protection where supported.
- Encrypted backup storage.
- At least one backup copy outside the primary server.
- Regular restoration tests.
- Documented recovery procedures.

Initial recovery targets, subject to infrastructure approval:

| Metric                         | Target                                  |
| ------------------------------ | --------------------------------------- |
| Recovery Point Objective (RPO) | 24 hours maximum for daily backup alone |
| Recovery Time Objective (RTO)  | 8 hours maximum                         |

If the school requires a smaller potential data-loss window, the backup strategy must be upgraded accordingly.

## **15.4 Usability**

NFR-013. The interface shall be usable on desktop, tablet and mobile browsers.

NFR-014. The system shall use consistent navigation.

NFR-015. Forms shall provide clear validation feedback.

NFR-016. Common operations shall require as few steps as reasonably possible.

NFR-017. The system shall support accessible interface practices.

NFR-018. The system shall support localization.

## **15.5 Maintainability**

NFR-019. The codebase shall use modular architecture.

NFR-020. The system shall use consistent naming conventions.

NFR-021. The backend shall use service-layer business logic.

NFR-022. Database migrations shall be version controlled.

NFR-023. API documentation shall be maintained.

NFR-024. Important modules shall have automated tests.

NFR-025. Production errors shall be logged and monitored.

## **15.6 Scalability**

Although this is a single-school installation, the application should support increasing numbers of students, teachers, assessments and academic records without major architectural redesign.

## **15.7 Localization**

NFR-026. The system shall support English, Afaan Oromoo and Amharic translations.

NFR-027. The system shall support Gregorian and Ethiopian calendar display.

NFR-028. The system shall use ETB as the default financial currency.

NFR-029. Date storage and date presentation shall be handled separately.

NFR-030. Historical records shall retain unambiguous machine-readable dates.

NFR-031. The system shall support localized number and date presentation.

# **16. EXTERNAL INTEGRATIONS**

The initial application must not depend on external integrations to perform its core school-management functions.

Optional integrations:

| Integration               | Purpose                                   | Priority |
| ------------------------- | ----------------------------------------- | -------- |
| SMS provider              | Attendance and announcement notifications | High     |
| Email provider            | Account activation and notifications      | Medium   |
| Payment provider          | Online fee payment                        | Medium   |
| Cloud storage             | Secure document storage                   | Medium   |
| External examination data | Authorized Grade 12 data exchange         | Future   |
| Calendar export           | Examination and event schedules           | Low      |

Each integration must:

- Have configurable credentials.
- Handle unavailable services.
- Log failures.
- Avoid exposing sensitive data.
- Support retries where safe.
- Avoid duplicate transactions.

# **17. ACCEPTANCE CRITERIA**

The system shall be accepted only when the defined requirements have been implemented and verified.

The following scenarios represent the minimum critical acceptance tests.

## **17.1 Authentication acceptance**

| ID     | Test                            | Expected result         |
| ------ | ------------------------------- | ----------------------- |
| AT-001 | Valid user logs in              | Correct dashboard opens |
| AT-002 | Invalid password entered        | Access denied           |
| AT-003 | Disabled account attempts login | Access denied           |
| AT-004 | Student attempts admin endpoint | Access denied           |
| AT-005 | User logs out                   | Protected session ends  |

## **17.2 Student and admission acceptance**

| ID     | Test                                       | Expected result                       |
| ------ | ------------------------------------------ | ------------------------------------- |
| AT-006 | Registrar creates student                  | Unique student ID generated           |
| AT-007 | Duplicate student number submitted         | Rejected                              |
| AT-008 | Incomplete required registration submitted | Validation errors displayed           |
| AT-009 | Admission approved                         | Student record created                |
| AT-010 | Student assigned to Grade 9A               | Student appears in correct class list |
| AT-011 | Student transferred                        | Previous enrollment preserved         |

## **17.3 Academic acceptance**

| ID     | Test                            | Expected result                          |
| ------ | ------------------------------- | ---------------------------------------- |
| AT-012 | Academic year created           | Academic year stored                     |
| AT-013 | Two semesters configured        | Both semesters available                 |
| AT-014 | Subject assigned to Grade 10    | Subject appears in configured curriculum |
| AT-015 | Teacher assigned to section     | Assignment appears on teacher dashboard  |
| AT-016 | Conflicting timetable submitted | Conflict rejected                        |
| AT-017 | New academic year created       | Previous results remain available        |

## **17.4 Attendance acceptance**

| ID     | Test                             | Expected result                  |
| ------ | -------------------------------- | -------------------------------- |
| AT-018 | Teacher opens assigned class     | Correct students loaded          |
| AT-019 | Teacher opens unauthorized class | Access denied                    |
| AT-020 | Attendance submitted             | Records saved                    |
| AT-021 | Duplicate attendance submitted   | Duplicate prevented              |
| AT-022 | Authorized correction made       | Change recorded in audit history |
| AT-023 | Attendance report generated      | Correct totals displayed         |

## **17.5 Examination and results acceptance**

| ID     | Test                                   | Expected result                                  |
| ------ | -------------------------------------- | ------------------------------------------------ |
| AT-024 | Teacher creates assigned assessment    | Assessment saved                                 |
| AT-025 | Mark exceeds maximum                   | Validation fails                                 |
| AT-026 | Teacher submits marks                  | Marks enter review state                         |
| AT-027 | Academic Director approves marks       | Marks become approved                            |
| AT-028 | Unapproved results accessed by student | Access denied                                    |
| AT-029 | Semester result calculated             | Configured formula applied                       |
| AT-030 | Annual result calculated               | Configured semester weights applied              |
| AT-031 | Historical grading policy changes      | Previously approved results remain unchanged     |
| AT-032 | Result published                       | Authorized students and parents can view it      |
| AT-033 | Published mark corrected               | Authorized correction and audit history recorded |

## **17.6 Promotion acceptance**

| ID     | Test                                | Expected result                                 |
| ------ | ----------------------------------- | ----------------------------------------------- |
| AT-034 | Promotion process starts            | Eligible students evaluated                     |
| AT-035 | Incomplete required results exist   | Final promotion blocked or flagged for review   |
| AT-036 | Principal approves promotion        | Promotion decisions finalized                   |
| AT-037 | Promoted student enrolled next year | New enrollment created                          |
| AT-038 | Student repeats grade               | New enrollment created without deleting history |
| AT-039 | Grade 12 completion approved        | Completion record generated                     |

## **17.7 Financial acceptance**

| ID     | Test                                        | Expected result                   |
| ------ | ------------------------------------------- | --------------------------------- |
| AT-040 | Invoice generated                           | Correct amount stored             |
| AT-041 | Partial payment entered                     | Outstanding balance updated       |
| AT-042 | Full payment entered                        | Invoice marked paid               |
| AT-043 | Receipt generated                           | Unique receipt generated          |
| AT-044 | Duplicate payment reference entered         | Duplicate prevented               |
| AT-045 | Confirmed payment correction requested      | Reversal/refund workflow required |
| AT-046 | Unauthorized teacher opens finance endpoint | Access denied                     |

## **17.8 Parent and student portal acceptance**

| ID     | Test                                      | Expected result                     |
| ------ | ----------------------------------------- | ----------------------------------- |
| AT-047 | Student opens own profile                 | Own records displayed               |
| AT-048 | Student requests another student's record | Access denied                       |
| AT-049 | Parent opens linked child                 | Permitted records displayed         |
| AT-050 | Parent requests unrelated student         | Access denied                       |
| AT-051 | Unpublished results requested             | Access denied                       |
| AT-052 | Parent downloads report card              | Correct published report downloaded |

## **17.9 Security and reliability acceptance**

| ID     | Test                                           | Expected result                    |
| ------ | ---------------------------------------------- | ---------------------------------- |
| AT-053 | SQL injection input submitted                  | Request safely rejected or handled |
| AT-054 | Unauthorized file access attempted             | Access denied                      |
| AT-055 | Important record modified                      | Audit entry generated              |
| AT-056 | Backup restoration performed                   | Data restored successfully         |
| AT-057 | Network retry occurs during payment submission | Duplicate payment prevented        |
| AT-058 | Application restarted                          | Persistent data remains intact     |

# **18. TESTING STRATEGY**

The testing process shall include the following levels.

## **18.1 Unit testing**

Test individual business functions:

- Student ID generation.
- Result calculations.
- Grading conversions.
- Attendance percentage.
- Invoice balance calculation.
- Promotion eligibility.
- Permission checks.

## **18.2 Integration testing**

Test interactions between modules:

- Admission and student registration.
- Student registration and enrollment.
- Enrollment and class lists.
- Teacher assignments and attendance.
- Assessments and marks.
- Marks and results.
- Results and report cards.
- Invoices and payments.
- Parent accounts and student relationships.

## **18.3 End-to-end testing**

Simulate complete school operations:

1. Create an academic year.
2. Register a new student.
3. Approve admission.
4. Enroll the student in Grade 9.
5. Assign subjects and teachers.
6. Publish timetable.
7. Mark attendance.
8. Conduct assessments.
9. Submit and approve marks.
10. Publish semester results.
11. Calculate annual results.
12. Approve promotion.
13. Enroll the student in Grade 10.

## **18.4 Security testing**

- Authentication testing.
- Authorization testing.
- Role escalation testing.
- Student data isolation.
- Parent data isolation.
- File access testing.
- Input validation.
- Session security.
- Audit-log protection.

## **18.5 User acceptance testing**

Representatives from the school should test real workflows.

Required participants:

- Principal.
- Academic Director.
- Registrar.
- Examination Coordinator.
- Teachers.
- Accountant.
- Student representative.
- Parent representative.

The system must receive formal stakeholder approval before production release.

# **19. IMPLEMENTATION ROADMAP**

Development should proceed in controlled phases.

| Phase                 | Deliverables                                                 | Completion condition                            |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| 1. Foundation         | Project setup, authentication, users, roles, school settings | Users can securely access authorized dashboards |
| 2. Academic structure | Years, semesters, grades, sections, subjects, departments    | Academic structure can be configured            |
| 3. Student management | Admission, registration, guardians, enrollment               | Full student registration workflow works        |
| 4. Teacher management | Teachers, departments, assignments, timetable                | Teachers receive valid assignments              |
| 5. Attendance         | Student and staff attendance                                 | Attendance and reports work                     |
| 6. Examination        | Assessments, schedules, marks entry and review               | Marks workflow works                            |
| 7. Results            | Semester, annual results, report cards, promotion            | Academic lifecycle works                        |
| 8. Finance            | Fees, invoices, payments, receipts                           | Financial workflow works                        |
| 9. Portals            | Teacher, student and parent dashboards                       | All portals enforce proper permissions          |
| 10. Administration    | HR, library, discipline, counseling, inventory               | Operational modules work                        |
| 11. Analytics         | Dashboards, reports, exports                                 | Reports pass validation                         |
| 12. Production        | Security, backups, testing, deployment, training             | Production acceptance approved                  |

## **19.1 Recommended development priority**

Build in this dependency order:

**Foundation → Academic configuration → Students → Teachers → Enrollment → Attendance → Examinations → Results → Finance → Portals → Administration → Analytics.**

Do not begin with advanced dashboards or AI features while the underlying student, enrollment and academic data models are still unstable.

# **20. DEFINITION OF DONE**

A module is not complete merely because its interface exists.

A module is considered complete only when:

1. All approved functional requirements are implemented.
2. Database tables and relationships are implemented.
3. Backend validation is implemented.
4. Permissions are enforced server-side.
5. The interface is responsive.
6. Loading, empty, success and error states are handled.
7. Audit logging is implemented for important actions.
8. Unit tests pass.
9. Integration tests pass.
10. Relevant acceptance tests pass.
11. API documentation is updated.
12. No critical or high-severity security defect remains.
13. User documentation is available.
14. The module is tested with realistic data.

# **21. PRODUCTION RELEASE CRITERIA**

The entire system may be released when:

- All essential modules are operational.
- Student lifecycle workflows are verified.
- Semester and annual calculations are validated by school representatives.
- Role and permission tests pass.
- Financial operations are reconciled.
- Report cards are validated.
- Parent and student access restrictions are verified.
- Backup restoration is tested.
- Production deployment is secured.
- School staff have received training.
- Critical defects are resolved.
- Stakeholders sign off on user acceptance testing.

# **22. PROJECT RISKS AND MITIGATION**

| Risk                             | Mitigation                                                         |
| -------------------------------- | ------------------------------------------------------------------ |
| Incorrect grading policies       | Obtain school-approved grading configuration before implementation |
| Unauthorized student data access | Backend RBAC and relationship-based access controls                |
| Incorrect result calculations    | Independent calculation tests and academic approval                |
| Duplicate financial records      | Transaction controls and idempotency                               |
| Data loss                        | Automated backups and restoration tests                            |
| Unclear academic policies        | Document business rules before coding                              |
| Poor adoption by teachers        | Simple interfaces and practical training                           |
| Internet interruptions           | Resilient interfaces and carefully designed offline support        |
| Incomplete historical data       | Data import validation and migration checks                        |
| Scope expansion                  | Phase-based development and change control                         |

# **23. FINAL PROJECT DELIVERABLES**

The development team must produce:

1. Complete source code.
2. Frontend application.
3. Backend application.
4. Database schema and migration files.
5. ERD documentation.
6. API documentation.
7. Authentication and permission documentation.
8. Functional test cases.
9. Automated test suite.
10. Deployment instructions.
11. Environment configuration template.
12. Database backup and restoration instructions.
13. Administrator user manual.
14. Teacher user manual.
15. Student and parent user instructions.
16. Production deployment.
17. User acceptance testing report.
18. Final project documentation.

# **24. FINAL SYSTEM SUCCESS DEFINITION**

The project is successful when the school can manage its complete operational and academic lifecycle through one centralized application.

A student must be able to enter Grade 9, progress through Grades 10 and 11, complete Grade 12, and retain a complete academic history.

A teacher must be able to receive assignments, manage classes, record attendance, conduct assessments and submit marks.

The Academic Director must be able to manage academic years, semesters, subjects, examinations, results and promotion.

The Principal must be able to supervise the school and approve important operations.

The Registrar must be able to manage admission and enrollment.

The Accountant must be able to manage invoices, payments and financial reports.

Parents must be able to monitor their children's academic progress.

Students must be able to access their own learning information.

All these operations must work together while protecting confidential records and maintaining accurate historical data.

**End of Software Requirements Specification — Version 1.0**

# **25. Important decisions to finalize before coding**

The SRS defines the complete system, but five school-specific policies must be confirmed before implementing the academic engine.

| Decision               | What must be confirmed                                      |
| ---------------------- | ----------------------------------------------------------- |
| Grading scale          | A, B, C or numerical/letter-grade mapping and pass marks    |
| Assessment weights     | How quizzes, assignments, midterms and finals contribute    |
| Annual calculation     | Equal semester weighting or another formula                 |
| Promotion policy       | Conditions for promotion, repetition and exceptional review |
| Grade 11–12 curriculum | Applicable subject combinations and streams                 |

These should be approved by the school's academic administration, not guessed by developers.

# **My recommended next development deliverable**

The next step should be a **complete screen-by-screen UI/UX specification and application blueprint**.

It should define:

- Every page and dashboard.
- Sidebar navigation for every role.
- Forms and their fields.
- Tables and filters.
- Buttons and their actions.
- Approval dialogs.
- Dashboard statistics.
- Page-to-page navigation.
- Responsive layouts.
- Design system and reusable components.

This will give you a clear blueprint to implement in React and NestJS, or to design first in Figma.

**My recommendation: Do not start coding until the SRS, database ERD and screen specifications agree with one another.** That is how you avoid expensive architectural changes later.