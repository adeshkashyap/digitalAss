import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, HelpCircle, Receipt, RefreshCw } from "lucide-react";

import { FAQAccordion } from "@/components/marketplace/faq-accordion";
import { LicenseCard, LicenseComparison } from "@/components/marketplace/license-cards";
import { SectionHeader } from "@/components/marketplace/section-header";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/features/catalog/page-hero";
import { pricingFaqs } from "@/lib/catalog/content";
import { licenses } from "@/lib/catalog/licenses";

const title = "Licensing & pricing — DevAssets";
const description =
  "Simple one-time licensing for DevAssets templates: Personal, Commercial and Agency. Compare what each license covers, with no subscription.";

export const Route = createFileRoute("/pricing")({
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
  component: PricingPage,
});

const guarantees = [
  {
    Icon: Receipt,
    title: "One-time payment",
    body: "No subscription and no seat renewals. Prices shown are per template and per license tier.",
  },
  {
    Icon: RefreshCw,
    title: "Upgrade any time",
    body: "Move from Personal to Commercial or Agency later and pay only the difference in price.",
  },
  {
    Icon: BadgeCheck,
    title: "14-day refund",
    body: "If a template does not match its description or public demo, we refund it in full.",
  },
];

function PricingPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Pricing" }]}
        eyebrow="Licensing"
        title="Licensing that matches how you work"
        description="Every template is sold once, per license tier. Pick the tier that reflects how the work will be used — learning, one commercial product, or unlimited client delivery."
      />

      <section className="shell py-12 lg:py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {licenses.map((l) => (
            <LicenseCard
              key={l.id}
              license={l}
              action={
                <Button
                  asChild
                  variant={l.popular ? "hero" : "outline"}
                  size="lg"
                  className="w-full"
                >
                  <Link to="/templates">
                    Browse templates <ArrowRight />
                  </Link>
                </Button>
              }
            />
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Multipliers apply to each template's base price. A $89 template is $89 Personal, $160
          Commercial and $285 Agency.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {guarantees.map(({ Icon, title: t, body }) => (
            <div key={t} className="border-t border-border py-6 sm:pr-5">
              <span className="mb-4 grid h-9 w-9 place-items-center rounded-md border border-brand/30 bg-brand/10 text-brand">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-display text-base font-semibold tracking-tight">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface/30 py-16">
        <div className="shell">
          <SectionHeader
            eyebrow="Comparison"
            title="What each license covers"
            description="The short version: you can always ship finished work, and you can never redistribute the source itself."
          />
          <LicenseComparison className="mt-8" />
        </div>
      </section>

      <section className="shell grid gap-12 py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Licensing questions</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            If your situation is not covered here, ask before buying — we answer licensing questions
            within one business day.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/contact">
              <HelpCircle /> Ask about licensing
            </Link>
          </Button>
        </div>
        <FAQAccordion items={pricingFaqs} idPrefix="pricing" />
      </section>
    </>
  );
}
