import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { CategoryCard } from "@/components/marketplace/category-card";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/features/catalog/page-hero";
import { categoriesQuery } from "@/lib/catalog/queries";

const title = "Template categories — DevAssets";
const description =
  "Explore DevAssets by industry: admin dashboards, SaaS, ecommerce, hospitality, restaurant, education, corporate, portfolio and landing pages.";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories = [] } = useQuery(categoriesQuery());

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Categories" }]}
        eyebrow="Categories"
        title="Nine industries, one design language"
        description="Each category is built on the same token system and architecture, so templates from different industries still feel like one product family."
        aside={
          <Button asChild variant="outline">
            <Link to="/templates">
              Browse all templates <ArrowRight />
            </Link>
          </Button>
        }
      />

      <div className="shell grid gap-5 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:py-16">
        {categories.map((c, i) => (
          <div key={c.slug} className="reveal flex" style={{ animationDelay: `${i * 50}ms` }}>
            <CategoryCard category={c} count={c.count} className="w-full" />
          </div>
        ))}
      </div>
    </>
  );
}
