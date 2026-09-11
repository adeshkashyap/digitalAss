import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { getProductById } from "./service";
import type { Product } from "./types";

export function useProductsByIds(ids: string[]) {
  const unique = useMemo(() => [...new Set(ids.filter(Boolean))], [ids]);

  const queries = useQueries({
    queries: unique.map((id) => ({
      queryKey: ["catalog", "product-id", id] as const,
      queryFn: () => getProductById(id),
      staleTime: 5 * 60_000,
    })),
  });

  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    unique.forEach((id, index) => {
      const product = queries[index]?.data;
      if (product) map.set(id, product);
    });
    return map;
  }, [queries, unique]);

  return {
    productsById,
    isLoading: queries.some((q) => q.isLoading),
  };
}
