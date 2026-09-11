import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { EmptyState } from "@/components/marketplace/empty-state";
import { ProductGrid } from "@/components/marketplace/product-grid";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/features/catalog/page-hero";
import { categoriesQuery, categoryProductsQuery } from "@/lib/catalog/queries";
import { getCategory } from "@/lib/catalog/service";

export const Route = createFileRoute("/categories/$slug")({
  loader: async ({ params, context }) => {
    const category = await getCategory(params.slug);
    if (!category) throw notFound();
    const products = await context.queryClient.ensureQueryData(categoryProductsQuery(params.slug));
    return { category, products };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Category not found — ApnaCodex" }, { name: "robots", content: "noindex" }],
      };
    }
    const { category, products } = loaderData;
    const title = `${category.name} templates — ApnaCodex`;
    const description = `${products.length} production-ready ${category.name.toLowerCase()} templates. ${category.description}`;
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 158) },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryListing,
});

function CategoryListing() {
  const { category, products } = Route.useLoaderData();
  const { data: allCategories = [] } = useQuery(categoriesQuery());
  const siblings = allCategories.filter((c) => c.slug !== category.slug);

  return (
    <>
      <PageHero
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Categories", to: "/categories" },
          { label: category.name },
        ]}
        eyebrow={category.short}
        title={category.name}
        description={category.description}
      />

      <div className="shell py-12 lg:py-16">
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            title="No templates in this category yet"
            description="Check back soon or browse the full catalog."
            action={
              <Button asChild variant="hero">
                <Link to="/templates">Browse all templates</Link>
              </Button>
            }
          />
        )}

        {siblings.length > 0 && (
          <div className="mt-16 border-t border-border pt-10">
            <h2 className="font-display text-lg font-semibold">Other categories</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {siblings.map((c) => (
                <li key={c.slug}>
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to="/categories/$slug" params={{ slug: c.slug }}>
                      {c.name} <ArrowRight />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
