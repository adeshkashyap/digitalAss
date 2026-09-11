import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/marketplace/breadcrumbs";

/** Shared editorial page header used by every secondary public page. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  description,
  aside,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="hero-glow pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div
        className="grid-backdrop pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        aria-hidden
      />
      <div className="shell relative py-10 lg:py-16">
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0 max-w-3xl">
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            <h1 className="font-display text-display-lg font-semibold">{title}</h1>
            {description && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
