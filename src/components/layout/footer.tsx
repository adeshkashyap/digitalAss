import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter, Youtube } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { categories } from "@/lib/catalog/categories";

const columns: { title: string; links: { label: string; to?: string; soon?: boolean }[] }[] = [
  {
    title: "Marketplace",
    links: [
      { label: "All templates", to: "/templates" },
      { label: "Categories", to: "/categories" },
      { label: "New releases", to: "/templates" },
      { label: "Best sellers", to: "/templates" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Careers", soon: true },
      { label: "Become an author", soon: true },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Licensing & pricing", to: "/pricing" },
      { label: "Documentation", soon: true },
      { label: "Changelog", soon: true },
      { label: "Support centre", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "License agreement", soon: true },
      { label: "Terms of service", soon: true },
      { label: "Privacy policy", soon: true },
      { label: "Refund policy", soon: true },
    ],
  },
];

const socials = [
  { label: "GitHub", Icon: Github },
  { label: "X", Icon: Twitter },
  { label: "LinkedIn", Icon: Linkedin },
  { label: "YouTube", Icon: Youtube },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="shell py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Production-ready web assets for developers, agencies and product teams. Every template
              is reviewed against a published quality checklist before release.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ label, Icon }) => (
                <span
                  key={label}
                  title={`${label} — coming soon`}
                  className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="sr-only">{label} (coming soon)</span>
                </span>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/70">
                        {link.label}
                        <span className="rounded border border-border px-1 font-mono text-[9px] uppercase">
                          soon
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-8">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DevAssets. All rights reserved.</p>
          <p className="font-mono">Public marketplace preview · checkout is not connected</p>
        </div>
      </div>
    </footer>
  );
}
