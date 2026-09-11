import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  LifeBuoy,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UserCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/layout/logo";
import { SearchCommand, useCommandShortcut } from "@/components/layout/search-command";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/features/theme/theme-provider";
import { adminUserQuery, dashboardQuery, reviewsQuery } from "@/lib/admin/queries";
import { roleLabels } from "@/lib/admin/constants";
import { adminNav, adminNavItems } from "./nav";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { data: reviews } = useQuery(reviewsQuery());
  const pending = reviews?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <nav aria-label="Back office" className="space-y-5">
      {adminNav.map((group) => (
        <div key={group.label}>
          <p className="eyebrow px-3 pb-2 text-[0.625rem]">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  activeOptions={{ exact: item.to === "/admin" }}
                  className="group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2/70 hover:text-foreground"
                  activeProps={{
                    className: "bg-surface-2 text-foreground shadow-[inset_2px_0_0_0_var(--brand)]",
                    "aria-current": "page",
                  }}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                  {item.to === "/admin/reviews" && pending > 0 && (
                    <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 font-mono text-[10px] font-semibold text-brand-foreground">
                      {pending}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function WorkspaceBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/35 bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
      <ShieldCheck className="h-3 w-3" aria-hidden />
      Back office
    </span>
  );
}

function AdminUserMenu() {
  const { data: user } = useQuery(adminUserQuery());
  const name = user?.name ?? "Operator";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border bg-surface-2/70 py-1 pl-1 pr-2.5 text-left transition-colors hover:border-border-strong"
          aria-label="Operator menu"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-gradient font-display text-[11px] font-semibold text-brand-foreground">
            {initials(name)}
          </span>
          <span className="hidden max-w-28 truncate text-xs font-medium sm:block">{name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-1">
          <span className="block text-sm font-medium">{name}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user?.email ?? "sample operator"}
          </span>
          {user && (
            <span className="inline-block rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {roleLabels[user.role]}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/admin/settings">
            <Settings /> Store settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account">
            <UserCircle2 /> Customer view
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/contact">
            <LifeBuoy /> Internal support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() =>
            toast.info("Sign out is a demo action", {
              description: "Operator sessions arrive when authentication is connected.",
            })
          }
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminShell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { theme, toggle, mounted } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: dashboard } = useQuery(dashboardQuery("30d"));
  const alerts = dashboard?.alerts.length ?? 0;

  useCommandShortcut(setSearchOpen);
  useEffect(() => setNavOpen(false), [pathname]);

  const current =
    [...adminNavItems]
      .filter((item) => item.to !== "/admin")
      .sort((a, b) => b.to.length - a.to.length)
      .find((item) => pathname.startsWith(item.to)) ?? adminNavItems[0]!;

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:text-brand-foreground"
      >
        Skip to back office content
      </a>

      <div className="mx-auto flex w-full max-w-[112rem]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
          <div className="flex h-16 items-center gap-2 border-b border-border px-5">
            <Logo />
          </div>
          <div className="border-b border-border px-5 py-3">
            <WorkspaceBadge />
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <NavList />
          </div>
          <div className="space-y-2 border-t border-border p-3">
            <Button asChild variant="subtle" size="sm" className="w-full justify-between">
              <Link to="/templates">
                Open storefront <ArrowUpRight />
              </Link>
            </Button>
            <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
              Sample workspace. Payments, storage and email are not connected.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
              <Sheet open={navOpen} onOpenChange={setNavOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open back office navigation"
                  >
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[17.5rem] overflow-y-auto p-0">
                  <div className="flex h-16 items-center border-b border-border px-5">
                    <SheetTitle asChild>
                      <span>
                        <Logo />
                      </span>
                    </SheetTitle>
                  </div>
                  <div className="border-b border-border px-5 py-3">
                    <WorkspaceBadge />
                  </div>
                  <div className="px-3 py-5">
                    <NavList onNavigate={() => setNavOpen(false)} />
                  </div>
                  <div className="border-t border-border p-3">
                    <Button asChild variant="subtle" size="sm" className="w-full justify-between">
                      <Link to="/templates">
                        Open storefront <ArrowUpRight />
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="min-w-0 lg:pl-1">
                <p className="eyebrow hidden text-[0.625rem] sm:block">DevAssets operations</p>
                <p className="truncate text-sm font-semibold tracking-tight">{current.title}</p>
              </div>

              <div className="ml-auto flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="hidden justify-start gap-2 text-muted-foreground md:flex md:w-44 lg:w-56"
                >
                  <Search className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="flex-1 truncate text-left">Search catalog</span>
                  <kbd className="hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] lg:inline-block">
                    ⌘K
                  </kbd>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Search catalog"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search />
                </Button>

                <Button asChild variant="ghost" size="icon" className="relative">
                  <Link
                    to="/admin"
                    aria-label={alerts ? `Operations alerts, ${alerts} open` : "Operations alerts"}
                  >
                    <Bell />
                    {alerts > 0 && (
                      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand ring-2 ring-background" />
                    )}
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggle}
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                >
                  {mounted && theme === "dark" ? <Sun /> : <Moon />}
                </Button>

                <AdminUserMenu />
              </div>
            </div>
          </header>

          <main id="admin-main" className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl space-y-8">
              <Outlet />
            </div>
          </main>

          <footer className="border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2">
              <span>DevAssets back office — sample operations data</span>
              <Link to="/admin/settings" className="transition-colors hover:text-foreground">
                Settings
              </Link>
              <Link to="/admin/audit-logs" className="transition-colors hover:text-foreground">
                Audit logs
              </Link>
              <Link to="/templates" className="ml-auto transition-colors hover:text-foreground">
                Back to storefront
              </Link>
            </div>
          </footer>
        </div>
      </div>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
