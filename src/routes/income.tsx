import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { IncomeTable } from "@/components/IncomeTable";

export const Route = createFileRoute("/income")({
  component: IncomePage,
});

function IncomePage() {
  return (
    <AppShell title="Income" subtitle="Manually recorded income">
      <IncomeTable />
    </AppShell>
  );
}
