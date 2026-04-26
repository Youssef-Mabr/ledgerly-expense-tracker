import type {
  Project,
  Expense,
  Income,
  DashboardSummary,
  ParsedPdfRow,
  ExpenseCategory,
} from "./types";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://127.0.0.1:8000";

type BackendProject = {
  id: number;
  name: string;
  description: string | null;
  budget: number | null;
  status: Project["status"];
  start_date: string | null;
  end_date: string | null;
};

type BackendExpense = {
  id: number;
  project_id: number;
  date: string;
  description: string;
  amount: number;
  category: string | null;
  is_claimed: boolean;
  claimed_date: string | null;
  source: string | null;
};

type BackendIncome = {
  id: number;
  project_id: number;
  date: string;
  source: string;
  amount: number;
  notes: string | null;
};

type BackendDashboard = {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  claimed_total: number;
  unclaimed_total: number;
};

type BackendPdfRow = {
  post_date: string | null;
  trans_date: string;
  description: string;
  amount: number;
};

const uid = () => Math.random().toString(36).slice(2, 10);

function toIsoDate(raw: string | null | undefined): string {
  if (!raw) {
    return "";
  }

  const trimmed = raw.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return trimmed;
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/);
  if (!slashMatch) {
    return "";
  }

  const day = Number(slashMatch[1]);
  const month = Number(slashMatch[2]);
  const yearRaw = slashMatch[3];

  let year = new Date().getFullYear();
  if (yearRaw) {
    const parsedYear = Number(yearRaw);
    year = yearRaw.length === 2 ? 2000 + parsedYear : parsedYear;
  }

  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return "";
  }

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function toProject(project: BackendProject): Project {
  return {
    id: String(project.id),
    name: project.name,
    description: project.description ?? undefined,
    start_date: project.start_date ?? undefined,
    end_date: project.end_date ?? undefined,
    budget: project.budget ?? 0,
    status: project.status,
    created_at: project.start_date ?? new Date().toISOString().slice(0, 10),
  };
}

function toExpense(expense: BackendExpense): Expense {
  return {
    id: String(expense.id),
    project_id: String(expense.project_id),
    date: expense.date,
    description: expense.description,
    amount: expense.amount,
    category: (expense.category ?? "other") as ExpenseCategory,
    is_claimed: expense.is_claimed,
    claimed_date: expense.claimed_date,
    source_ref: expense.source,
  };
}

function toIncome(income: BackendIncome): Income {
  return {
    id: String(income.id),
    project_id: String(income.project_id),
    date: income.date,
    source: income.source,
    amount: income.amount,
    notes: income.notes ?? undefined,
  };
}

function withQuery(path: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return `${path}${query ? `?${query}` : ""}`;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) {
        message = payload.detail;
      }
    } catch {
      // keep fallback message when body is not JSON
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface ExpenseFilters {
  project_id?: string;
  from?: string;
  to?: string;
  claim_status?: "all" | "claimed" | "unclaimed";
  category?: ExpenseCategory;
}

export const projectsApi = {
  async list() {
    const rows = await apiRequest<BackendProject[]>("/projects");
    return rows.map(toProject);
  },

  async get(id: string) {
    const row = await apiRequest<BackendProject>(`/projects/${id}`);
    return toProject(row);
  },

  async create(data: Omit<Project, "id" | "created_at">) {
    const row = await apiRequest<BackendProject>("/projects", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        budget: data.budget,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
      }),
    });
    return toProject(row);
  },

  async update(id: string, patch: Partial<Project>) {
    const row = await apiRequest<BackendProject>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: patch.name,
        description: patch.description,
        budget: patch.budget,
        status: patch.status,
        start_date: patch.start_date,
        end_date: patch.end_date,
      }),
    });
    return toProject(row);
  },

  async remove(id: string) {
    await apiRequest<void>(`/projects/${id}`, { method: "DELETE" });
    return { ok: true };
  },
};

