# Finance Dashboard Backend

A robust, production-ready backend for a financial dashboard application. Built with Express, Prisma, and PostgreSQL, this system provides APIs for user and financial record management, role-based access control, and dashboard analytics.

## Features

- **Role-Based Access Control (RBAC):** Roles include `ADMIN` (full access), `ANALYST` (view records and analytics), and `VIEWER` (view analytics only).
- **JWT Authentication:** Secure stateless authentication with bcrypt password hashing.
- **Robust Validation:** Data validation using `zod` for all incoming requests with clear, structured error messages.
- **Soft Delete:** Financial records are soft-deleted to maintain data integrity and accurate historical reporting.
- **Pagination:** Record listing is paginated (with `page` and `limit` controls).
- **Dashboard Analytics:** Aggregation endpoints for monthly trends, category breakdowns, and overall summaries.
- **Error Handling:** Centralized Express error-handling middleware catches validation and Prisma errors appropriately.

---

## Tech Stack

- **Node.js** & **Express**
- **Prisma** (ORM with `adapter-pg`)
- **PostgreSQL** (Neon DB)
- **Zod** (Validation)
- **JSON Web Token (JWT)** & **bcryptjs** (Auth)

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
*(Run `npx prisma generate` if using a different environment to generate the strict TypeScript client bindings).*

### 5. Seed the Database
Populate the database with initial users and realistic financial records:
```bash
npm run seed
```

**Seed Credentials:**
- Admin: `admin@finance.dev` / `Admin@1234`
- Analyst: `analyst@finance.dev` / `Analyst@1234`
- Viewer: `viewer@finance.dev` / `Viewer@1234`

### 6. Run the Server
Start the development server (runs on `http://localhost:5001` via nodemon by default):
```bash
npm run dev
```

---

## API Documentation

### **Auth & Health**
- `POST /api/auth/login` — Login to receive a JWT. Body: `{ email, password }`
- `GET /health` — Check system health.

### **Dashboard (Accessible by Admin, Analyst, Viewer)**
- `GET /api/dashboard/summary` — Returns total income, total expenses, net balance, and record count.
- `GET /api/dashboard/categories` — Income and expense split grouped by category.
- `GET /api/dashboard/trends` — Returns month-by-month income/expense/net historical data for the last 12 months.
- `GET /api/dashboard/recent` — Lists the 10 most recent financial transactions (with nested user details).

### **Financial Records**
- `GET /api/records` *(Admin, Analyst, Viewer)* — Returns all records (excludes soft-deleted). Supports `?page=1&limit=20` and filters (`type`, `category`, `startDate`, `endDate`).
- `GET /api/records/:id` *(Admin, Analyst, Viewer)* — Retrieve a specific record.
- `POST /api/records` *(Admin)* — Create a new financial record.
- `PUT /api/records/:id` *(Admin)* — Update an existing record.
- `DELETE /api/records/:id` *(Admin)* — Soft-delete a record.

### **Users (Admin Only)**
- `GET /api/users` — List all registered users in the system.
- `POST /api/users` — Create a new user (Viewer, Analyst, or Admin).
- `PATCH /api/users/:id` — Update an existing user's name, role, or status.
- `DELETE /api/users/:id` — Permanently delete a user.

---

## Assumptions & Trade-offs Made
1. **Soft Delete over Hard Delete:** For financial systems, hard deleting records causes historical summaries to break. `deletedAt` was added to ensure analytics accurately reflect the ledger context while hiding the data from the UI.
2. **Simplified Refresh Tokens:** Only access tokens (`JWT`) are used. To make it more production-ready, a refresh token (HttpOnly cookie) structure would be favorable.
3. **Roles and Permissions Structure:** Hardcoded as enums (`ADMIN`, `ANALYST`, `VIEWER`) via middleware for simplicity instead of maintaining a discrete hierarchical permissions table mapped to each route.
