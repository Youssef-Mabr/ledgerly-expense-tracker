import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { incomeApi, projectsApi } from "@/services/api";
import type { Income, Project } from "@/services/types";
import { formatMYR, formatDate } from "@/lib/format";
import { toast } from "sonner";

export function IncomeTable({ projectId }: { projectId?: string }) {
  const [rows, setRows] = useState<Income[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    incomeApi.list(projectId).then(setRows);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { projectsApi.list().then(setProjects); }, []);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

  const deleteAll = async () => {
    if (!rows.length) {
      return toast.error("No income to delete");
    }
    if (!window.confirm(`Delete ${rows.length} income record${rows.length === 1 ? "" : "s"}?`)) {
      return;
    }
    await incomeApi.removeMany(projectId);
    load();
    toast.success("Income deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {rows.length} income record{rows.length === 1 ? "" : "s"} shown
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteAll}
            disabled={!rows.length}
          >
            Delete all shown
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add income
            </Button>
          </DialogTrigger>
          <NewIncomeDialog
            defaultProjectId={projectId}
            projects={projects}
            onCreated={() => { setOpen(false); load(); toast.success("Income added"); }}
          />
        </Dialog>
        </div>
      </div>

      <Card className="border-border/70">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Date</TableHead>
                <TableHead>Source</TableHead>
                {!projectId && <TableHead>Project</TableHead>}
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((i) => (
                <TableRow key={i.id} className="hover:bg-muted/40">
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(i.date)}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{i.source}</TableCell>
                  {!projectId && (
                    <TableCell className="text-sm text-muted-foreground">
                      {projectName(i.project_id)}
                    </TableCell>
                  )}
                  <TableCell className="text-right tabular-nums font-medium text-success">
                    {formatMYR(i.amount)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive h-7"
                      onClick={async () => { await incomeApi.remove(i.id); load(); }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={projectId ? 4 : 5} className="text-center py-12 text-sm text-muted-foreground">
                    No income recorded.
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

function NewIncomeDialog({
  defaultProjectId,
  projects,
  onCreated,
}: {
  defaultProjectId?: string;
  projects: Project[];
  onCreated: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? projects[0]?.id ?? "");

  useEffect(() => {
    if (!projectId && projects.length) setProjectId(defaultProjectId ?? projects[0].id);
  }, [projects, defaultProjectId, projectId]);

  const submit = async () => {
    if (!source || !amount || !projectId) return toast.error("All fields required");
    await incomeApi.create({
      date, source, amount: Number(amount), project_id: projectId,
    });
    setSource(""); setAmount("");
    onCreated();
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Add income</DialogTitle></DialogHeader>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ni-date">Date</Label>
            <Input id="ni-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ni-amt">Amount (MYR)</Label>
            <Input id="ni-amt" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ni-src">Source</Label>
          <Input id="ni-src" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Client milestone 1" />
        </div>
        {!defaultProjectId && (
          <div className="space-y-1.5">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button onClick={submit}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
}
