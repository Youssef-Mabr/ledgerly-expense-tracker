import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ExpensesTable } from "@/components/ExpensesTable";

export const Route = createFileRoute("/expenses")({
  component: ExpensesPage,
});

function ExpensesPage() {
  return (
    <AppShell title="Expenses" subtitle="All expenses across projects">
      <ExpensesTable />
    </AppShell>
  );
}
