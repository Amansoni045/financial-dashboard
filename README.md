# Finance Dashboard (Next.js Unified)

A robust, production-ready full-stack financial dashboard application. Now unified into a single **Next.js** project for streamlined development and hosting. Built with Next.js (App Router), Prisma, PostgreSQL, and Recharts.

## Features

- **Unified Architecture:** Frontend and Backend hosted together in one Next.js application.
- **Single Command Startup:** Use `npm run dev` to start both the dashboard UI and the API routes.
- **Role-Based Access Control (RBAC):** Roles include `ADMIN` (full access), `ANALYST` (view records and analytics), and `VIEWER` (view analytics only).
- **JWT Authentication:** Secure stateless authentication with bcrypt password hashing, migrated to Next.js API Routes.
- **Dashboard Analytics:** Interactive visualizations for monthly trends, category breakdowns, and overall summaries using Recharts.
- **Soft Delete:** Financial records are soft-deleted to maintain data integrity and accurate historical reporting.
- **TypeScript Migration:** The codebase has been migrated to TypeScript for better type safety and developer experience.

---

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Database:** Prisma (ORM) with PostgreSQL (Neon DB)
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Authentication:** Custom JWT with `jsonwebtoken` and `bcryptjs`

---

## Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the sample environment file and provide your Database URL and JWT Secret:
```bash
cp .env.example .env
```
Ensure you have your `DATABASE_URL` pointing to a PostgreSQL instance.

### 4. Database Migrations
Apply the migrations to sync the database schema:
```bash
npm run migrate
```

### 5. Seed the Database
Populate the database with initial users and realistic financial records:
```bash
npm run seed
```

**Seed Credentials:**
- **Admin:** `admin@finance.dev` / `Admin@1234`
- **Analyst:** `analyst@finance.dev` / `Analyst@1234`
- **Viewer:** `viewer@finance.dev` / `Viewer@1234`

### 6. Run the Application
Start the development server (runs on `http://localhost:3000` by default):
```bash
npm run dev
```

---

## API Documentation (Next.js API Routes)

All API endpoints are now prefix with `/api`:

### **Auth**
- `POST /api/auth/login` — Login to receive a JWT. Body: `{ email, password }`

### **Dashboard**
- `GET /api/dashboard/summary` — Returns total income, total expenses, net balance, and record count.
- `GET /api/dashboard/categories` — Income and expense split grouped by category.
- `GET /api/dashboard/trends` — Returns month-by-month income/expense/net historical data (12 months).
- `GET /api/dashboard/recent` — Lists the 10 most recent financial transactions.

### **Financial Records**
- `GET /api/records` — Returns all records. Supports pagination and filters.
- `POST /api/records` *(Admin)* — Create a new financial record.
- `PUT /api/records/:id` *(Admin)* — Update an existing record.
- `DELETE /api/records/:id` *(Admin)* — Soft-delete a record.

### **Users (Admin Only)**
- `GET /api/users` — List all registered users.
- `POST /api/users` — Create a new user.
- `PATCH /api/users/:id` — Update a user.
- `DELETE /api/users/:id` — Delete a user.
