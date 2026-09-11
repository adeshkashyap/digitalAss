import { ProductCard } from "@/components/marketplace/product-card";
import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
  columns = 3,
}: {
  products: Product[];
  className?: string;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "@container grid gap-5 sm:grid-cols-2 xl:gap-6",
        columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2",
        className,
      )}
    >
      {products.map((p, i) => (
        <div
          key={p.id}
          className="reveal flex"
          style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
        >
          <ProductCard product={p} className="w-full" />
        </div>
      ))}
    </div>
  );
}
