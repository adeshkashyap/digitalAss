import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Home, LifeBuoy } from "lucide-react";

import { Button } from "@/components/ui/button";

const title = "Page not found — ApnaCodex";
const description =
  "That page does not exist. Head back to the ApnaCodex catalog to keep browsing production-ready templates.";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotFoundPage,
});

const links = [
  { to: "/templates", label: "All templates", body: "Thirteen production-ready builds." },
  { to: "/categories", label: "Categories", body: "Browse by industry and use case." },
  { to: "/pricing", label: "Licensing", body: "Personal, Commercial and Agency." },
] as const;

function NotFoundPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="shell relative flex min-h-[70vh] flex-col justify-center py-20">
        <p className="font-mono text-sm text-brand">404</p>
        <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          We couldn't find that page
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          The link may be out of date, or the template you're looking for was renamed. Everything in
          the catalog is one click away below.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="hero" size="lg">
            <Link to="/templates">
              <Compass /> Browse templates
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">
              <Home /> Back home
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link to="/contact">
              <LifeBuoy /> Report a broken link
            </Link>
          </Button>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-border-strong"
            >
              <span className="flex items-center justify-between font-display text-sm font-semibold tracking-tight">
                {l.label}
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
              </span>
              <span className="mt-2 block text-sm text-muted-foreground">{l.body}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
