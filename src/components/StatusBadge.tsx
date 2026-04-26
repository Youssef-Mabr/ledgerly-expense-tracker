import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/services/types";

const map: Record<ProjectStatus, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-success/15 text-success border-success/30" },
  on_hold: { label: "On hold", cls: "bg-warning/20 text-warning-foreground border-warning/30" },
  closed: { label: "Closed", cls: "bg-muted text-muted-foreground border-border" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, cls } = map[status];
  return <Badge variant="outline" className={cn("font-medium", cls)}>{label}</Badge>;
}
