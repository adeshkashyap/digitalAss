import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useRef, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { categories } from "@/lib/catalog/categories";

const links = [
  { to: "/templates", label: "All templates" },
  { to: "/categories", label: "Categories" },
  { to: "/pricing", label: "Licensing & pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/account", label: "Your account" },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) triggerRef.current?.focus();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          size="icon"
          className="touch-target lg:hidden lg:min-h-9 lg:min-w-9"
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[19rem] overflow-y-auto p-0">
        <div className="flex h-14 items-center border-b border-border px-5">
          <SheetTitle asChild>
            <span>
              <Logo />
            </span>
          </SheetTitle>
        </div>
        <nav className="flex flex-col p-3" aria-label="Mobile">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{
                className: "bg-accent text-foreground",
                "aria-current": "page",
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="eyebrow px-3 pb-2">Browse by category</p>
          <div className="grid grid-cols-2 gap-1.5">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/categories/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center truncate rounded-md border border-border px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-2 border-t border-border p-4">
          <Button asChild variant="hero" className="w-full">
            <Link to="/templates" onClick={() => setOpen(false)}>
              Browse templates
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
