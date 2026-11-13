# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**School Management System** - Full Stack K-12 School Management System (NestJS + React + PostgreSQL)

- **Backend**: NestJS 10 with Prisma ORM, PostgreSQL, JWT authentication, Swagger docs
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS 4 + TanStack Query + React Router 7 + shadcn/ui
- **Authentication**: JWT access/refresh tokens with HttpOnly cookies, role-based access control (ADMIN, TEACHER, STUDENT, PARENT)

---

## Commands

### Backend (from `/backend`)

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Build | `npm run build` |
| Start dev (watch) | `npm run start:dev` |
| Start prod | `npm run start:prod` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Test (all) | `npm run test` |
| Test (watch) | `npm run test:watch` |
| Test (coverage) | `npm run test:cov` |
| Test (e2e) | `npm run test:e2e` |
| Type check | `npx tsc --noEmit` |
| Prisma generate | `npm run prisma:generate` |
| Prisma migrate (dev) | `npm run prisma:migrate` |
| Prisma migrate (prod) | `npm run prisma:migrate:prod` |
| Prisma studio | `npm run prisma:studio` |
| Prisma seed | `npm run prisma:seed` |
| DB push | `npm run db:push` |

### Frontend (from `/frontend`)

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start dev | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Preview | `npm run preview` |

### Environment Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with DATABASE_URL, JWT secrets, etc.
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## Architecture

### Backend Structure (`/backend/src`)

```
src/
├── main.ts                 # App bootstrap (Swagger, Helmet, CORS, ValidationPipe)
├── app.module.ts           # Root module - imports all feature modules
├── config/                 # Configuration modules
│   ├── app.config.ts       # App config (port, env, cors)
│   ├── database.config.ts  # Prisma/PostgreSQL config
│   └── jwt.config.ts       # JWT secrets, expiration
├── common/                 # Shared utilities
│   ├── guards/
│   │   ├── jwt-auth.guard.ts      # JWT validation guard
│   │   └── roles.guard.ts         # Role-based authorization guard
│   ├── decorators/
│   │   ├── roles.decorator.ts     # @Roles() decorator
│   │   ├── current-user.decorator.ts  # @CurrentUser() decorator
│   │   └── public.decorator.ts    # @Public() decorator for public routes
│   ├── interceptors/
│   │   └── response.interceptor.ts  # Standardizes API responses
│   ├── filters/
│   │   └── all-exceptions.filter.ts  # Global exception handling
│   └── pipes/
│       └── validation.pipe.ts       # Global validation pipe
├── prisma/
│   ├── prisma.service.ts    # Prisma client wrapper
│   └── prisma.module.ts     # Prisma module
└── modules/                  # Feature modules
    ├── auth/                 # Authentication (login, register, refresh, password reset)
    ├── users/                # User management (CRUD, bulk import, profiles)
    ├── academic/             # Schools, academic years, grade levels, classes, subjects, timetable
    ├── attendance/           # Attendance recording, sessions, reports
    ├── grades/               # Assessments, grades, report cards
    ├── finance/              # Fee structures, invoices, payments
    ├── communication/        # Messages, announcements, notifications
    └── reports/              # Dashboard analytics, reports, CSV exports
```

### Frontend Structure (`/frontend/src`)

```
src/
├── main.tsx                 # App entry point
├── App.tsx                  # Root component (currently default Vite template)
├── index.css                # Global styles + Tailwind imports
├── services/
│   └── api.ts               # Axios instance with auth interceptors, all API endpoints
├── hooks/
│   ├── useAuth.ts           # Auth state management
│   ├── useReports.ts        # TanStack Query hooks for reports
│   ├── useAcademic.ts       # Academic data hooks
│   ├── useCommunication.ts  # Communication hooks
│   ├── useUsers.ts          # User management hooks
│   └── index.ts             # Barrel exports
├── context/
│   └── AuthContext.tsx      # React context for auth state
├── types/
│   └── api.ts               # All TypeScript interfaces matching backend Prisma models
├── components/
│   └── ui/                  # shadcn/ui base components (button, input, label, card, textarea)
└── lib/
    └── utils.ts             # Utility functions (cn for classnames)
```

### Database Schema (Prisma)

Key models: **User** (with roles: ADMIN, TEACHER, STUDENT, PARENT), **School**, **AcademicYear**, **GradeLevel**, **Class**, **Subject**, **Teacher**, **Student**, **Parent**, **Attendance**, **AttendanceSession**, **Assessment**, **Grade**, **ReportCard**, **FeeStructure**, **Invoice**, **Payment**, **TimetableEntry**, **Message**, **Announcement**, **Notification**, **AuditLog**, **Setting**.

---

## Conventions

### Backend (NestJS)

