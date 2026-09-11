import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { slug: "admin-dashboards", name: "Admin Dashboards", short: "Data-dense control panels", description: "Charting, tables, permissions and settings shells for internal tools and operator consoles.", tint: "indigo", preview: "dashboard" },
  { slug: "saas", name: "SaaS & Web Apps", short: "Onboarding to billing", description: "Marketing site plus app shell: auth, onboarding, workspace, usage metering and billing screens.", tint: "violet", preview: "analytics" },
  { slug: "ecommerce", name: "Ecommerce", short: "Storefronts that convert", description: "Catalog, faceted search, product detail, cart and multi-step checkout with cleanly split state.", tint: "cyan", preview: "ecommerce" },
  { slug: "hospitality", name: "Hospitality", short: "Hotels, resorts, stays", description: "Room inventory, availability calendars, rate plans and booking flows for hotels and rentals.", tint: "amber", preview: "hospitality" },
  { slug: "restaurant", name: "Restaurant", short: "Menus and reservations", description: "Menu builders, reservation widgets, ordering flows and location pages for food businesses.", tint: "rose", preview: "restaurant" },
  { slug: "education", name: "Education", short: "Schools and academies", description: "Programme catalogs, admissions journeys, staff directories and event calendars for institutions.", tint: "emerald", preview: "education" },
  { slug: "corporate", name: "Corporate", short: "Company and B2B sites", description: "Credible corporate presence: services, case studies, investor pages and careers.", tint: "slate", preview: "corporate" },
  { slug: "portfolio", name: "Portfolio", short: "Studios and creators", description: "Editorial project showcases with case-study layouts and considered typography.", tint: "violet", preview: "portfolio" },
  { slug: "landing-pages", name: "Landing Pages", short: "Launch and campaign pages", description: "Focused conversion pages with waitlist, changelog and pricing blocks ready to wire up.", tint: "cyan", preview: "landing" },
];

const products = [
  {
    slug: "react-admin-pro",
    name: "React Admin Pro",
    tagline: "Operator-grade admin shell with 42 screens",
    summary: "A dense, keyboard-friendly admin system with role-aware navigation and composable data tables.",
    description: [
      "React Admin Pro is built the way internal tools actually get used: keyboard first, dense by default, and honest about loading and error states.",
      "State is split into route-level data, feature stores and UI state, so replacing the mock service layer with your own REST endpoints is a single-folder change.",
    ],
    categorySlug: "admin-dashboards",
    price: 89,
    salePrice: 69,
    rating: 4.9,
    reviewCount: 214,
    sales: 3120,
    tech: ["React", "TypeScript", "Tailwind CSS", "TanStack Query", "Recharts", "Vite"],
    tags: ["admin", "data tables", "rbac", "charts", "dark mode"],
    features: [
      { title: "42 production screens", body: "Users, roles, billing, audit log, API keys, notifications and a settings hub." },
      { title: "Table system", body: "One composable data-table primitive drives every list view." },
    ],
    included: ["Full TypeScript source", "42 screens across 9 feature modules", "Figma source file", "12 months of updates"],
    requirements: ["Node.js 20+", "React 18 or 19", "Tailwind CSS 3.4 or 4"],
    pages: 42,
    version: "3.4.1",
    tint: "indigo",
    preview: "dashboard",
    screens: [{ label: "Overview", kind: "dashboard" }, { label: "Analytics", kind: "analytics" }],
    featured: true,
    bestSeller: true,
    isNew: false,
    licenseIds: ["PERSONAL", "COMMERCIAL", "AGENCY"] as const,
    releasedAt: new Date("2024-11-05"),
  },
  {
    slug: "saas-starter-kit",
    name: "SaaS Starter Kit",
    tagline: "From landing page to billing in one codebase",
    summary: "Marketing site, auth, onboarding, workspace shell and Stripe-ready billing screens.",
    description: ["A complete SaaS foundation with workspace switching, usage metering UI and subscription management flows."],
    categorySlug: "saas",
    price: 129,
    rating: 4.8,
    reviewCount: 156,
    sales: 1890,
    tech: ["React", "TypeScript", "Tailwind CSS", "Stripe", "Supabase"],
    tags: ["saas", "billing", "onboarding", "auth"],
    features: [{ title: "Billing-ready", body: "Subscription, usage and invoice screens wired for Stripe." }],
    included: ["Full source", "Auth flows", "Onboarding wizard", "Billing UI"],
    requirements: ["Node.js 20+", "Stripe account"],
    pages: 28,
    version: "2.1.0",
    tint: "violet",
    preview: "analytics",
    screens: [{ label: "Dashboard", kind: "analytics" }],
    featured: true,
    bestSeller: false,
    isNew: true,
    licenseIds: ["PERSONAL", "COMMERCIAL", "AGENCY"] as const,
    releasedAt: new Date("2025-06-12"),
  },
  {
    slug: "commerce-ui-kit",
    name: "Commerce UI Kit",
    tagline: "Storefront, cart and checkout that convert",
    summary: "Catalog, faceted search, PDP, cart and multi-step checkout with clean state boundaries.",
    description: ["Production-grade ecommerce UI patterns with responsive catalog grids and checkout flows."],
    categorySlug: "ecommerce",
    price: 79,
    salePrice: 59,
    rating: 4.7,
    reviewCount: 98,
    sales: 1420,
    tech: ["React", "TypeScript", "Tailwind CSS"],
    tags: ["ecommerce", "checkout", "catalog"],
    features: [{ title: "Full purchase flow", body: "Catalog through confirmation with accessible forms." }],
    included: ["Full source", "Cart state patterns", "Checkout steps"],
    requirements: ["Node.js 20+"],
    pages: 18,
    version: "1.8.2",
    tint: "cyan",
    preview: "ecommerce",
    screens: [{ label: "Storefront", kind: "ecommerce" }],
    featured: false,
    bestSeller: true,
    isNew: false,
    licenseIds: ["PERSONAL", "COMMERCIAL"] as const,
    releasedAt: new Date("2025-01-20"),
  },
];

