import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layers, LayoutTemplate, Receipt, Sparkles } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { categories } from "@/lib/catalog/categories";
import { products } from "@/lib/catalog/products";
import { formatPrice } from "@/lib/catalog/service";

export function useCommandShortcut(setOpen: (open: boolean) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  const go = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search templates, categories, technologies…" />
      <CommandList>
        <CommandEmpty>No matches. Try “dashboard”, “hotel” or “checkout”.</CommandEmpty>
        <CommandGroup heading="Templates">
          {products.map((p) => (
            <CommandItem
              key={p.id}
              value={`${p.name} ${p.tagline} ${p.tags.join(" ")} ${p.tech.join(" ")}`}
              onSelect={() =>
                go(() => navigate({ to: "/templates/$slug", params: { slug: p.slug } }))
              }
            >
              <LayoutTemplate />
              <span className="flex-1 truncate">{p.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatPrice(p.salePrice ?? p.price)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Categories">
          {categories.map((c) => (
            <CommandItem
              key={c.slug}
              value={`${c.name} ${c.short}`}
              onSelect={() =>
                go(() => navigate({ to: "/categories/$slug", params: { slug: c.slug } }))
              }
            >
              <Layers />
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.short}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Pages">
          <CommandItem value="all templates catalog" onSelect={() => go(() => navigate({ to: "/templates" }))}>
            <Sparkles /> Browse all templates
          </CommandItem>
          <CommandItem value="pricing licensing" onSelect={() => go(() => navigate({ to: "/pricing" }))}>
            <Receipt /> Licensing & pricing
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
