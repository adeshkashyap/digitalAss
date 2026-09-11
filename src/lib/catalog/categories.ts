import type { Category } from "./types";

export const categories: Category[] = [
  {
    slug: "admin-dashboards",
    name: "Admin Dashboards",
    short: "Data-dense control panels",
    description:
      "Charting, tables, permissions and settings shells for internal tools and operator consoles.",
    tint: "indigo",
    preview: "dashboard",
    count: 3,
  },
  {
    slug: "saas",
    name: "SaaS & Web Apps",
    short: "Onboarding to billing",
    description:
      "Marketing site plus app shell: auth, onboarding, workspace, usage metering and billing screens.",
    tint: "violet",
    preview: "analytics",
    count: 2,
  },
  {
    slug: "ecommerce",
    name: "Ecommerce",
    short: "Storefronts that convert",
    description:
      "Catalog, faceted search, product detail, cart and multi-step checkout with cleanly split state.",
    tint: "cyan",
    preview: "ecommerce",
    count: 2,
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    short: "Hotels, resorts, stays",
    description:
      "Room inventory, availability calendars, rate plans and booking flows for hotels and rentals.",
    tint: "amber",
    preview: "hospitality",
    count: 2,
  },
  {
    slug: "restaurant",
    name: "Restaurant",
    short: "Menus and reservations",
    description:
      "Menu builders, reservation widgets, ordering flows and location pages for food businesses.",
    tint: "rose",
    preview: "restaurant",
    count: 1,
  },
  {
    slug: "education",
    name: "Education",
    short: "Schools and academies",
    description:
      "Programme catalogs, admissions journeys, staff directories and event calendars for institutions.",
    tint: "emerald",
    preview: "education",
    count: 1,
  },
  {
    slug: "corporate",
    name: "Corporate",
    short: "Company and B2B sites",
    description:
      "Credible corporate presence: services, case studies, investor pages and careers.",
    tint: "slate",
    preview: "corporate",
    count: 1,
  },
  {
    slug: "portfolio",
    name: "Portfolio",
    short: "Studios and creators",
    description:
      "Editorial project showcases with case-study layouts and considered typography.",
    tint: "violet",
    preview: "portfolio",
    count: 1,
  },
  {
    slug: "landing-pages",
    name: "Landing Pages",
    short: "Launch and campaign pages",
    description:
      "Focused conversion pages with waitlist, changelog and pricing blocks ready to wire up.",
    tint: "cyan",
    preview: "landing",
    count: 1,
  },
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
