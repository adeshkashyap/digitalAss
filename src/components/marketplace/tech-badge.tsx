import { cn } from "@/lib/utils";

export function TechBadge({
  label,
  className,
  tone = "default",
}: {
  label: string;
  className?: string;
  tone?: "default" | "brand";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        tone === "brand"
          ? "border-brand/40 bg-brand/10 text-brand"
          : "border-border bg-surface-2/70 text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
