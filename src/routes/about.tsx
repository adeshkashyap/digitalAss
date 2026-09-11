import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { BrowserMockup } from "@/components/marketplace/browser-mockup";
import { ProductScreenshot } from "@/components/marketplace/product-screenshot";
import { SectionHeader } from "@/components/marketplace/section-header";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/features/catalog/page-hero";
import { principles, qualityChecklist, workflow } from "@/lib/catalog/content";

const title = "About ApnaCodex — a quality-first template marketplace";
const description =
  "How ApnaCodex builds and reviews templates: production-minded UI, clean architecture, a published quality checklist and versioned updates.";

export const Route = createFileRoute("/about")({
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
  component: AboutPage,
});

const roles = [
  {
    role: "Product design",
    focus: "Typography, spacing systems, interaction detail and dark-mode parity.",
    count: "2 designers",
  },
  {
    role: "Frontend engineering",
    focus: "Architecture, accessibility, performance budgets and code review.",
    count: "3 engineers",
  },
  {
    role: "Review & QA",
    focus: "Checklist audits, responsive passes and release sign-off.",
    count: "1 reviewer",
  },
];

function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
        eyebrow="About ApnaCodex"
        title="Templates that survive contact with real projects"
        description="ApnaCodex exists because most templates are demos: beautiful until you add real data, real permissions and a client who publishes 2,000 words on a services page. We build for that day instead."
      />

      <section className="shell grid gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold sm:text-3xl">Our quality promise</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Every template we publish is scoped from screens real teams need, designed inside a
              token system, and reviewed by a second engineer before it goes on sale. Nothing ships
              with unresolved checklist items.
            </p>
            <p>
              We would rather publish thirteen templates we can defend line by line than a hundred
              variations of the same landing page. The catalog grows slowly and on purpose.
            </p>
            <p>
              When you buy, you get the full TypeScript source with no obfuscation, no telemetry and
              no required account in the code. It is yours to read, extend and delete.
            </p>
          </div>
          <Button asChild variant="brand" className="mt-8">
            <Link to="/templates">
              See the catalog <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="min-w-0">
          <BrowserMockup url="apnacodex.com/review" className="shadow-[var(--shadow-lift)]">
            <div className="aspect-[16/10]">
              <ProductScreenshot kind="analytics" tint="violet" />
            </div>
          </BrowserMockup>
        </div>
      </section>

      <section className="border-y border-border bg-surface/30 py-16">
        <div className="shell">
          <SectionHeader
            eyebrow="Principles"
            title="Four commitments behind every release"
            description="These are the things we refuse to trade away for a faster release."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => (
              <div key={p.title} className="border-t border-border py-6 lg:pr-6">
                <span className="font-mono text-xs text-brand">0{i + 1}</span>
                <h3 className="mt-3 font-display text-base font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-16">
        <SectionHeader
          eyebrow="Workflow"
          title="How a template gets made"
          description="Four stages, roughly six to ten weeks per template depending on screen count."
        />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {workflow.map((w) => (
            <li key={w.step} className="relative rounded-lg border border-border bg-card p-6">
              <span className="font-mono text-xs text-muted-foreground">{w.step}</span>
              <h3 className="mt-3 font-display text-base font-semibold tracking-tight">
                {w.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-surface/30 py-16">
        <div className="shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">Release checklist</p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Nine checks between finished and published
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              We publish the checklist because it is the actual difference between a template and a
              demo. Any unresolved item blocks the release.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {qualityChecklist.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-4 text-sm"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell py-16">
        <SectionHeader
          eyebrow="The team"
          title="A small studio, not a content farm"
          description="Six people work on the catalog. We describe roles rather than names while the marketplace is pre-launch."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {roles.map((r) => (
            <div key={r.role} className="rounded-lg border border-border bg-card p-6">
              <p className="eyebrow">{r.count}</p>
              <h3 className="mt-3 font-display text-base font-semibold tracking-tight">{r.role}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.focus}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="hero" size="lg">
            <Link to="/templates">Browse templates</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/contact">Talk to the team</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