async function main() {
  await prisma.downloadEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.review.deleteMany();
  await prisma.license.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.user.deleteMany();

  for (const c of categories) {
    await prisma.category.create({ data: c });
  }

  for (const p of products) {
    const { licenseIds, releasedAt, ...rest } = p;
    await prisma.product.create({
      data: {
        ...rest,
        status: "PUBLISHED",
        description: rest.description,
        features: rest.features,
        screens: rest.screens,
        licenseIds: [...licenseIds],
        releasedAt,
        reviews: {
          create: [
            {
              author: "Demo Reviewer",
              role: "Engineering Lead",
              rating: 5,
              title: "Exactly what we needed",
              body: "Clean architecture and thoughtful defaults. Saved weeks of UI work.",
              status: "APPROVED",
            },
          ],
        },
      },
    });
  }

  const password = await bcrypt.hash("password123", 12);

  const customer = await prisma.user.create({
    data: {
      email: "demo@devassets.example",
      name: "Alex Morgan",
      password,
      company: "Northline Studio",
      location: "Austin, TX",
      role: "CUSTOMER",
      preferences: { create: {} },
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@devassets.example",
      name: "Sam Rivera",
      password,
      role: "SUPER_ADMIN",
      preferences: { create: {} },
    },
  });

  await prisma.coupon.create({
    data: { code: "LAUNCH20", label: "Launch discount", percent: 20, active: true, usageLimit: 500 },
  });

  await prisma.storeSettings.create({
    data: {
      id: "default",
      data: {
        storeName: "DevAssets",
        supportEmail: "support@devassets.example",
        currency: "USD",
        taxRate: 0,
        maintenanceMode: false,
      },
    },
  });

  const product = await prisma.product.findFirst({ where: { slug: "react-admin-pro" } });
  if (product) {
    const order = await prisma.order.create({
      data: {
        reference: "ORD-DEMO001",
        userId: customer.id,
        status: "PAID",
        subtotal: 69,
        total: 69,
        paymentMethodLabel: "Card",
        invoiceNumber: "INV-ORD-DEMO001",
        lines: {
          create: [{ productId: product.id, license: "COMMERCIAL", quantity: 1, unitPrice: 69 }],
        },
      },
      include: { lines: true },
    });

    const updatesUntil = new Date();
    updatesUntil.setFullYear(updatesUntil.getFullYear() + 1);

    await prisma.purchase.create({
      data: {
        userId: customer.id,
        productId: product.id,
        orderId: order.id,
        license: "COMMERCIAL",
        pricePaid: 69,
        ownedVersion: product.version,
      },
    });

    await prisma.license.create({
      data: {
        reference: "LIC-DEMO001",
        userId: customer.id,
        productId: product.id,
        orderId: order.id,
        type: "COMMERCIAL",
        updatesUntil,
        ownedVersion: product.version,
      },
    });

    await prisma.notification.create({
      data: {
        userId: customer.id,
        category: "purchases",
        title: "Welcome to DevAssets",
        body: "Your demo account is ready. Explore your purchases and downloads.",
      },
    });
  }

  console.log("Seed complete");
  console.log("  Customer: demo@devassets.example / password123");
  console.log("  Admin:    admin@devassets.example / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
