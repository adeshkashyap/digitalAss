import { formatPrice } from "@/lib/catalog/service";
import { cn } from "@/lib/utils";

export function PriceDisplay({
  price,
  salePrice,
  size = "md",
  className,
}: {
  price: number;
  salePrice?: number | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const onSale = typeof salePrice === "number";
  const main = salePrice ?? price;
  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-3xl",
  } as const;

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-display font-semibold tracking-tight", sizes[size])}>
        {formatPrice(main)}
      </span>
      {onSale && (
        <>
          <span
            className={cn(
              "text-muted-foreground line-through",
              size === "lg" ? "text-base" : "text-xs",
            )}
          >
            {formatPrice(price)}
          </span>
          <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
            -{Math.round((1 - main / price) * 100)}%
          </span>
        </>
      )}
    </div>
  );
}
