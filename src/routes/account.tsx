import { createFileRoute } from "@tanstack/react-router";

import { AccountShell } from "@/features/account/account-shell";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account — DevAssets" },
      {
        name: "description",
        content:
          "Your DevAssets library: purchases, downloads, licenses, orders and support in one place.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Your account — DevAssets" },
      {
        property: "og:description",
        content: "Manage purchased templates, downloads and licenses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountShell,
});
