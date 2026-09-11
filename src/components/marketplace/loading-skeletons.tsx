import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}>
      <div className="border-b border-border p-4">
        <Skeleton className="aspect-[16/10] w-full rounded-lg" />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex gap-1.5 pt-1">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-4 w-14" />
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="shell py-16">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-6 h-10 w-2/3 max-w-xl" />
      <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
      <div className="mt-12">
        <ProductGridSkeleton count={3} />
      </div>
    </div>
  );
}
