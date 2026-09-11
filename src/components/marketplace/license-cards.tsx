import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";

import { licenseMatrix, licenses } from "@/lib/catalog/licenses";
import { formatPrice } from "@/lib/catalog/service";
import type { License } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function LicenseCard({
  license,
  basePrice,
  action,
  className,
}: {
  license: License;
  /** When provided, shows the concrete price for a specific template. */
  basePrice?: number;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-lg border bg-card p-6 transition-colors",
        license.popular
          ? "border-brand/50 shadow-[var(--shadow-glow)]"
          : "border-border hover:border-border-strong",
        className,
      )}
    >
      {license.popular && (
        <span className="absolute -top-2.5 left-6 rounded-md bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-foreground">
          Most purchased
        </span>
      )}
      <h3 className="font-display text-lg font-semibold tracking-tight">{license.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{license.blurb}</p>

      <div className="mt-6 flex items-baseline gap-1.5">
        {typeof basePrice === "number" ? (
          <>
            <span className="font-display text-3xl font-semibold tracking-tight">
              {formatPrice(Math.round(basePrice * license.multiplier))}
            </span>
            <span className="text-xs text-muted-foreground">one-time</span>
          </>
        ) : (
          <>
            <span className="font-display text-3xl font-semibold tracking-tight">
              {license.multiplier}×
            </span>
            <span className="text-xs text-muted-foreground">template base price</span>
          </>
        )}
      </div>
      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-brand">
        {license.projects}
      </p>

      <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
        {license.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            <span className="text-muted-foreground">{h}</span>
          </li>
        ))}
      </ul>

      {action && <div className="mt-6 pt-1">{action}</div>}
    </div>
  );
}

export function LicenseComparison({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border bg-card", className)}>
      <table className="w-full min-w-[38rem] text-sm">
        <caption className="sr-only">License comparison</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="px-5 py-4 text-left font-medium text-muted-foreground">
              What you can do
            </th>
            {licenses.map((l) => (
              <th key={l.id} scope="col" className="px-5 py-4 text-left font-semibold">
                {l.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {licenseMatrix.map((row) => (
            <tr key={row.feature} className="border-b border-border last:border-0">
              <th scope="row" className="px-5 py-3.5 text-left font-normal text-muted-foreground">
                {row.feature}
              </th>
              {licenses.map((l) => {
                const value = row.values[l.id];
                const negative = value === "No";
                return (
                  <td key={l.id} className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        negative ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {negative ? (
                        <Minus className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                      )}
                      {value}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
