# 🏢 Odoo HRMS — Hackathon Project

A full-stack **Human Resource Management System (HRMS)** built with Next.js 16, TypeScript, Prisma ORM, Ant Design, and Tailwind CSS. Developed collaboratively by a 4-member team for the **Odoo Hackathon Selection Round**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Team & Modules](#team--modules)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Cross-Module Contracts](#cross-module-contracts)
- [Scripts](#scripts)

---

## Overview

Odoo HRMS is a comprehensive employee management platform covering:

- 🔐 **Authentication & Authorization** — JWT-based sessions, role-based access control
- 👤 **Employee Profiles** — Personal info, salary, documents, and security
- 🕐 **Attendance Tracking** — Real-time check-in/check-out, work hours calculation
- 🌴 **Leave Management** — Time-off requests, approval workflows, balance tracking
- 💰 **Payroll** — Monthly payslip generation, admin payroll register, CSV exports
- 🔔 **Notifications** — In-app real-time notification system

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **ORM** | Prisma 6 |
| **Database** | PostgreSQL (hosted on Render) |
| **UI Library** | Ant Design 6 + Tailwind CSS 4 |
| **Auth** | NextAuth.js v4 (JWT sessions) |
| **Forms** | React Hook Form + Zod validation |
| **Icons** | Lucide React + Ant Design Icons |
| **Testing** | Vitest |
| **Date Utils** | date-fns, date-fns-tz, dayjs |

---

## Team & Modules

### Member 1 — Authentication, Authorization & Dashboard
- JWT-based login/signup/logout
- Role-based access control (`ADMIN`, `HR`, `EMPLOYEE`)
- Admin dashboard with employee directory
- Company-wide summary metrics
- Employee onboarding (create/deactivate accounts)

### Member 2 — Employee Profile, Private Information & Security
- Own profile editing (bio, skills, certifications, avatar)
- Private information vault (DOB, address, bank details, PAN, UAN)
- Live salary structure viewer with formula sync
- Document management and resume upload
- Password change with strength validation

### Member 3 — Attendance & Work-Time Management
- Real-time check-in / check-out with live clock
- Business-day aware work hours calculation (timezone-safe)
- Shift config (start time, duration, grace period) per employee
- Late arrival detection
- Admin attendance correction with audit trail
- Monthly attendance history with status breakdown

### Member 4 — Time Off, Leave Approval, Notifications & Payroll
- Time Off dashboard (balance cards, year calendar, request history)
- New leave request with auto-calculated business days
- Admin leave approval workflow with mandatory rejection notes
- Dynamic leave balance engine (Allocated − Approved)
- In-app notification bell with unread badge
- Monthly payslip with full salary breakdown
- Admin payroll register with CSV export

---

## Features

### 🔐 Authentication
- Credential-based login with `next-auth`
- Secure JWT sessions with role claim
- Protected routes via `middleware.ts`
- Dev session bypass with `x-dev-user-id` header for testing
- Email verification flow (token-based)
- Password strength enforcement

### 👤 Employee Management
- Employee directory with search & filter
- Create, view, and deactivate employees (Admin only)
- Avatar/photo upload
- Role-based field visibility (sensitive data hidden from peers)

### 🕐 Attendance
- One-click check-in / check-out
- Automatic work hours & overtime calculation
- Public holiday awareness
- Admin correction modal with audit trail
- Monthly analytics with export

### 🌴 Leave Management
- **Leave Types**: Paid Time Off (18d/yr), Sick Leave (12d/yr), Unpaid Leave (unlimited)
- Auto-calculated working days (weekends + holidays excluded)
- Overlap prevention — rejects conflicting requests
- Balance validation before submission
- Admin bulk view with approve/reject actions
- Employee cancellation for `PENDING` requests
- Year-view calendar (color-coded by status)
- Allocation tab with quota progress bars

### 💰 Payroll
- Monthly payslip: Basic, HRA, Standard Allowance, Performance Bonus, LTA, Fixed Allowance
- Statutory deductions: PF (12%), Professional Tax
- Unpaid leave / absent day deductions
- Net take-home calculation
- Admin payroll register with totals summary
- CSV export for HR filing

### 🔔 Notifications
- In-app notifications for all leave lifecycle events
- Unread badge counter with auto-polling
- Mark as read (individual + mark all)

---

## Project Structure

```
├── app/
│   ├── (auth)/                  # Auth group routes
│   ├── api/
│   │   ├── auth/                # NextAuth + custom auth endpoints
│   │   ├── attendance/          # Attendance CRUD & toggle
│   │   ├── employees/           # Employee directory endpoints
│   │   ├── leave/               # Leave requests, balance, calendar, admin actions
│   │   ├── notifications/       # In-app notification CRUD
│   │   ├── payroll/             # Payslip & admin payroll register
│   │   └── profile/             # Profile, salary, documents, password
│   ├── attendance/              # Attendance page (Member 3)
│   ├── dashboard/               # Admin dashboard (Member 1)
│   ├── employee-dashboard/      # Employee self-service dashboard
│   ├── leave/                   # Time Off pages (Member 4)
│   │   ├── page.tsx             # Time Off overview (balance + calendar)
│   │   ├── new/page.tsx         # New leave request form
│   │   └── admin/page.tsx       # Admin approval workflow
│   ├── login/                   # Login page
│   ├── payroll/                 # Payroll pages (Member 4)
│   │   ├── page.tsx             # Employee payslip
│   │   └── admin/page.tsx       # Admin payroll register
│   └── profile/                 # Employee profile (Member 2)
│
├── components/
│   ├── attendance/              # Attendance UI components
│   ├── dashboard/               # Admin dashboard components
│   ├── layout/                  # Navbar, UnifiedHeader
│   ├── leave/                   # Leave UI components
│   ├── notifications/           # NotificationBell, NotificationDropdown
│   ├── payroll/                 # Payslip, AdminPayrollTable, PayrollSummary
│   ├── profile/                 # Profile tabs and modals
│   ├── providers/               # AuthProvider (NextAuth session wrapper)
│   ├── theme/                   # ThemeProvider (Ant Design)
│   └── ui/                      # Shared UI primitives (Button, Card, Modal...)
│
├── lib/
│   ├── attendance/              # Attendance engine, analytics, timezone utils
│   ├── auth/                    # Session, password, verification utilities
│   ├── contracts/               # Cross-module typed contracts
│   ├── leave/                   # Leave service, balance service, calendar service
│   ├── notifications/           # Notification service
│   ├── payroll/                 # Payroll service, working days service
│   ├── salary/                  # Salary breakdown service
│   ├── auth.ts                  # Shared auth options + guards
│   ├── authGuard.ts             # RBAC server-side guard
│   ├── db.ts                    # Prisma client singleton
│   └── utils.ts                 # Shared utilities
│
├── prisma/
│   ├── schema.prisma            # Full database schema
│   └── seed.ts                  # Database seeder
│
├── types/
│   ├── contracts.ts             # Cross-module function contracts
│   ├── leave.ts                 # Leave types, statuses, DTOs
│   ├── notifications.ts         # Notification types and payloads
│   ├── next-auth.d.ts           # NextAuth session type extensions
│   └── index.ts                 # Shared type exports
│
├── tests/                       # Vitest test suites
├── scripts/                     # Smoke test & contract verification scripts
└── middleware.ts                # Route protection middleware
```

---

## Database Schema

| Model | Description |
|-------|-------------|
| `Company` | Organisation entity with employee & leave relations |
| `User` | Employee record with auth, profile, attendance, and leave relations |
| `Session` | JWT session storage |
| `YearlySerial` | Auto-incrementing employee ID per company per year |
| `Attendance` | Daily check-in/check-out records with status |
| `Leave` | Legacy simple leave record (Member 3 compatibility) |
| `LeaveAllocation` | Annual leave quota per employee per leave type |
| `LeaveRequest` | Full leave request with approval workflow |
| `Holiday` | Company-observed public holidays (date string) |
| `PublicHoliday` | Public holidays used by payroll/calendar (DateTime) |
| `Notification` | In-app notification records |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Samxxr007/Odoo-Hackathon-Selection-Round.git
cd Odoo-Hackathon-Selection-Round
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your actual values (see [Environment Variables](#environment-variables)).

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Seed the database (optional)

```bash
npm run db:seed
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# PostgreSQL Database (Render)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-32-character-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Secret for signing JWT tokens (min 32 chars) |
| `NEXTAUTH_URL` | ✅ | Base URL of the app (`http://localhost:3000` for dev) |

---

## API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/signin` | Login with email + password |
| `POST` | `/api/auth/signup` | Create new employee account |
| `POST` | `/api/auth/signout` | Logout (invalidate session) |
| `GET` | `/api/auth/me` | Get current user session |
| `POST` | `/api/auth/change-password` | Change own password |

### Employees (Admin)
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/employees` | List all employees |
| `GET` | `/api/employees/:id` | Get employee profile |
| `PUT` | `/api/employees/:id` | Update employee record |
| `POST` | `/api/employees/:id/photo` | Upload employee photo |

### Attendance
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/attendance/toggle` | Check in or check out |
| `GET` | `/api/attendance/me/today` | Today's attendance record |
| `GET` | `/api/attendance/status` | Monthly attendance list |

### Leave
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/leave` | List employee's own leave requests |
| `POST` | `/api/leave` | Submit new leave request |
| `DELETE` | `/api/leave/:id` | Cancel a pending leave request |
| `GET` | `/api/leave/balance` | Get leave balances for a year |
| `GET` | `/api/leave/calendar` | Get calendar events for a year |
| `GET` | `/api/leave/admin` | Admin: all requests with filters |
| `POST` | `/api/leave/admin/:id/approve` | Admin: approve a request |
| `POST` | `/api/leave/admin/:id/reject` | Admin: reject with reason |
| `GET` | `/api/leave/admin/export` | Admin: CSV export of requests |
| `GET` | `/api/leave/contract/approved-on-date` | Cross-module: check if on leave |

### Notifications
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/notifications` | List notifications |
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read |
| `GET` | `/api/notifications/unread-count` | Get unread count |

### Payroll
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/payroll/payslip` | Get own monthly payslip |
| `GET` | `/api/payroll/admin` | Admin: full payroll register |
| `GET` | `/api/payroll/admin/export` | Admin: CSV export of payroll |

### Profile
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/profile` | Get own profile |
| `PUT` | `/api/profile` | Update own profile |
| `POST` | `/api/profile/photo` | Upload avatar |
| `GET/POST` | `/api/profile/salary` | View/manage salary structure |
| `GET/POST/DELETE` | `/api/profile/documents` | Manage documents |
| `POST` | `/api/profile/password` | Change password |

---

## Cross-Module Contracts

Team members expose typed functions to each other via `lib/contracts/`:

### Member 2 → Member 4
```typescript
// lib/salary/salaryService.ts
getSalaryBreakdown(userId: string): Promise<{
  monthlyWage: number;
  basic: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  leaveTravelAllowance: number;
  fixedAllowance: number;
  grossAmount: number;
  employeePF: number;
  professionalTax: number;
}>
```

### Member 3 → Member 4
```typescript
// lib/attendance/attendanceService.ts
getPayableDays(userId: string, month: number, year: number): Promise<{
  totalWorkingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  payableDays: number;
  adjustmentNote?: string;
}>
```

### Member 4 → Member 3
```typescript
// lib/leave/leaveService.ts
getApprovedLeaveForDate(userId: string, date: Date): Promise<{
  isOnLeave: boolean;
  leaveType?: string;
  leaveRequestId?: string;
}>
```

---

## Scripts

```bash
# Development
npm run dev          # Start Next.js dev server

# Database
npm run db:push      # Push Prisma schema to PostgreSQL
npm run db:seed      # Seed database with demo data

# Build
npm run build        # Production build
npm run start        # Start production server

# Testing
npm run test         # Run Vitest test suite
npm run lint         # ESLint check

# Verification
node scripts/smoke-test.mjs         # API smoke tests
tsx scripts/verify-contracts.ts     # Cross-module contract check
```

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `#0077FF` | Brand Blue | Primary buttons, links |
| `#00B7FE` | Accent Blue | Hover states, highlights |
| `#F9911E` | Orange | Warnings, pending status |
| `#F4F7FB` | Light Gray | Page backgrounds |
| `#E5ECF2` | Border Gray | Card borders, dividers |

---

## Role Permissions

| Feature | EMPLOYEE | HR | ADMIN |
|---------|----------|----|-------|
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |
| View own salary | ✅ | ✅ | ✅ |
| View own attendance | ✅ | ✅ | ✅ |
| View own payslip | ✅ | ✅ | ✅ |
| Submit leave request | ✅ | ✅ | ✅ |
| View all employees | ❌ | ✅ | ✅ |
| Manage employees | ❌ | ❌ | ✅ |
| Approve/reject leave | ❌ | ✅ | ✅ |
| View payroll register | ❌ | ✅ | ✅ |
| Export CSV reports | ❌ | ✅ | ✅ |
| Correct attendance | ❌ | ✅ | ✅ |

---

## License

This project was created for the **Odoo Hackathon Selection Round**. All rights reserved by the team.
