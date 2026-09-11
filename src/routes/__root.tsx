import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider } from "@/features/store/store-provider";
import { ThemeProvider } from "@/features/theme/theme-provider";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative max-w-lg text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          This page shipped without a route
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          The link is broken or the template has moved. Browse the marketplace or search with ⌘K to
          find what you were looking for.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="hero" size="lg">
            <Link to="/templates">Browse templates</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Something broke</p>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          This page didn't load
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          An unexpected error occurred. Try again, or head back to the marketplace.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            variant="brand"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DevAssets — Production-ready web templates" },
      {
        name: "description",
        content:
          "Premium React, SaaS, ecommerce and industry templates engineered for real products.",
      },
      { property: "og:site_name", content: "DevAssets" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#101018" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const themeInitScript = `(function(){try{var t=localStorage.getItem("devassets.theme");var d=t!=="light";document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // The customer account area and the admin back office ship their own sidebar
  // shells, so the marketing header/footer are suppressed there.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ownShell =
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <StoreProvider>
          {ownShell ? (
            <Outlet />
          ) : (
            <div className="flex min-h-screen flex-col">
              <Header />
              <main id="main" className="flex-1">
                {/* Required: nested routes render here. */}
                <Outlet />
              </main>
              <Footer />
            </div>
          )}
          <Toaster position="bottom-right" />
        </StoreProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
