import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { EmptyState } from "@/components/marketplace/empty-state";
import { ProductGrid } from "@/components/marketplace/product-grid";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/features/catalog/page-hero";
import { getCategories, getCategory, getProductsByCategory } from "@/lib/catalog/service";

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category, products: getProductsByCategory(params.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Category not found — DevAssets" }, { name: "robots", content: "noindex" }],
      };
    }
    const { category, products } = loaderData;
    const title = `${category.name} templates — DevAssets`;
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
  const siblings = getCategories().filter((c) => c.slug !== category.slug);

  return (
    <>
      <PageHero
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Categories", to: "/categories" },
          { label: category.name },
        ]}
        eyebrow={category.short}
        title={`${category.name} templates`}
        description={category.description}
        aside={
          <div className="rounded-lg border border-border bg-surface/60 px-4 py-3">
            <p className="font-display text-2xl font-semibold tracking-tight">{products.length}</p>
            <p className="text-xs text-muted-foreground">
              {products.length === 1 ? "template" : "templates"} available
            </p>
          </div>
        }
      />

      <div className="shell py-12 lg:py-16">
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            title={`No ${category.name.toLowerCase()} templates yet`}
            description="This category is in production. Browse the full marketplace in the meantime — several templates cover adjacent use cases."
            action={
              <Button asChild variant="brand">
                <Link to="/templates">Browse all templates</Link>
              </Button>
            }
          />
        )}

        <div className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-lg font-semibold tracking-tight">Other categories</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {siblings.map((c) => (
              <Link
                key={c.slug}
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                {c.name}
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
