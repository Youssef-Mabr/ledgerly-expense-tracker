import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pdfApi, projectsApi } from "@/services/api";
import type { ParsedPdfRow, Project } from "@/services/types";
import { formatMYR } from "@/lib/format";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [rows, setRows] = useState<ParsedPdfRow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [defaultProjectId, setDefaultProjectId] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    projectsApi.list().then((ps) => {
      setProjects(ps);
      if (ps[0]) setDefaultProjectId(ps[0].id);
    });
  }, []);

  const handleFile = async (f: File) => {
    setFile(f);
    setParsing(true);
    try {
      const parsed = await pdfApi.parse(f);
      setRows(parsed.map((r) => ({ ...r, project_id: defaultProjectId })));
      toast.success(`Parsed ${parsed.length} transactions`);
    } catch {
      toast.error("Failed to parse PDF");
    } finally {
      setParsing(false);
    }
  };

  const update = (id: string, patch: Partial<ParsedPdfRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));

  const confirm = async () => {
    if (rows.some((r) => !r.project_id)) {
      return toast.error("Assign a project to every row");
    }
    await pdfApi.confirm(
      rows.map((r) => ({
        date: r.trans_date,
        description: r.description,
        amount: r.amount,
        category: "other",
        project_id: r.project_id!,
        is_claimed: false,
        source_ref: file?.name ?? "imported.pdf",
      })),
    );
    toast.success(`Imported ${rows.length} expenses`);
    setRows([]); setFile(null);
  };

  const reset = () => { setRows([]); setFile(null); };

  return (
    <AppShell
      title="Import PDF statement"
      subtitle="Upload a credit card statement to extract expenses"
    >
      {!rows.length && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
        >
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Drop your PDF here</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              We'll extract transactions from your Malaysian bank statement. CR rows and statement totals are automatically excluded.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => inputRef.current?.click()}
              disabled={parsing}
            >
              {parsing ? "Parsing..." : "Choose file"}
            </Button>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <>
          <Card className="border-border/70 mb-4">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">{file?.name}</div>
                  <div className="text-xs text-muted-foreground">{rows.length} transactions detected</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground mr-2">Apply project to all:</div>
                <Select
                  value={defaultProjectId}
                  onValueChange={(v) => {
                    setDefaultProjectId(v);
                    setRows((rs) => rs.map((r) => ({ ...r, project_id: v })));
                  }}
                >
                  <SelectTrigger className="w-52 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Post Date</TableHead>
                    <TableHead className="w-[140px]">Trans Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[180px]">Project</TableHead>
                    <TableHead className="text-right w-[140px]">Amount</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Input
                          type="date"
                          value={r.post_date}
                          onChange={(e) => update(r.id, { post_date: e.target.value })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={r.trans_date}
                          onChange={(e) => update(r.id, { trans_date: e.target.value })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={r.description}
                          onChange={(e) => update(r.id, { description: e.target.value })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={r.project_id ?? ""}
                          onValueChange={(v) => update(r.id, { project_id: v })}
                        >
                          <SelectTrigger className="h-8"><SelectValue placeholder="Assign..." /></SelectTrigger>
                          <SelectContent>
                            {projects.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step="0.01"
                          value={r.amount}
                          onChange={(e) => update(r.id, { amount: Number(e.target.value) })}
                          className="h-8 text-right tabular-nums"
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(r.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-semibold tabular-nums text-foreground">
                {formatMYR(rows.reduce((s, r) => s + r.amount, 0))}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset}>Cancel</Button>
              <Button onClick={confirm} className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Confirm & save
              </Button>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
