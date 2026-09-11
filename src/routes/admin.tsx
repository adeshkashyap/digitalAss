import { createFileRoute, redirect } from "@tanstack/react-router";

import { AdminShell } from "@/features/admin/admin-shell";
import { getAuthToken } from "@/lib/api/auth-storage";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (!getAuthToken()) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Back office — ApnaCodex" },
      {
        name: "description",
        content:
          "ApnaCodex marketplace operations: catalog, orders, customers, payouts, moderation and reporting.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Back office — ApnaCodex" },
      {
        property: "og:description",
        content: "Marketplace management workspace for the ApnaCodex catalog.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminShell,
});
