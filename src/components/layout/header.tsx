import { Link } from "@tanstack/react-router";
import { CircleUser, Heart, Moon, Search, ShoppingCart, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchCommand, useCommandShortcut } from "@/components/layout/search-command";
import { Button } from "@/components/ui/button";
import { useStore } from "@/features/store/store-provider";
import { useTheme } from "@/features/theme/theme-provider";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/templates", label: "Templates" },
  { to: "/categories", label: "Categories" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
] as const;

function CountBadge({ value }: { value: number }) {
  if (!value) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 font-mono text-[10px] font-semibold text-brand-foreground">
      {value > 9 ? "9+" : value}
    </span>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, wishlistCount, hydrated } = useStore();
  const { theme, toggle, mounted } = useTheme();

  useCommandShortcut(setSearchOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:text-brand-foreground"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b transition-all duration-300",
          scrolled
            ? "border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65"
            : "border-transparent bg-background/60 backdrop-blur-sm",
        )}
      >
        <div
          className={cn(
            "shell flex items-center gap-3 transition-all duration-300",
            scrolled ? "h-14" : "h-16 sm:h-[4.5rem]",
          )}
        >
          <Logo />

          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              type="button"
              variant="subtle"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="hidden justify-start gap-2 text-muted-foreground md:flex md:w-52 lg:w-64"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1 truncate text-left">Search templates</span>
              <kbd className="hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] lg:inline-block">
                ⌘K
              </kbd>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Search templates"
              onClick={() => setSearchOpen(true)}
            >
              <Search />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {mounted && theme === "dark" ? <Sun /> : <Moon />}
            </Button>

            <Button asChild variant="ghost" size="icon" className="relative hidden sm:inline-flex">
              <Link to="/account/wishlist" aria-label="Wishlist">
                <Heart />
                {hydrated && <CountBadge value={wishlistCount} />}
              </Link>
            </Button>

            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Link to="/account" aria-label="Your account">
                <CircleUser />
              </Link>
            </Button>

            <Button asChild variant="ghost" size="icon" className="relative">
              <Link to="/cart" aria-label="Cart">
                <ShoppingCart />
                {hydrated && <CountBadge value={count} />}
              </Link>
            </Button>

            <div className="ml-1 hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/templates">Browse templates</Link>
              </Button>
            </div>

            <MobileNav />
          </div>
        </div>
      </header>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
