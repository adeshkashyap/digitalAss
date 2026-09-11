import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultDeliveryFiles } from "../src/lib/delivery-files.js";
import { catalogProducts } from "./catalog-seed.js";

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
  await prisma.auditLog.deleteMany();
  await prisma.storeSettings.deleteMany();

  for (const c of categories) {
    await prisma.category.create({ data: c });
  }

  for (const p of catalogProducts) {
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        summary: p.summary,
        description: [p.summary],
        categorySlug: p.categorySlug,
        price: p.price,
        salePrice: p.salePrice,
        status: "PUBLISHED",
        featured: p.featured,
        isNew: p.isNew ?? false,
        bestSeller: p.bestSeller ?? false,
        rating: p.rating,
        reviewCount: p.reviewCount,
        sales: p.sales,
        tech: p.tech,
        tags: p.tags,
        features: [{ title: p.name, body: p.summary }],
        included: ["Full TypeScript source", "Documentation", "12 months of updates"],
        requirements: ["Node.js 20+", "React 18 or 19"],
        pages: p.pages,
        version: p.version,
        tint: p.tint,
        preview: p.preview,
        screens: [{ label: "Preview", kind: p.preview }],
        licenseIds: ["PERSONAL", "COMMERCIAL", "AGENCY"],
        releasedAt: new Date(p.releasedAt),
        deliveryFiles: defaultDeliveryFiles(p.slug, p.version),
      },
    });
  }

  const password = await bcrypt.hash("password123", 12);

  const customer = await prisma.user.create({
    data: {
      email: "demo@apnacodex.com",
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
      email: "admin@apnacodex.com",
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
        storeName: "ApnaCodex",
        tagline: "Production-ready templates",
        supportEmail: "support@apnacodex.com",
        description: "Premium React templates for real products.",
        currency: "USD",
        taxNote: "Tax calculated at checkout where applicable.",
        brandAccent: "indigo",
        legal: { termsUrl: "/terms", privacyUrl: "/privacy", refundUrl: "/refunds", licenseUrl: "/license" },
        notifications: { orderReceipts: true, productUpdates: true, moderationAlerts: true, weeklyDigest: false },
        integrations: [
          { id: "stripe", name: "Stripe", purpose: "Payments", connected: false, note: "Add API keys in backend .env" },
          { id: "storage", name: "Object storage", purpose: "Downloads", connected: false, note: "Connect S3-compatible storage" },
          { id: "email", name: "Email", purpose: "Transactional mail", connected: false, note: "Connect Resend or SMTP" },
        ],
      },
    },
  });

  const product = await prisma.product.findUnique({ where: { id: "p-react-admin-pro" } });
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
        title: "Welcome to ApnaCodex",
        body: "Your demo account is ready. Explore your purchases and downloads.",
      },
    });
  }

  console.log("Seed complete — 13 products, demo customer + admin");
  console.log("  Customer: demo@apnacodex.com / password123");
  console.log("  Admin:    admin@apnacodex.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
