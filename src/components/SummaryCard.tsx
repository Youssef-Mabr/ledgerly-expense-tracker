import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "success" | "warning" | "destructive";
}

const toneClasses = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning-foreground",
  destructive: "bg-destructive/10 text-destructive",
} as const;

export function SummaryCard({ label, value, icon: Icon, hint, tone = "default" }: SummaryCardProps) {
  return (
    <Card className="border-border/70 overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex h-full min-h-[108px] flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-[0.12em] leading-tight">
                {label}
              </div>
            </div>
            <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", toneClasses[tone])}>
              <Icon className="h-5.5 w-5.5" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[1.35rem] sm:text-[1.55rem] lg:text-[1.75rem] font-semibold tracking-tight tabular-nums leading-none whitespace-nowrap">
              {value}
            </div>
            {hint && (
              <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
