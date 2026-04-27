# Ledgerly - Project Expense & Claim Tracker

A full-stack SaaS-style web application for managing project-based finances, including expense tracking, income management, and automated PDF transaction extraction.

## Project Structure

```text
ledgerly-expense-tracker/
  src/
  package.json
  vite.config.ts
  vercel.json
  backend/
  README.md
```

## Overview

Ledgerly helps teams track financial activity across projects.
Users can upload bank statement PDFs, extract expense transactions, assign them to projects, and monitor financial performance through a real-time dashboard.

## Key Features

### Project Management

- Create and manage projects
- Assign budgets and statuses
- View project-specific expenses and income

### Expense Tracking

- Add expenses manually or via PDF upload
- Link expenses to projects
- Toggle claim status (claimed / unclaimed)
- Bulk claim and unclaim selected expenses
- Delete single expenses or delete all shown expenses

### PDF Ingestion (Core Feature)

- Upload bank statement PDF
- Automatically extract transactions
- Ignore:
  - "CR" transactions (non-expense)
  - summary and subtotal lines
- Review and confirm before saving

### Income Management

- Add income manually
- Associate income with projects
- Edit/delete single incomes or delete all shown incomes

### Dashboard Analytics

- Total Income
- Total Expenses
- Net Balance
- Claimed vs Unclaimed
- Expense distribution by category

## Tech Stack

### Frontend

- React
- TypeScript
- TanStack Router
- Shadcn/Radix UI components

### Backend

- FastAPI (Python)
- RESTful API design
- Service-based architecture

### Database

- SQLite for local development
- PostgreSQL (Cloud SQL) for production

### Other Tools

- pdfplumber (PDF parsing)
- SQLAlchemy (ORM)
- Pydantic (data validation)

## API Endpoints

### Projects

- GET /projects
- POST /projects
- GET /projects/{project_id}
- PATCH /projects/{project_id}
- DELETE /projects/{project_id}

### Expenses

- GET /expenses
- POST /expenses
- DELETE /expenses
- GET /expenses/{expense_id}
- PATCH /expenses/{expense_id}
- DELETE /expenses/{expense_id}
- PATCH /expenses/{expense_id}/claim
- PATCH /expenses/claim/bulk

### Income

- GET /income
- POST /income
- DELETE /income
- GET /income/{income_id}
- PATCH /income/{income_id}
- DELETE /income/{income_id}

### Dashboard

- GET /dashboard

### PDF Upload

- POST /upload-pdf

### Health

- GET /health

## How to Run Locally

### 1) Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

### 2) Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs on:

```text
http://127.0.0.1:8080
```

### 3) Frontend Environment

Create `.env` in the repository root and set:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

For production, set `VITE_API_BASE_URL` to your deployed Cloud Run URL.

## Production Deployment (Cloud Run + Cloud SQL + Vercel)

### Backend on Cloud Run

Deploy backend (from repository root):

```bash
gcloud run deploy ledgerly-api --source backend --region asia-southeast1 --platform managed --allow-unauthenticated
```

Set backend DB connection on Cloud Run service:

```bash
gcloud run services update ledgerly-api \
  --region asia-southeast1 \
  --set-env-vars "DATABASE_URL=postgresql+psycopg2://DB_USER:DB_PASSWORD@/DB_NAME?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME" \
  --add-cloudsql-instances "PROJECT_ID:REGION:INSTANCE_NAME"
```

Get backend URL:

```bash
gcloud run services describe ledgerly-api --region asia-southeast1 --format="value(status.url)"
```

### Frontend on Vercel

In Vercel project settings, set environment variable:

- `VITE_API_BASE_URL=https://your-cloud-run-url`

Use these settings for this repository:

- Root Directory: repository root (`./`)
- Framework Preset: Other
- Build Command: `npm run build`
- Output Directory: leave empty

This frontend uses TanStack Start with Nitro runtime output, so it should be deployed as a server runtime app (not static-only Vite output).

## Current Live Deployment

- Backend (Cloud Run): `https://ledgerly-api-635388135964.asia-southeast1.run.app`
- Frontend (Vercel): `https://ledgerly-expense-tracker-xpv1.vercel.app`

## Notes

- Backend supports `DATABASE_URL`; if not set, it falls back to SQLite.
- PDF parsing focuses on valid expense rows only.
- Architecture prioritizes modular design and clear logic.
