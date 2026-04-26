import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderKanban, PencilLine, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { projectsApi } from "@/services/api";
import { formatMYR, formatDate } from "@/lib/format";
import type { Project, ProjectStatus } from "@/services/types";
import { toast } from "sonner";

export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const refresh = () => projectsApi.list().then(setProjects);
  useEffect(() => { refresh(); }, []);

  const openCreateDialog = () => {
    setEditingProject(null);
    setOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditingProject(null);
  };

  return (
    <AppShell
      title="Projects"
      subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
      actions={
        <Button size="sm" className="gap-1.5" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" /> New project
        </Button>
      }
    >
      <Dialog open={open} onOpenChange={(value) => (value ? setOpen(true) : closeDialog())}>
        <ProjectDialog
          project={editingProject}
          onCreated={() => {
            closeDialog();
            refresh();
            toast.success("Project created");
          }}
          onUpdated={() => {
            closeDialog();
            refresh();
            toast.success("Project updated");
          }}
        />
      </Dialog>

      <Card className="border-border/70">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: p.id }}
                      className="flex items-center gap-3 group"
                    >
                      <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <FolderKanban className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium group-hover:text-primary truncate">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-md">
                            {p.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.start_date ? formatDate(p.start_date) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatMYR(p.budget)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => openEditDialog(p)}
                      >
                        <PencilLine className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Link
                        to="/projects/$projectId"
                        params={{ projectId: p.id }}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs text-destructive"
                        onClick={async () => {
                          if (!window.confirm(`Delete project \"${p.name}\"? This also removes related expenses and income.`)) {
                            return;
                          }
                          await projectsApi.remove(p.id);
                          refresh();
                          toast.success("Project deleted");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                    No projects yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function ProjectDialog({
  project,
  onCreated,
  onUpdated,
}: {
  project: Project | null;
  onCreated: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [budget, setBudget] = useState(project ? String(project.budget) : "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "active");
  const [startDate, setStartDate] = useState(project?.start_date ?? "");
  const [endDate, setEndDate] = useState(project?.end_date ?? "");

  useEffect(() => {
    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setBudget(project ? String(project.budget) : "");
    setStatus(project?.status ?? "active");
    setStartDate(project?.start_date ?? "");
    setEndDate(project?.end_date ?? "");
  }, [project]);

  const submit = async () => {
    if (!name || !budget) return toast.error("Name and budget are required");
    const payload = {
      name,
      description,
      budget: Number(budget),
      status,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    };

    if (project) {
      await projectsApi.update(project.id, payload);
      onUpdated();
      return;
    }

    await projectsApi.create(payload);
    setName("");
    setDescription("");
    setBudget("");
    setStartDate("");
    setEndDate("");
    onCreated();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="np-name">Name</Label>
          <Input id="np-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q4 Campaign" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="np-desc">Description</Label>
          <Textarea id="np-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="np-budget">Budget (MYR)</Label>
            <Input id="np-budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="50000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np-start">Start date</Label>
            <Input id="np-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="np-end">End date</Label>
          <Input id="np-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On hold</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit}>{project ? "Update project" : "Create project"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
