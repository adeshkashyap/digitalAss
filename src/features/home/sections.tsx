import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Check,
  FileCode2,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
} from "lucide-react";

import { BrowserMockup } from "@/components/marketplace/browser-mockup";
import { CategoryCard } from "@/components/marketplace/category-card";
import { FAQAccordion } from "@/components/marketplace/faq-accordion";
import { LicenseCard } from "@/components/marketplace/license-cards";
import { PriceDisplay } from "@/components/marketplace/price-display";
import { ProductGrid } from "@/components/marketplace/product-grid";
import { ProductScreenshot } from "@/components/marketplace/product-screenshot";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { SectionHeader } from "@/components/marketplace/section-header";
import { TechBadge } from "@/components/marketplace/tech-badge";
import { TestimonialCard } from "@/components/marketplace/testimonial-card";
import { Button } from "@/components/ui/button";
import { homeFaqs, principles, techStrip, testimonials } from "@/lib/catalog/content";
import { licenses } from "@/lib/catalog/licenses";
import { categoriesQuery, categoryProductsQuery, featuredProductsQuery } from "@/lib/catalog/queries";

const icons = [FileCode2, Boxes, MonitorSmartphone, RefreshCw];

export function TechStrip() {
  return (
    <section className="border-b border-border bg-surface/40 py-6" aria-label="Technology stack">
      <div className="shell flex flex-col items-center gap-4 lg:flex-row lg:gap-8">
        <p className="eyebrow shrink-0">Built with</p>
        <div
          className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
          aria-hidden
        >
          <div className="marquee-track flex w-max items-center gap-8">
            {[...techStrip, ...techStrip].map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="whitespace-nowrap font-mono text-sm text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedTemplates() {
  const { data: featured = [] } = useQuery(featuredProductsQuery(6));
  return (
    <section className="shell section-padding">
      <SectionHeader
        eyebrow="Featured"
        title="Templates teams are shipping with"
        description="Hand-picked releases with the deepest screen coverage and the strongest reviews."
        action={
          <Button asChild variant="outline">
            <Link to="/templates">
              All 13 templates <ArrowRight />
            </Link>
          </Button>
        }
      />
      <ProductGrid products={featured} className="mt-10" />
    </section>
  );
}

export function CategoryGrid() {
  const { data: categories = [] } = useQuery(categoriesQuery());
  return (
    <section className="section-padding border-y border-border bg-surface/30">
      <div className="shell">
        <SectionHeader
          eyebrow="Browse by category"
          title="Nine industries, one design language"
          description="Every category shares the same token system and architecture, so mixing templates across a project still feels deliberate."
          action={
            <Button asChild variant="ghost">
              <Link to="/categories">
                View all categories <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c.slug} category={c} count={c.count} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyDevAssets() {
  return (
    <section className="shell section-padding">
      <SectionHeader
        eyebrow="Why DevAssets"
        title="The parts most templates skip"
        description="We are opinionated about what production-ready means, and we publish the checklist we hold ourselves to."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {principles.map((p, i) => {
          const Icon = icons[i] ?? FileCode2;
          return (
            <div
              key={p.title}
              className="group relative flex flex-col border-t border-border py-6 lg:pr-6"
            >
              <span className="mb-5 grid h-9 w-9 place-items-center rounded-md border border-brand/30 bg-brand/10 text-brand">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-display text-base font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CuratedCollection() {
  const featuredQ = useQuery(featuredProductsQuery(6));
  const hero =
    featuredQ.data?.find((p) => p.slug === "nexus-saas") ?? featuredQ.data?.[0];
  const supportQ = useQuery(categoryProductsQuery("admin-dashboards"));
  const support = (supportQ.data ?? []).slice(0, 2);
  if (!hero) return null;

  return (
    <section className="section-padding border-y border-border bg-surface/30">
      <div className="shell">
        <SectionHeader
          eyebrow="Curated collection"
          title="The SaaS launch stack"
          description="A marketing surface, an app shell and an operator console that share one token file — enough to take a product from landing page to paying customers."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <article className="group overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-hidden border-b border-border p-4 sm:p-6">
              <div className="transition-transform duration-700 group-hover:scale-[1.02]">
                <BrowserMockup url="nexus-saas.devassets.io">
                  <div className="aspect-[16/9]">
                    <ProductScreenshot kind={hero.preview} tint={hero.tint} />
                  </div>
                </BrowserMockup>
              </div>
            </div>
            <div className="grid gap-5 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <p className="eyebrow">Collection lead</p>
                <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
                  {hero.name}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {hero.summary}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <RatingStars rating={hero.rating} count={hero.reviewCount} />
                  <span className="text-xs text-muted-foreground">{hero.pages} screens</span>
                  <div className="flex gap-1.5">
                    {hero.tech.slice(0, 3).map((t) => (
                      <TechBadge key={t} label={t} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                <PriceDisplay price={hero.price} salePrice={hero.salePrice} size="lg" />
                <Button asChild variant="brand">
                  <Link to="/templates/$slug" params={{ slug: hero.slug }}>
                    View template <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {support.map((p) => (
              <Link
                key={p.id}
                to="/templates/$slug"
                params={{ slug: p.slug }}
                className="card-lift group flex flex-col overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="overflow-hidden border-b border-border">
                  <div className="aspect-[16/9] transition-transform duration-700 group-hover:scale-105">
                    <ProductScreenshot kind={p.preview} tint={p.tint} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="eyebrow">Supporting</p>
                  <h3 className="mt-2 truncate font-display text-base font-semibold tracking-tight">
                    {p.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {p.tagline}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <PriceDisplay price={p.price} salePrice={p.salePrice} size="sm" />
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand">
                      Details
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LiveDemoSection() {
  const items = [
    "Every screen is in the demo, including empty and error states",
    "Dark and light themes toggled live",
    "Real keyboard navigation and focus order",
    "Responsive from 320px — resize the demo window",
  ];

  return (
    <section className="shell section-padding">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
        <div className="min-w-0">
          <p className="eyebrow">See it before you buy it</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl lg:text-[2.1rem]">
            Nothing hidden behind the purchase button
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Each listing links to a complete live demo. Click through the flows, break the forms and
            read the empty states before you spend anything.
          </p>
          <ul className="mt-7 space-y-3">
            {items.map((i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                <span className="text-muted-foreground">{i}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="brand">
              <Link to="/templates">
                <MousePointerClick /> Browse live demos
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/pricing">Compare licenses</Link>
            </Button>
          </div>
        </div>

        <div className="relative min-w-0">
          <BrowserMockup
            url="commercex.devassets.io/checkout"
            className="shadow-[var(--shadow-lift)]"
          >
            <div className="aspect-[16/10]">
              <ProductScreenshot kind="ecommerce" tint="cyan" />
            </div>
          </BrowserMockup>
          <div className="absolute -bottom-8 left-6 w-[42%] rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-lift)]">
            <p className="eyebrow">Demo coverage</p>
            <p className="mt-2 font-display text-2xl font-semibold tracking-tight">100%</p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              of purchased screens are visible in the public demo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="section-padding border-y border-border bg-surface/30">
      <div className="shell">
        <SectionHeader
          eyebrow="Preview feedback"
          title="What early reviewers are looking for"
          description="Illustrative feedback used to demonstrate the future review experience. Verified buyer reviews will replace it after launch."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingTeaser() {
  return (
    <section className="shell section-padding">
      <SectionHeader
        eyebrow="Licensing"
        title="One purchase, no subscription"
        description="Pick the license that matches how the work will be used. Upgrade later and pay only the difference."
        align="center"
      />
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {licenses.map((l) => (
          <LicenseCard
            key={l.id}
            license={l}
            action={
              <Button asChild variant={l.popular ? "hero" : "outline"} className="w-full">
                <Link to="/pricing">See what's covered</Link>
              </Button>
            }
          />
        ))}
      </div>
    </section>
  );
}

export function HomeFaq() {
  return (
    <section className="section-padding border-y border-border bg-surface/30">
      <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Questions before you buy</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Still unsure? Support replies to pre-sales questions within one business day.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/contact">Contact support</Link>
          </Button>
        </div>
        <FAQAccordion items={homeFaqs} idPrefix="home" />
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="shell section-padding">
      <div className="relative overflow-hidden rounded-lg border border-border bg-card px-6 py-14 text-center sm:px-14">
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="grid-backdrop pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="eyebrow">Start building</p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Skip three months of UI work
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Buy the interface, keep your attention on the product. Full source, real architecture,
            licenses that make sense for client work.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/templates">
                Explore templates <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/signup">Create an account</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
