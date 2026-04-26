# Ledgerly - Project Expense & Claim Tracker

A full-stack SaaS-style web application for managing project-based finances, including expense tracking, income management, and automated PDF transaction extraction.

## Project Structure

```text
ledgerly-expense-tracker/
  frontend/
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

- SQLite (local file-based database)

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
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://127.0.0.1:8080
```

## Notes

- SQLite is used for simplicity (great for demo/testing).
- PDF parsing focuses on valid expense rows only.
- Architecture prioritizes modular design and clear logic.
