import { queryOptions } from "@tanstack/react-query";

import {
  getCategories,
  getFeaturedProducts,
  getNewProducts,
  getProduct,
  getProductsByCategory,
  getRelatedProducts,
  queryProducts,
} from "./service";
import type { CatalogQuery, Product } from "./types";

export const catalogKeys = {
  products: (query: CatalogQuery) => ["catalog", "products", query] as const,
  product: (slug: string) => ["catalog", "product", slug] as const,
  featured: (limit: number) => ["catalog", "featured", limit] as const,
  new: (limit: number) => ["catalog", "new", limit] as const,
  categories: ["catalog", "categories"] as const,
  categoryProducts: (slug: string) => ["catalog", "category", slug] as const,
  related: (slug: string) => ["catalog", "related", slug] as const,
};

export const catalogProductsQuery = (query: CatalogQuery) =>
  queryOptions({ queryKey: catalogKeys.products(query), queryFn: () => queryProducts(query) });

export const productQuery = (slug: string) =>
  queryOptions({ queryKey: catalogKeys.product(slug), queryFn: () => getProduct(slug) });

export const featuredProductsQuery = (limit = 6) =>
  queryOptions({ queryKey: catalogKeys.featured(limit), queryFn: () => getFeaturedProducts(limit) });

export const newProductsQuery = (limit = 3) =>
  queryOptions({ queryKey: catalogKeys.new(limit), queryFn: () => getNewProducts(limit) });

export const categoriesQuery = () =>
  queryOptions({ queryKey: catalogKeys.categories, queryFn: getCategories });

export const categoryProductsQuery = (slug: string) =>
  queryOptions({ queryKey: catalogKeys.categoryProducts(slug), queryFn: () => getProductsByCategory(slug) });

export const relatedProductsQuery = (product: Product, limit = 3) =>
  queryOptions({
    queryKey: catalogKeys.related(product.slug),
    queryFn: () => getRelatedProducts(product, limit),
  });
