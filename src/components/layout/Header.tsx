import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Bell, Menu, LayoutDashboard, FolderKanban, Receipt, TrendingUp, FileUp, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const nav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/income", label: "Income", icon: TrendingUp },
  { to: "/upload", label: "Import PDF", icon: FileUp },
];

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { location } = useRouterState();
  const path = location.pathname;

  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur sticky top-0 z-20">
      <div className="h-full flex items-center justify-between px-4 md:px-6 gap-4">
        <div className="min-w-0 flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 md:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86%] max-w-xs p-0">
              <div className="h-16 flex items-center gap-2.5 px-4 border-b border-border">
                <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="leading-tight">
                  <div className="font-semibold text-sm">Ledgerly</div>
                  <div className="text-[11px] text-muted-foreground">Expense & Claim</div>
                </div>
              </div>
              <nav className="px-3 py-4 space-y-1">
                {nav.map((item) => {
                  const active = item.exact ? path === item.to : path.startsWith(item.to);
                  return (
                    <SheetClose asChild>
                      <Link
                        key={item.to}
                        to={item.to as "/"}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="min-w-0 leading-tight">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden lg:block">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8 w-64 h-9" />
          </div>
          {actions}
          <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:inline-flex">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground hidden sm:flex items-center justify-center text-xs font-semibold">
            AS
          </div>
        </div>
      </div>
    </header>
  );
}
