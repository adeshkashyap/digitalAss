import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { allTags, allTech } from "@/lib/catalog/products";
import { categoriesQuery } from "@/lib/catalog/queries";
import { formatPrice } from "@/lib/catalog/service";
import { cn } from "@/lib/utils";

export interface CatalogFilters {
  search: string;
  categories: string[];
  tech: string[];
  features: string[];
  minRating: number;
  maxPrice: number;
}

export const MAX_PRICE = 140;

export const defaultFilters: CatalogFilters = {
  search: "",
  categories: [],
  tech: [],
  features: [],
  minRating: 0,
  maxPrice: MAX_PRICE,
};

export const activeFilterCount = (f: CatalogFilters) =>
  f.categories.length +
  f.tech.length +
  f.features.length +
  (f.minRating > 0 ? 1 : 0) +
  (f.maxPrice < MAX_PRICE ? 1 : 0);

const featureOptions = allTags.filter((t) =>
  [
    "dark mode",
    "checkout",
    "booking",
    "charts",
    "data tables",
    "accessible",
    "multi-language ready",
    "rbac",
  ].includes(t),
);

function Group({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("border-t border-border pt-5", className)}>
      <legend className="eyebrow mb-3.5">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

function CheckRow({
  id,
  label,
  count,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  count?: number | undefined;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <Label
        htmlFor={id}
        className="flex flex-1 cursor-pointer items-center justify-between gap-2 text-sm font-normal text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="truncate">{label}</span>
        {typeof count === "number" && (
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground/70">{count}</span>
        )}
      </Label>
    </div>
  );
}

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export function FilterPanel({
  filters,
  onChange,
  onReset,
  className,
}: {
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  onReset: () => void;
  className?: string;
}) {
  const { data: categories = [] } = useQuery(categoriesQuery());
  const counts = Object.fromEntries(categories.map((c) => [c.slug, c.count]));

  const set = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Filters</h2>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
          Clear all
        </Button>
      </div>

      <Group title="Category" className="border-t-0 pt-0">
        {categories.map((c) => (
          <CheckRow
            key={c.slug}
            id={`cat-${c.slug}`}
            label={c.name}
            count={counts[c.slug]}
            checked={filters.categories.includes(c.slug)}
            onChange={() => set("categories", toggle(filters.categories, c.slug))}
          />
        ))}
      </Group>

      <Group title="Technology">
        {allTech.map((t) => (
          <CheckRow
            key={t}
            id={`tech-${t}`}
            label={t}
            checked={filters.tech.includes(t)}
            onChange={() => set("tech", toggle(filters.tech, t))}
          />
        ))}
      </Group>

      <Group title="Features">
        {featureOptions.map((t) => (
          <CheckRow
            key={t}
            id={`feat-${t}`}
            label={t.replace(/\b\w/g, (m) => m.toUpperCase())}
            checked={filters.features.includes(t)}
            onChange={() => set("features", toggle(filters.features, t))}
          />
        ))}
      </Group>

      <Group title="Maximum price">
        <div className="pt-1">
          <Slider
            value={[filters.maxPrice]}
            min={30}
            max={MAX_PRICE}
            step={5}
            onValueChange={([v]) => set("maxPrice", v ?? MAX_PRICE)}
            aria-label="Maximum price"
          />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatPrice(30)}</span>
            <span className="font-medium text-foreground">
              Up to {formatPrice(filters.maxPrice)}
              {filters.maxPrice === MAX_PRICE ? "+" : ""}
            </span>
          </div>
        </div>
      </Group>

      <Group title="Rating">
        <div className="flex flex-wrap gap-2">
          {[0, 4, 4.5, 4.8].map((r) => (
            <Button
              key={r}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set("minRating", r)}
              aria-pressed={filters.minRating === r}
              className={cn(
                "h-8 gap-1.5 px-2.5",
                filters.minRating === r
                  ? "border-brand/50 bg-brand/10 text-brand"
                  : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {r === 0 ? (
                "Any"
              ) : (
                <>
                  <Star className="h-3 w-3 fill-current" aria-hidden />
                  {r}+
                </>
              )}
            </Button>
          ))}
        </div>
      </Group>
    </div>
  );
}
