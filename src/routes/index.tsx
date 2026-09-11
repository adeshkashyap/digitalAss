import { createFileRoute } from "@tanstack/react-router";

import { Hero } from "@/features/home/hero";
import {
  CategoryGrid,
  CuratedCollection,
  FeaturedTemplates,
  FinalCta,
  HomeFaq,
  LiveDemoSection,
  PricingTeaser,
  TechStrip,
  Testimonials,
  WhyApnaCodex,
} from "@/features/home/sections";

const title = "ApnaCodex — Production-ready React & business website templates";
const description =
  "Premium React, SaaS, ecommerce, hospitality and corporate templates engineered for real products. Full TypeScript source, designed edge cases and clear licensing.";

export const Route = createFileRoute("/")({
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
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <TechStrip />
      <FeaturedTemplates />
      <CategoryGrid />
      <WhyApnaCodex />
      <CuratedCollection />
      <LiveDemoSection />
      <Testimonials />
      <PricingTeaser />
      <HomeFaq />
      <FinalCta />
    </>
  );
}