- **Modules**: Feature-based modules in `src/modules/`, each with controller, service, DTOs
- **Guards**: `JwtAuthGuard` applied globally via `APP_GUARD`; `RolesGuard` for role checks
- **Decorators**: `@Roles()`, `@CurrentUser()`, `@Public()` for route metadata
- **DTOs**: Class-validator decorators for validation, class-transformer for serialization
- **Prisma**: Service injected via `PrismaModule`; use `PrismaService` for database access
- **Error handling**: Global `AllExceptionsFilter`; use NestJS built-in exceptions
- **Response format**: `ResponseInterceptor` wraps all responses in `{ data, meta }`
- **Auth**: JWT access tokens (15min) + refresh tokens (7d, HttpOnly cookie)

### Frontend (React)

- **State**: TanStack Query for server state, React Context for auth
- **API**: Axios instance with request/response interceptors for token management
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Routing**: React Router 7 (file-based or config-based)
- **Types**: Shared with backend via `src/types/api.ts` (manual sync for now)

### Naming

- **Files**: kebab-case (`user.service.ts`, `use-reports.ts`)
- **Classes**: PascalCase (`UsersService`, `AuthModule`)
- **Variables/functions**: camelCase
- **Enums**: PascalCase (`UserRole`, `InvoiceStatus`)
- **Database**: snake_case (Prisma default)

---

## Key Files

### Backend Entry Points

- `backend/src/main.ts` - App bootstrap, global pipes/guards/filters
- `backend/src/app.module.ts` - Root module, all imports
- `backend/prisma/schema.prisma` - Database schema (source of truth)

### Configuration

- `backend/src/config/app.config.ts` - Port, CORS, environment
- `backend/src/config/jwt.config.ts` - JWT secrets, token expiration
- `backend/.env.example` - Environment variables template

### Auth System

- `backend/src/modules/auth/auth.service.ts` - Core auth logic
- `backend/src/modules/auth/strategies/` - Passport strategies (local, jwt, jwt-refresh)
- `backend/src/common/guards/jwt-auth.guard.ts` - JWT validation
- `backend/src/common/guards/roles.guard.ts` - Role authorization

### API Endpoints (all prefixed with `/api`)

| Module | Base Path | Key Endpoints |
|--------|-----------|---------------|
| Auth | `/auth` | `POST /login`, `POST /register`, `POST /refresh`, `POST /logout`, `GET /profile` |
| Users | `/users` | CRUD + `/students`, `/teachers`, `/parents`, `/bulk` |
| Academic | `/academic` | `/schools`, `/academic-years`, `/grade-levels`, `/subjects`, `/classes`, `/timetable` |
| Attendance | `/attendance` | Recording, sessions |
| Grades | `/grades` | Assessments, grades, report cards |
| Finance | `/finance` | Fee structures, invoices, payments |
| Communication | `/communication` | Messages, announcements, notifications |
| Reports | `/reports` | Dashboards, analytics, CSV exports |

### Frontend Key Files

- `frontend/src/services/api.ts` - All API calls, axios interceptors
- `frontend/src/types/api.ts` - TypeScript interfaces (must match backend)
- `frontend/src/context/AuthContext.tsx` - Auth state provider
- `frontend/src/hooks/*.ts` - TanStack Query hooks for each domain

---

## Current Status (from plan.md)

**Phase 9 Backend: Complete** - Reports module with dashboards, analytics, CSV exports
**Phase 9 Frontend: Not Started** - Need dashboard pages, charts, report exports per role
**Phase 10: Pending** - Testing, Security, Docker, CI/CD, Documentation

### Recently Modified Files (git status)

- `backend/src/app.module.ts` - Added ReportsModule import
- `backend/src/modules/communication/communication.service.ts` - Full messaging/notification system
- `backend/src/modules/reports/` - New module (service, controller, module)

---

## Development Notes

### Running Tests

```bash
# Backend unit tests
cd backend && npm run test

# Backend e2e tests
cd backend && npm run test:e2e

# Single test file
cd backend && npm run test -- users.service.spec.ts
```

### Database Operations

```bash
# After schema changes
cd backend && npx prisma generate && npx prisma migrate dev --name <name>

# Reset database
cd backend && npx prisma migrate reset

# View database
cd backend && npx prisma studio
```

### Adding New Features

1. **Backend**: Create module in `src/modules/<feature>/` with service, controller, DTOs, module
2. **Prisma**: Add models to `prisma/schema.prisma`, run migration
3. **Frontend**: Add types to `src/types/api.ts`, add API calls to `src/services/api.ts`, create hooks in `src/hooks/`
4. **Auth**: Add `@Roles()` to new endpoints as needed

---

## Memory

Relevant memories for this project:
- Check `/home/abdi/.claude/projects/-home-abdi-Documents-School-ms/memory/MEMORY.md`