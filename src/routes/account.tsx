import { createFileRoute, redirect } from "@tanstack/react-router";

import { AccountShell } from "@/features/account/account-shell";
import { getAuthToken } from "@/lib/api/auth-storage";

export const Route = createFileRoute("/account")({
  beforeLoad: () => {
    if (!getAuthToken()) throw redirect({ to: "/login" });
  },
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