export const expensesApi = {
  async list(filters: ExpenseFilters = {}) {
    const url = withQuery("/expenses", {
      project_id: filters.project_id,
      from_date: filters.from,
      to_date: filters.to,
      category: filters.category,
      claim_status:
        filters.claim_status && filters.claim_status !== "all"
          ? filters.claim_status
          : undefined,
    });
    const rows = await apiRequest<BackendExpense[]>(url);
    return rows.map(toExpense);
  },

  async create(data: Omit<Expense, "id">) {
    const row = await apiRequest<BackendExpense>("/expenses", {
      method: "POST",
      body: JSON.stringify({
        project_id: Number(data.project_id),
        date: data.date,
        description: data.description,
        amount: data.amount,
        category: data.category,
        is_claimed: data.is_claimed,
        claimed_date: data.claimed_date,
        source: data.source_ref,
      }),
    });
    return toExpense(row);
  },

  async bulkCreate(rows: Omit<Expense, "id">[]) {
    const payload = rows.map((row) => ({
      project_id: Number(row.project_id),
      date: row.date,
      description: row.description,
      amount: row.amount,
      category: row.category,
      is_claimed: row.is_claimed,
      claimed_date: row.claimed_date,
      source: row.source_ref,
    }));

    const created = await apiRequest<BackendExpense[]>("/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return created.map(toExpense);
  },

  async update(id: string, patch: Partial<Expense>) {
    const row = await apiRequest<BackendExpense>(`/expenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        project_id:
          patch.project_id === undefined ? undefined : Number(patch.project_id),
        date: patch.date,
        description: patch.description,
        amount: patch.amount,
        category: patch.category,
        is_claimed: patch.is_claimed,
        claimed_date: patch.claimed_date,
        source: patch.source_ref,
      }),
    });
    return toExpense(row);
  },

  async toggleClaim(id: string) {
    const current = await apiRequest<BackendExpense>(`/expenses/${id}`);
    const row = await apiRequest<BackendExpense>(`/expenses/${id}/claim`, {
      method: "PATCH",
      body: JSON.stringify({ is_claimed: !current.is_claimed }),
    });
    return toExpense(row);
  },

  async remove(id: string) {
    await apiRequest<void>(`/expenses/${id}`, { method: "DELETE" });
    return { ok: true };
  },

  async removeMany(filters: ExpenseFilters = {}) {
    const url = withQuery("/expenses", {
      project_id: filters.project_id,
      from_date: filters.from,
      to_date: filters.to,
      category: filters.category,
      claim_status:
        filters.claim_status && filters.claim_status !== "all"
          ? filters.claim_status
          : undefined,
    });
    const result = await apiRequest<{ deleted: number }>(url, { method: "DELETE" });
    return result.deleted;
  },

  async claimMany(expenseIds: string[], isClaimed: boolean) {
    const result = await apiRequest<BackendExpense[]>("/expenses/claim/bulk", {
      method: "PATCH",
      body: JSON.stringify({
        expense_ids: expenseIds.map((id) => Number(id)),
        is_claimed: isClaimed,
      }),
    });
    return result.map(toExpense);
  },
};

export const incomeApi = {
  async list(project_id?: string) {
    const url = withQuery("/income", { project_id });
    const rows = await apiRequest<BackendIncome[]>(url);
    return rows.map(toIncome);
  },

  async create(data: Omit<Income, "id">) {
    const row = await apiRequest<BackendIncome>("/income", {
      method: "POST",
      body: JSON.stringify({
        project_id: Number(data.project_id),
        date: data.date,
        source: data.source,
        amount: data.amount,
        notes: data.notes,
      }),
    });
    return toIncome(row);
  },

  async update(id: string, patch: Partial<Income>) {
    const row = await apiRequest<BackendIncome>(`/income/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        project_id:
          patch.project_id === undefined ? undefined : Number(patch.project_id),
        date: patch.date,
        source: patch.source,
        amount: patch.amount,
        notes: patch.notes,
      }),
    });
    return toIncome(row);
  },

  async remove(id: string) {
    await apiRequest<void>(`/income/${id}`, { method: "DELETE" });
    return { ok: true };
  },

  async removeMany(project_id?: string) {
    const url = withQuery("/income", { project_id });
    const result = await apiRequest<{ deleted: number }>(url, { method: "DELETE" });
    return result.deleted;
  },
};

export const dashboardApi = {
  async get(project_id?: string): Promise<DashboardSummary> {
    const summaryPath = withQuery("/dashboard", { project_id });
    const expensesPath = withQuery("/expenses", { project_id });

    const [summary, expenseRows] = await Promise.all([
      apiRequest<BackendDashboard>(summaryPath),
      apiRequest<BackendExpense[]>(expensesPath),
    ]);

    const expenses = expenseRows.map(toExpense);
    const byCategoryMap = new Map<ExpenseCategory, number>();

    expenses.forEach((expense) => {
      byCategoryMap.set(
        expense.category,
        (byCategoryMap.get(expense.category) ?? 0) + expense.amount,
      );
    });

    const by_category = Array.from(byCategoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    return {
      total_income: summary.total_income,
      total_expenses: summary.total_expenses,
      net_balance: summary.net_balance,
      total_claimed: summary.claimed_total,
      total_unclaimed: summary.unclaimed_total,
      by_category,
      claim_breakdown: [
        { name: "Claimed", value: summary.claimed_total },
        { name: "Unclaimed", value: summary.unclaimed_total },
      ],
    };
  },
};

export const pdfApi = {
  async parse(file: File): Promise<ParsedPdfRow[]> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let message = `${response.status} ${response.statusText}`;
      try {
        const payload = (await response.json()) as { detail?: string };
        if (payload.detail) {
          message = payload.detail;
        }
      } catch {
        // keep fallback message when body is not JSON
      }
      throw new Error(message);
    }

    const payload = (await response.json()) as { rows: BackendPdfRow[] };
    return payload.rows.map((row) => ({
      id: uid(),
      post_date: toIsoDate(row.post_date),
      trans_date: toIsoDate(row.trans_date),
      description: row.description,
      amount: row.amount,
    }));
  },

  confirm: async (rows: Omit<Expense, "id">[]) => expensesApi.bulkCreate(rows),
};
