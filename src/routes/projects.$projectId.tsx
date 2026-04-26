import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Wallet, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryCard } from "@/components/SummaryCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ExpensesTable } from "@/components/ExpensesTable";
import { IncomeTable } from "@/components/IncomeTable";
import { projectsApi, dashboardApi } from "@/services/api";
import { formatMYR, formatDate } from "@/lib/format";
import type { Project, DashboardSummary } from "@/services/types";

export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = useParams({ from: "/projects/$projectId" });
  const [project, setProject] = useState<Project | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    projectsApi.get(projectId).then(setProject);
    dashboardApi.get(projectId).then(setSummary);
  }, [projectId]);

  return (
    <AppShell
      title={project?.name ?? "Project"}
      subtitle={project?.description}
      actions={
        <Link
          to="/projects"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All projects
        </Link>
      }
    >
      {project && (
        <Card className="mb-5 border-border/70">
          <CardContent className="p-5 flex flex-wrap gap-6 items-center">
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="mt-1"><StatusBadge status={project.status} /></div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Budget</div>
              <div className="mt-1 font-semibold tabular-nums">{formatMYR(project.budget)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Start</div>
              <div className="mt-1 text-sm">{project.start_date ? formatDate(project.start_date) : "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">End</div>
              <div className="mt-1 text-sm">{project.end_date ? formatDate(project.end_date) : "—"}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-5">
        <SummaryCard label="Income" value={summary ? formatMYR(summary.total_income) : "—"} icon={TrendingUp} tone="success" />
        <SummaryCard label="Expenses" value={summary ? formatMYR(summary.total_expenses) : "—"} icon={TrendingDown} tone="destructive" />
        <SummaryCard label="Net" value={summary ? formatMYR(summary.net_balance) : "—"} icon={Wallet} tone={summary && summary.net_balance >= 0 ? "success" : "destructive"} />
        <SummaryCard label="Unclaimed" value={summary ? formatMYR(summary.total_unclaimed) : "—"} icon={CheckCircle2} tone="warning" />
      </div>

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses" className="mt-4">
          <ExpensesTable projectId={projectId} />
        </TabsContent>
        <TabsContent value="income" className="mt-4">
          <IncomeTable projectId={projectId} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
