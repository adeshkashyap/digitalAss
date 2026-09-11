import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Play, ShieldCheck } from "lucide-react";

import { BrowserMockup } from "@/components/marketplace/browser-mockup";
import { ProductScreenshot } from "@/components/marketplace/product-screenshot";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "13", label: "Curated releases" },
  { value: "340+", label: "Production screens" },
  { value: "9", label: "Industries covered" },
  { value: "100%", label: "Source included" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="grid-backdrop pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_60%_at_50%_0%,black,transparent)]"
        aria-hidden
      />

      <div className="noise-overlay pointer-events-none absolute inset-0" aria-hidden />
      <div className="shell relative grid gap-12 pb-20 pt-14 lg:min-h-[42rem] lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center lg:gap-12 lg:pb-24 lg:pt-20">
        <div className="reveal min-w-0">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">
              13 curated templates · new releases added monthly
            </span>
          </div>

          <h1 className="mt-7 max-w-2xl font-display text-[2.65rem] font-semibold leading-[1.02] sm:text-5xl lg:text-[4rem]">
            Production-ready websites.
            <span className="block text-gradient">Built to ship.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Premium React and TypeScript templates engineered for real products—not throwaway demos.
            Full source, responsive states and practical documentation included.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/templates">
                Explore templates <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="subtle" size="xl">
              <Link to="/categories">
                <Play /> View featured collection
              </Link>
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-success" aria-hidden />
              Built for developers, agencies &amp; product teams
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan" aria-hidden />
              Inspect every included screen before buying
            </span>
          </div>

          <dl className="mt-10 hidden max-w-xl grid-cols-4 gap-x-6 gap-y-5 border-t border-border pt-8 sm:grid">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-2xl font-semibold tracking-tight">
                    {s.value}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="preview-enter relative min-w-0">
          <div className="relative mx-auto max-w-2xl pb-8 pt-6 lg:max-w-none lg:pb-0">
            <div className="float-slow">
              <BrowserMockup
                url="react-admin-pro.devassets.io"
                className="shadow-[var(--shadow-lift)]"
              >
                <div className="aspect-[16/10]">
                  <ProductScreenshot kind="dashboard" tint="indigo" />
                </div>
              </BrowserMockup>
            </div>

            <div className="float-slower absolute -bottom-7 -left-2 w-[52%] sm:-left-8 sm:-bottom-10">
              <BrowserMockup
                compact
                url="stayora.devassets.io"
                className="shadow-[var(--shadow-lift)]"
              >
                <div className="aspect-[16/11]">
                  <ProductScreenshot kind="hospitality" tint="amber" />
                </div>
              </BrowserMockup>
            </div>

            <div className="float-slow absolute -right-3 -top-8 hidden w-[38%] sm:block sm:-right-6">
              <BrowserMockup
                compact
                url="commercex.devassets.io"
                className="shadow-[var(--shadow-lift)]"
              >
                <div className="aspect-[16/12]">
                  <ProductScreenshot kind="ecommerce" tint="cyan" />
                </div>
              </BrowserMockup>
            </div>

            <div className="float-slower absolute -right-2 bottom-4 hidden w-[34%] lg:block">
              <BrowserMockup
                compact
                url="dineflow.devassets.io"
                className="shadow-[var(--shadow-lift)]"
              >
                <div className="aspect-[16/12]">
                  <ProductScreenshot kind="restaurant" tint="rose" />
                </div>
              </BrowserMockup>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
