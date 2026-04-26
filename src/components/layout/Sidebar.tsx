import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  TrendingUp,
  FileUp,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/income", label: "Income", icon: TrendingUp },
  { to: "/upload", label: "Import PDF", icon: FileUp },
];

export function Sidebar() {
  const { location } = useRouterState();
  const path = location.pathname;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <Wallet className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm">Ledgerly</div>
          <div className="text-[11px] text-sidebar-foreground/60">Expense & Claim</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
          Workspace
        </div>
        {nav.map((item) => {
          const active = item.exact ? path === item.to : path.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to as "/"}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-lg bg-sidebar-accent/40 border border-sidebar-border p-3">
        <div className="text-xs font-medium">Base currency</div>
        <div className="text-[11px] text-sidebar-foreground/60 mt-0.5">
          MYR — Malaysian Ringgit
        </div>
      </div>
    </aside>
  );
}
