// Domain types — mirror backend (FastAPI) schema

export type ProjectStatus = "active" | "on_hold" | "closed";

export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget: number; // MYR
  status: ProjectStatus;
  created_at: string;
}

export type ExpenseCategory =
  | "travel"
  | "meals"
  | "equipment"
  | "software"
  | "office"
  | "fees"
  | "other";

export interface Expense {
  id: string;
  project_id: string;
  date: string; // ISO
  description: string; // vendor / merchant
  amount: number; // MYR
  category: ExpenseCategory;
  is_claimed: boolean;
  claimed_date?: string | null;
  notes?: string;
  source_ref?: string | null; // e.g. "stmt-2024-09.pdf"
}

export interface Income {
  id: string;
  project_id: string;
  date: string;
  source: string;
  amount: number; // MYR
  notes?: string;
}

export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  total_claimed: number;
  total_unclaimed: number;
  by_category: { category: ExpenseCategory; amount: number }[];
  claim_breakdown: { name: "Claimed" | "Unclaimed"; value: number }[];
}

export interface ParsedPdfRow {
  id: string; // temp client id
  post_date: string;
  trans_date: string;
  description: string;
  amount: number;
  project_id?: string;
}
