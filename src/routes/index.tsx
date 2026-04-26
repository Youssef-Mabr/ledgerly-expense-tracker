import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { SummaryCard } from "@/components/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi } from "@/services/api";
import { formatMYR } from "@/lib/format";
import type { DashboardSummary } from "@/services/types";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

const PIE_COLORS = ["var(--chart-3)", "var(--chart-5)"];

function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    dashboardApi.get().then(setData);
  }, []);

  return (
    <AppShell title="Dashboard" subtitle="All projects · MYR">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <SummaryCard
          label="Total income"
          value={data ? formatMYR(data.total_income) : "—"}
          icon={TrendingUp}
          tone="success"
        />
        <SummaryCard
          label="Total expenses"
          value={data ? formatMYR(data.total_expenses) : "—"}
          icon={TrendingDown}
          tone="destructive"
        />
        <SummaryCard
          label="Net balance"
          value={data ? formatMYR(data.net_balance) : "—"}
          icon={Wallet}
          tone={data && data.net_balance >= 0 ? "success" : "destructive"}
        />
        <SummaryCard
          label="Claimed"
          value={data ? formatMYR(data.total_claimed) : "—"}
          icon={CheckCircle2}
          tone="default"
        />
        <SummaryCard
          label="Unclaimed"
          value={data ? formatMYR(data.total_unclaimed) : "—"}
          icon={Clock}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Expenses by category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.by_category ?? []} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v[0].toUpperCase() + v.slice(1)}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => formatMYR(v)}
                  />
                  <Bar dataKey="amount" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Claim status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.claim_breakdown ?? []}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {(data?.claim_breakdown ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => formatMYR(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
