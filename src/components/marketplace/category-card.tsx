import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { ProductScreenshot } from "@/components/marketplace/product-screenshot";
import type { Category } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function CategoryCard({
  category,
  count,
  variant = "default",
  className,
}: {
  category: Category;
  count?: number | undefined;
  variant?: "default" | "compact";
  className?: string;
}) {
  return (
    <Link
      to="/categories/$slug"
      params={{ slug: category.slug }}
      className={cn(
        "card-lift group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      {variant === "default" && (
        <div className="relative h-36 overflow-hidden border-b border-border">
          <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
            <ProductScreenshot kind={category.preview} tint={category.tint} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate font-display text-base font-semibold tracking-tight">
            {category.name}
          </h3>
          {typeof count === "number" && (
            <span className="shrink-0 rounded-md border border-border bg-surface-2/70 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {count}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {variant === "compact" ? category.short : category.description}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-medium text-brand">
          Explore
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
