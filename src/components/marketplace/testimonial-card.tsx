import { Quote } from "lucide-react";

import type { Testimonial } from "@/lib/catalog/content";
import { cn } from "@/lib/utils";

export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "flex h-full flex-col gap-5 rounded-lg border border-border bg-card p-6 transition-colors hover:border-border-strong",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Quote className="h-5 w-5 shrink-0 text-brand" aria-hidden />
        <span className="rounded border border-border px-2 py-0.5 font-mono text-[9px] uppercase text-muted-foreground">Illustrative</span>
      </div>
      <blockquote className="text-[0.9375rem] leading-relaxed text-foreground/90">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface-2 font-mono text-[11px] font-semibold">
          {testimonial.initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{testimonial.author}</span>
          <span className="block truncate text-xs text-muted-foreground">{testimonial.role}</span>
        </span>
        {testimonial.metric && (
          <span className="ml-auto shrink-0 rounded-md border border-brand/30 bg-brand/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-brand">
            {testimonial.metric}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
