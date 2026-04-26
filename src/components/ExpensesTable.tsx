import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { expensesApi, projectsApi, type ExpenseFilters } from "@/services/api";
import type { Expense, Project } from "@/services/types";
import { formatMYR, formatDate } from "@/lib/format";
import { toast } from "sonner";

interface Props {
  projectId?: string;
  showFilters?: boolean;
}

export function ExpensesTable({ projectId, showFilters = true }: Props) {
  const [rows, setRows] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>({
    project_id: projectId,
    claim_status: "all",
  });

  const load = useCallback(() => {
    expensesApi.list(filters).then(setRows);
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { projectsApi.list().then(setProjects); }, []);
  useEffect(() => {
    setFilters((f) => ({ ...f, project_id: projectId }));
  }, [projectId]);
  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => rows.some((row) => row.id === id)));
  }, [rows]);

  const allSelected = rows.length > 0 && selectedIds.length === rows.length;
  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggle = async (id: string) => {
    await expensesApi.toggleClaim(id);
    load();
    toast.success("Claim status updated");
  };

  const claimAll = async (isClaimed: boolean) => {
    if (!selectedIds.length) {
      return toast.error("Select one or more expenses first");
    }
    await expensesApi.claimMany(selectedIds, isClaimed);
    load();
    setSelectedIds([]);
    toast.success(isClaimed ? "Marked selected as claimed" : "Marked selected as unclaimed");
  };

  const deleteAll = async () => {
    if (!rows.length) {
      return toast.error("No expenses to delete");
    }
    if (!window.confirm(`Delete ${rows.length} expense${rows.length === 1 ? "" : "s"}?`)) {
      return;
    }
    await expensesApi.removeMany(filters);
    load();
    toast.success("Expenses deleted");
  };

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="space-y-4">
      {showFilters && (
        <Card className="border-border/70">
          <CardContent className="p-4 grid gap-3 grid-cols-1 sm:grid-cols-4">
            {!projectId && (
              <div className="space-y-1.5">
                <Label className="text-xs">Project</Label>
                <Select
                  value={filters.project_id ?? "all"}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, project_id: v === "all" ? undefined : v }))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All projects</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Claim status</Label>
              <Select
                value={filters.claim_status ?? "all"}
                onValueChange={(v) =>
                  setFilters((f) => ({ ...f, claim_status: v as ExpenseFilters["claim_status"] }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="unclaimed">Unclaimed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {rows.length} expense{rows.length === 1 ? "" : "s"} shown
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => claimAll(true)} disabled={!selectedIds.length}>
            Mark selected as claimed
          </Button>
          <Button variant="outline" size="sm" onClick={() => claimAll(false)} disabled={!selectedIds.length}>
            Mark selected as unclaimed
          </Button>
          <Button variant="destructive" size="sm" onClick={deleteAll} disabled={!rows.length}>
            Delete all shown
          </Button>
        </div>
      </div>

      <Card className="border-border/70">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => {
                      setSelectedIds(checked ? rows.map((row) => row.id) : []);
                    }}
                    aria-label="Select all expenses"
                  />
                </TableHead>
                <TableHead className="w-[110px]">Date</TableHead>
                <TableHead>Description</TableHead>
                {!projectId && <TableHead>Project</TableHead>}
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center w-32">Claimed</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((e) => (
                <TableRow key={e.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(e.id)}
                      onCheckedChange={() => toggleSelected(e.id)}
                      aria-label={`Select expense ${e.description}`}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(e.date)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{e.description}</div>
                    {e.source_ref && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        from {e.source_ref}
                      </div>
                    )}
                  </TableCell>
                  {!projectId && (
                    <TableCell className="text-sm text-muted-foreground">
                      {projectName(e.project_id)}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="secondary" className="font-normal capitalize">
                      {e.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatMYR(e.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch checked={e.is_claimed} onCheckedChange={() => toggle(e.id)} />
                      <span className={`text-xs ${e.is_claimed ? "text-success" : "text-muted-foreground"}`}>
                        {e.is_claimed ? "Yes" : "No"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive h-7"
                      onClick={async () => {
                        await expensesApi.remove(e.id);
                        load();
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={projectId ? 7 : 8} className="text-center py-12 text-sm text-muted-foreground">
                    No expenses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
