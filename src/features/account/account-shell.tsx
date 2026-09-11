import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  Download,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  Sun,
  UserCog,
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
import { notificationsQuery, userQuery } from "@/lib/account/queries";
import { accountNav, accountNavItems } from "./nav";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { data: notifications } = useQuery(notificationsQuery());
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <nav aria-label="Account" className="space-y-6">
      {accountNav.map((group) => (
        <div key={group.label}>
          <p className="eyebrow px-3 pb-2 text-[0.625rem]">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  activeOptions={{ exact: item.to === "/account" }}
                  className="group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2/70 hover:text-foreground"
                  activeProps={{
                    className:
                      "bg-surface-2 text-foreground shadow-[inset_2px_0_0_0_var(--brand)]",
                    "aria-current": "page",
                  }}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                  {item.to === "/account/notifications" && unread > 0 && (
                    <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 font-mono text-[10px] font-semibold text-brand-foreground">
                      {unread}
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

function UserMenu() {
  const { data: user } = useQuery(userQuery());
  const name = user?.name ?? "Your account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border bg-surface-2/70 py-1 pl-1 pr-2.5 text-left transition-colors hover:border-border-strong"
          aria-label="Account menu"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-gradient font-display text-[11px] font-semibold text-brand-foreground">
            {initials(name)}
          </span>
          <span className="hidden max-w-28 truncate text-xs font-medium sm:block">{name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-0.5">
          <span className="block text-sm font-medium">{name}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user?.email ?? "Sample account"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account/profile">
            <UserCog /> View profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/purchases">
            <Package /> Purchases
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/downloads">
            <Download /> Downloads
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() =>
            toast.info("Sign out is a demo action", {
              description: "Real sessions arrive when authentication is connected.",
            })
          }
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AccountShell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { theme, toggle, mounted } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: notifications } = useQuery(notificationsQuery());
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  useCommandShortcut(setSearchOpen);
  useEffect(() => setNavOpen(false), [pathname]);

  const current =
    accountNavItems.find((item) => item.to !== "/account" && pathname.startsWith(item.to)) ??
    accountNavItems[0]!;

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#account-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:text-brand-foreground"
      >
        Skip to account content
      </a>

      <div className="mx-auto flex w-full max-w-[104rem]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
          <div className="flex h-16 items-center border-b border-border px-5">
            <Logo />
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <NavList />
          </div>
          <div className="border-t border-border p-3">
            <Button asChild variant="subtle" size="sm" className="w-full justify-between">
              <Link to="/templates">
                Explore marketplace <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
              <Sheet open={navOpen} onOpenChange={setNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open account navigation">
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
                  <div className="px-3 py-5">
                    <NavList onNavigate={() => setNavOpen(false)} />
                  </div>
                  <div className="border-t border-border p-3">
                    <Button asChild variant="subtle" size="sm" className="w-full justify-between">
                      <Link to="/templates">
                        Explore marketplace <ArrowUpRight />
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="min-w-0 lg:pl-1">
                <p className="eyebrow hidden text-[0.625rem] sm:block">Account</p>
                <p className="truncate text-sm font-semibold tracking-tight">{current.title}</p>
              </div>

              <div className="ml-auto flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="hidden justify-start gap-2 text-muted-foreground md:flex md:w-48 lg:w-60"
                >
                  <Search className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="flex-1 truncate text-left">Search marketplace</span>
                  <kbd className="hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] lg:inline-block">
                    ⌘K
                  </kbd>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Search marketplace"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search />
                </Button>

                <Button asChild variant="ghost" size="icon" className="relative">
                  <Link
                    to="/account/notifications"
                    aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
                  >
                    <Bell />
                    {unread > 0 && (
                      <span
                        className={cn(
                          "absolute right-1 top-1 h-2 w-2 rounded-full bg-brand ring-2 ring-background",
                        )}
                      />
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

                <UserMenu />
              </div>
            </div>
          </header>

          <main id="account-main" className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl space-y-8">
              <Outlet />
            </div>
          </main>

          <footer className="border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2">
              <span>DevAssets account — sample data preview</span>
              <Link to="/account/support" className="transition-colors hover:text-foreground">
                Help &amp; support
              </Link>
              <Link to="/pricing" className="transition-colors hover:text-foreground">
                Licensing
              </Link>
              <Link to="/templates" className="ml-auto transition-colors hover:text-foreground">
                Back to marketplace
              </Link>
            </div>
          </footer>
        </div>
      </div>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
