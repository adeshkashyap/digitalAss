import { Link } from "@tanstack/react-router";
import { Check, Github } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/layout/logo";
import { BrowserMockup } from "@/components/marketplace/browser-mockup";
import { ProductScreenshot } from "@/components/marketplace/product-screenshot";
import { Button } from "@/components/ui/button";

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  points,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  points: string[];
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="grid-backdrop pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(70%_60%_at_70%_40%,black,transparent)]"
        aria-hidden
      />
      <div className="shell relative grid gap-12 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20 lg:py-20">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <p className="eyebrow mt-8 lg:mt-0">{eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>

          <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-elevated)]">
            {children}
          </div>

          <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
        </div>

        <div className="preview-enter relative hidden min-w-0 lg:block">
          <BrowserMockup url="devassets.io/library" className="shadow-[var(--shadow-lift)]">
            <div className="aspect-[16/10]">
              <ProductScreenshot kind="dashboard" tint="violet" />
            </div>
          </BrowserMockup>
          <ul className="mt-8 grid gap-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                <span className="text-muted-foreground">{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 border-t border-border pt-5 text-xs text-muted-foreground">
            Account access is preview-only in this frontend phase. No details are stored or sent.{" "}
            <Link to="/templates" className="underline underline-offset-4 hover:text-foreground">
              Browse templates
            </Link>{" "}
            instead.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SocialButtons({ action }: { action: string }) {
  return (
    <div className="space-y-2">
      <p className="text-center text-[11px] text-muted-foreground">
        Social sign-in is disabled in this preview — accounts API not connected yet.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {["GitHub", "Google"].map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            disabled
            aria-disabled="true"
            title={`${provider} sign-in arrives with the accounts API`}
            className="text-muted-foreground"
          >
            {provider === "GitHub" && <Github />}
            {action} with {provider}
          </Button>
        ))}
      </div>
    </div>
  );
}
