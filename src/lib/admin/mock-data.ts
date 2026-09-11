/**
 * Seed data for the admin workspace.
 *
 * Everything here is clearly sample data for the pre-backend phase. Product
 * facts are never duplicated: admin records are derived from the centralized
 * catalog, so names, previews, prices and versions live in one place.
 */
import { categories } from "@/lib/catalog/categories";
import { licenses } from "@/lib/catalog/licenses";
import { products } from "@/lib/catalog/products";
import type { LicenseId } from "@/lib/catalog/types";
import type {
  AdminCategory,
  AdminCustomer,
  AdminDownloadEvent,
  AdminOrder,
  AdminOrderStatus,
  AdminProduct,
  AdminReview,
  AdminTag,
  AdminTransaction,
  AdminUser,
  AuditLog,
  Coupon,
  PaymentStatus,
  PermissionRow,
  ProductFileRow,
  ProductStatus,
  ProductVersion,
  StoreSettings,
} from "./types";

/* ------------------------------------------------------- deterministic rng */

/** Stable 0..1 pseudo-random from a string, so demo numbers never jitter. */
function rand(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const pick = <T>(seed: string, list: readonly T[], fallback: T): T =>
  list[Math.floor(rand(seed) * list.length)] ?? fallback;

const int = (seed: string, min: number, max: number) =>
  min + Math.floor(rand(seed) * (max - min + 1));

/** Reference "today" for the demo dataset. */
export const DEMO_NOW = new Date("2026-09-11T12:00:00.000Z");

const daysAgo = (days: number, hour = 10) => {
  const d = new Date(DEMO_NOW);
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, (days * 7) % 60, 0, 0);
  return d.toISOString();
};

const dayOnly = (days: number) => daysAgo(days).slice(0, 10);

/* ------------------------------------------------------------- admin user */

export const mockAdminUser: AdminUser = {
  id: "adm-1",
  name: "Ilias Verhoeven",
  email: "ilias@devassets.io",
  role: "super-admin",
};

export const roleLabels: Record<AdminUser["role"], string> = {
  "super-admin": "Super admin",
  admin: "Admin",
  support: "Support",
  "content-manager": "Content manager",
  finance: "Finance",
  analyst: "Analyst",
};

export const permissionMatrix: PermissionRow[] = [
  {
    resource: "Products & versions",
    levels: {
      "super-admin": "write",
      admin: "write",
      support: "read",
      "content-manager": "write",
      finance: "none",
      analyst: "read",
    },
  },
  {
    resource: "Categories & tags",
    levels: {
      "super-admin": "write",
      admin: "write",
      support: "none",
      "content-manager": "write",
      finance: "none",
      analyst: "read",
    },
  },
  {
    resource: "Orders",
    levels: {
      "super-admin": "write",
      admin: "write",
      support: "write",
      "content-manager": "none",
      finance: "read",
      analyst: "read",
    },
  },
  {
    resource: "Customers",
    levels: {
      "super-admin": "write",
      admin: "write",
      support: "write",
      "content-manager": "none",
      finance: "read",
      analyst: "read",
    },
  },
  {
    resource: "Payments & refunds",
    levels: {
      "super-admin": "write",
      admin: "read",
      support: "read",
      "content-manager": "none",
      finance: "write",
      analyst: "read",
    },
  },
  {
    resource: "Coupons",
    levels: {
      "super-admin": "write",
      admin: "write",
      support: "none",
      "content-manager": "read",
      finance: "write",
      analyst: "read",
    },
  },
  {
    resource: "Reviews & moderation",
    levels: {
      "super-admin": "write",
      admin: "write",
      support: "write",
      "content-manager": "write",
      finance: "none",
      analyst: "read",
    },
  },
  {
    resource: "Reports",
    levels: {
      "super-admin": "write",
      admin: "read",
      support: "none",
      "content-manager": "none",
      finance: "read",
      analyst: "read",
    },
  },
  {
    resource: "Store settings",
    levels: {
      "super-admin": "write",
      admin: "read",
      support: "none",
      "content-manager": "none",
      finance: "none",
      analyst: "none",
    },
  },
  {
    resource: "Audit logs",
    levels: {
      "super-admin": "read",
      admin: "read",
      support: "none",
      "content-manager": "none",
      finance: "read",
      analyst: "none",
    },
  },
];

/* --------------------------------------------------------------- products */

const statusOverrides: Record<string, ProductStatus> = {
  "marketmesh-store": "draft",
  "vaultpay-fintech": "draft",
  "launchpad-landing": "archived",
};

function versionsFor(slug: string, current: string): ProductVersion[] {
  const [major = "1", minor = "0"] = current.split(".");
  const prevMinor = Math.max(0, Number(minor) - 1);
  return [
    {
      version: current,
      releasedAt: dayOnly(int(`${slug}-v0`, 4, 40)),
      changelog: "Refreshed dashboard shells, upgraded dependencies, fixed dark-mode contrast.",
      current: true,
    },
    {
      version: `${major}.${prevMinor}.0`,
      releasedAt: dayOnly(int(`${slug}-v1`, 60, 120)),
      changelog: "Added two page templates and a reusable data table pattern.",
      current: false,
    },
    {
      version: `${major}.0.0`,
      releasedAt: dayOnly(int(`${slug}-v2`, 160, 320)),
      changelog: "Initial public release.",
      current: false,
    },
  ];
}

function filesFor(slug: string, version: string, withAssets: boolean): ProductFileRow[] {
  const rows: ProductFileRow[] = [
    {
      id: `${slug}-src`,
      group: "source",
      name: `${slug}-${version}-source.zip`,
      type: "ZIP",
      size: `${(12 + rand(`${slug}-size`) * 26).toFixed(1)} MB`,
      status: "ready",
    },
    {
      id: `${slug}-docs`,
      group: "docs",
      name: `${slug}-documentation.pdf`,
      type: "PDF",
      size: `${(1 + rand(`${slug}-docsize`) * 3).toFixed(1)} MB`,
      status: "ready",
    },
  ];
  if (withAssets) {
    rows.push({
      id: `${slug}-assets`,
      group: "assets",
      name: `${slug}-design-source.fig`,
      type: "FIG",
      size: `${(6 + rand(`${slug}-fig`) * 12).toFixed(1)} MB`,
      status: rand(`${slug}-figstatus`) > 0.75 ? "pending" : "ready",
    });
  }
  return rows;
}

export const adminProducts: AdminProduct[] = products.map((p) => {
  const status = statusOverrides[p.slug] ?? "published";
  const sales = status === "published" ? p.sales : int(`${p.slug}-draftsales`, 0, 6);
  const downloads = Math.round(sales * (1.7 + rand(`${p.slug}-dl`) * 1.4));
  const revenue = Math.round(sales * (p.salePrice ?? p.price) * 1.35);
  const attention: string[] = [];
  if (p.screens.length < 4) attention.push("Fewer than 4 gallery screenshots");
  if (status === "draft") attention.push("Draft — not visible in the storefront");
  if (rand(`${p.slug}-attn`) > 0.82) attention.push("Latest version has no published changelog");

  const record: AdminProduct = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    summary: p.summary,
    description: p.description,
    categorySlug: p.categorySlug,
    tags: p.tags,
    tech: p.tech,
    price: p.price,
    currency: "USD",
    status,
    featured: p.featured,
    version: p.version,
    updatedAt: p.updatedAt,
    createdAt: p.releasedAt,
    sales,
    downloads,
    revenue,
    rating: p.rating,
    reviewCount: p.reviewCount,
    screenshots: p.screens.length,
    demoUrl: `https://demo.devassets.io/${p.slug}`,
    docsUrl: `https://docs.devassets.io/${p.slug}`,
    requirements: p.requirements,
    included: p.included,
    licenseIds: ["personal", "commercial", "agency"],
    seoTitle: `${p.name} — ${p.tagline}`,
    seoDescription: p.summary,
    preview: p.preview,
    tint: p.tint,
    versions: versionsFor(p.slug, p.version),
    files: filesFor(p.slug, p.version, rand(`${p.slug}-hasfig`) > 0.35),
    attention,
  };
  if (p.salePrice !== undefined) record.salePrice = p.salePrice;
  return record;
});

/* ------------------------------------------------------------- categories */

export const adminCategories: AdminCategory[] = categories.map((c) => ({
  slug: c.slug,
  name: c.name,
  description: c.description,
  productCount: adminProducts.filter((p) => p.categorySlug === c.slug).length,
  status: "active",
  seoTitle: `${c.name} templates — DevAssets`,
  seoDescription: c.description,
}));

export const adminTags: AdminTag[] = Object.entries(
  products.reduce<Record<string, number>>((acc, p) => {
    for (const tag of p.tags) acc[tag] = (acc[tag] ?? 0) + 1;
    return acc;
  }, {}),
)
  .map(([name, usage]) => ({ name, usage }))
  .sort((a, b) => b.usage - a.usage || a.name.localeCompare(b.name));

/* -------------------------------------------------------------- customers */

const customerSeeds: {
  name: string;
  email: string;
  company?: string;
  country: string;
  joined: number;
  status?: "suspended";
}[] = [
  {
    name: "Donia Rahman",
    email: "donia@northlight.studio",
    company: "Northlight Studio",
    country: "Germany",
    joined: 542,
  },
  {
    name: "Marcus Ihejirika",
    email: "marcus@fieldnote.dev",
    company: "Fieldnote",
    country: "United Kingdom",
    joined: 410,
  },
  {
    name: "Sora Takahashi",
    email: "sora@kumo.design",
    company: "Kumo Design",
    country: "Japan",
    joined: 388,
  },
  {
    name: "Elena Vasquez",
    email: "elena@brightpath.io",
    company: "Brightpath",
    country: "Spain",
    joined: 331,
  },
  { name: "Tobias Lind", email: "tobias@lindworks.se", country: "Sweden", joined: 297 },
  {
    name: "Priya Nandakumar",
    email: "priya@corewave.in",
    company: "Corewave",
    country: "India",
    joined: 244,
  },
  {
    name: "Julien Moreau",
    email: "julien@atelier-mv.fr",
    company: "Atelier MV",
    country: "France",
    joined: 198,
  },
  {
    name: "Hannah Okafor",
    email: "hannah@stackroom.co",
    company: "Stackroom",
    country: "Nigeria",
    joined: 151,
  },
  { name: "Diego Ferreira", email: "diego@pampa.dev", country: "Brazil", joined: 96 },
  {
    name: "Nora Haddad",
    email: "nora@cedarloop.com",
    company: "Cedarloop",
    country: "Canada",
    joined: 61,
  },
  {
    name: "Wei Chen",
    email: "wei@paperlane.io",
    company: "Paperlane",
    country: "Singapore",
    joined: 34,
    status: "suspended",
  },
  { name: "Ana Kovač", email: "ana@sonderstudio.si", country: "Slovenia", joined: 12 },
];

export const adminCustomers: AdminCustomer[] = customerSeeds.map((seed, i) => {
  const id = `cus-${(i + 1).toString().padStart(3, "0")}`;
  const customer: AdminCustomer = {
    id,
    name: seed.name,
    email: seed.email,
    country: seed.country,
    joinedAt: dayOnly(seed.joined),
    status: seed.status ?? "active",
    orders: 0,
    spend: 0,
    downloads: int(`${id}-dl`, 2, 28),
    lastActiveAt: daysAgo(int(`${id}-active`, 0, 26), 9),
  };
  if (seed.company) customer.company = seed.company;
  return customer;
});

const customerById = (id: string) => adminCustomers.find((c) => c.id === id);

/* ----------------------------------------------------------------- orders */

const orderStatusMix: AdminOrderStatus[] = [
  "paid",
  "paid",
  "paid",
  "paid",
  "paid",
  "paid",
  "pending",
  "refunded",
  "failed",
  "cancelled",
];

const paymentFor = (status: AdminOrderStatus): PaymentStatus =>
  status === "paid"
    ? "succeeded"
    : status === "pending"
      ? "pending"
      : status === "refunded"
        ? "refunded"
        : "failed";

const couponCodes = ["SHIP2026", "AGENCY15", "LAUNCH20"];

function buildOrder(index: number): AdminOrder {
  const seed = `order-${index}`;
  const customer =
    adminCustomers[int(`${seed}-cus`, 0, adminCustomers.length - 1)] ?? adminCustomers[0]!;
  const status = pick(`${seed}-status`, orderStatusMix, "paid");
  const lineCount = rand(`${seed}-lines`) > 0.72 ? 2 : 1;
  const lines = Array.from({ length: lineCount }).map((_, li) => {
    const product =
      adminProducts.filter((p) => p.status === "published")[
        int(`${seed}-p${li}`, 0, adminProducts.filter((p) => p.status === "published").length - 1)
      ] ?? adminProducts[0]!;
    const license = pick<LicenseId>(
      `${seed}-lic${li}`,
      ["personal", "commercial", "agency"],
      "commercial",
    );
    const multiplier = licenses.find((l) => l.id === license)?.multiplier ?? 1;
    return {
      productId: product.id,
      license,
      version: product.version,
      quantity: 1,
      unitPrice: Math.round((product.salePrice ?? product.price) * multiplier),
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const hasCoupon = rand(`${seed}-coupon`) > 0.74;
  const couponCode = hasCoupon ? pick(`${seed}-code`, couponCodes, "SHIP2026") : undefined;
  const discount = hasCoupon ? Math.round(subtotal * 0.15) : 0;
  const tax = Math.round((subtotal - discount) * 0.19);
  const placedDays = int(`${seed}-day`, 0, 88);
  const placedAt = daysAgo(placedDays, int(`${seed}-hour`, 6, 21));

  const events = [
    {
      at: placedAt,
      label: "Order created",
      detail: "Checkout completed in the storefront (sample record).",
    },
    {
      at: placedAt,
      label: status === "failed" ? "Payment declined" : "Payment recorded",
      detail: "Payment provider is not connected in this phase; status is sample data.",
    },
  ];
  if (status === "paid") {
    events.push({
      at: placedAt,
      label: "Entitlements granted",
      detail: "Licenses and download entitlements issued for each line item.",
    });
  }
  if (status === "refunded") {
    events.push({
      at: daysAgo(Math.max(0, placedDays - 3), 14),
      label: "Refund recorded",
      detail: "Refund logged manually. No money moved — payments are not connected.",
    });
  }

  const order: AdminOrder = {
    id: `ord-${2300 + index}`,
    reference: `DA-${2300 + index}`,
    customerId: customer.id,
    placedAt,
    status,
    paymentStatus: paymentFor(status),
    lines,
    subtotal,
    discount,
    tax,
    total: subtotal - discount + tax,
    currency: "USD",
    paymentLabel: "Card payment (provider not connected)",
    invoiceNumber: `INV-2026-${(1200 + index).toString()}`,
    events,
  };
  if (couponCode) order.couponCode = couponCode;
  return order;
}

export const adminOrders: AdminOrder[] = Array.from({ length: 42 }, (_, i) =>
  buildOrder(i + 1),
).sort((a, b) => b.placedAt.localeCompare(a.placedAt));

// Roll order aggregates back onto the customer records.
for (const order of adminOrders) {
  const customer = customerById(order.customerId);
  if (!customer) continue;
  customer.orders += 1;
  if (order.status === "paid") customer.spend += order.total;
}

/* ----------------------------------------------------------- transactions */

export const adminTransactions: AdminTransaction[] = adminOrders.map((order, i) => ({
  id: `txn-${9000 + i}`,
  orderId: order.id,
  customerId: order.customerId,
  amount: order.total,
  currency: "USD",
  provider: rand(`${order.id}-prov`) > 0.9 ? "manual-record" : "stripe-placeholder",
  status: order.paymentStatus,
  at: order.placedAt,
  reference: `pi_demo_${order.reference.replace("-", "").toLowerCase()}`,
}));

/* ---------------------------------------------------------------- coupons */

export const adminCoupons: Coupon[] = [
  {
    id: "cpn-1",
    code: "SHIP2026",
    type: "percent",
    value: 15,
    startsAt: dayOnly(40),
    endsAt: dayOnly(-50),
    usage: 128,
    usageLimit: 500,
    minOrder: 0,
    scope: "All products",
    active: true,
  },
  {
    id: "cpn-2",
    code: "AGENCY15",
    type: "percent",
    value: 15,
    startsAt: dayOnly(90),
    endsAt: dayOnly(-120),
    usage: 46,
    usageLimit: 200,
    minOrder: 299,
    scope: "Agency licenses",
    active: true,
  },
  {
    id: "cpn-3",
    code: "LAUNCH20",
    type: "percent",
    value: 20,
    startsAt: dayOnly(180),
    endsAt: dayOnly(12),
    usage: 200,
    usageLimit: 200,
    minOrder: 0,
    scope: "Landing pages",
    active: false,
  },
  {
    id: "cpn-4",
    code: "DASH40",
    type: "fixed",
    value: 40,
    startsAt: dayOnly(20),
    endsAt: dayOnly(-10),
    usage: 31,
    usageLimit: 150,
    minOrder: 149,
    scope: "Admin dashboards",
    active: true,
  },
  {
    id: "cpn-5",
    code: "STUDIO10",
    type: "percent",
    value: 10,
    startsAt: dayOnly(300),
    endsAt: dayOnly(150),
    usage: 88,
    usageLimit: 100,
    minOrder: 0,
    scope: "All products",
    active: false,
  },
  {
    id: "cpn-6",
    code: "BUNDLE75",
    type: "fixed",
    value: 75,
    startsAt: dayOnly(6),
    endsAt: dayOnly(-80),
    usage: 4,
    usageLimit: 60,
    minOrder: 399,
    scope: "Two or more items",
    active: true,
  },
];

/* ---------------------------------------------------------------- reviews */

const reviewStatuses = [
  "approved",
  "approved",
  "approved",
  "pending",
  "pending",
  "rejected",
] as const;

export const adminReviews: AdminReview[] = products.flatMap((p) =>
  p.reviews.map((r, ri) => {
    const seed = `${p.slug}-${r.id}`;
    const customer =
      adminCustomers[int(`${seed}-cus`, 0, adminCustomers.length - 1)] ?? adminCustomers[0]!;
    return {
      id: `rev-${p.slug}-${ri}`,
      productId: p.id,
      customerId: customer.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      at: daysAgo(int(`${seed}-day`, 1, 70), 15),
      status: pick(`${seed}-status`, reviewStatuses, "approved") as AdminReview["status"],
      reported: rand(`${seed}-flag`) > 0.9,
    };
  }),
);

/* -------------------------------------------------------------- downloads */

export const adminDownloads: AdminDownloadEvent[] = Array.from({ length: 48 }, (_, i) => {
  const seed = `dl-${i}`;
  const product = adminProducts[int(`${seed}-p`, 0, adminProducts.length - 1)] ?? adminProducts[0]!;
  const customer =
    adminCustomers[int(`${seed}-c`, 0, adminCustomers.length - 1)] ?? adminCustomers[0]!;
  const file = product.files[int(`${seed}-f`, 0, product.files.length - 1)] ?? product.files[0]!;
  const roll = rand(`${seed}-status`);
  const status: AdminDownloadEvent["status"] =
    roll > 0.94 ? "blocked" : roll > 0.86 ? "review" : "completed";
  const event: AdminDownloadEvent = {
    id: `adl-${7000 + i}`,
    at: daysAgo(int(`${seed}-day`, 0, 30), int(`${seed}-h`, 0, 23)),
    productId: product.id,
    customerId: customer.id,
    fileLabel: file.name,
    fileType: file.type,
    size: file.size,
    version: product.version,
    license: pick<LicenseId>(`${seed}-lic`, ["personal", "commercial", "agency"], "commercial"),
    status,
  };
  if (status === "blocked")
    event.note = "Entitlement check failed for this license (sample record).";
  if (status === "review") event.note = "Unusual download volume from one account in 24h.";
  return event;
}).sort((a, b) => b.at.localeCompare(a.at));

/* --------------------------------------------------------------- settings */

export const defaultStoreSettings: StoreSettings = {
  storeName: "DevAssets",
  tagline: "Production-ready websites. Built to ship.",
  supportEmail: "support@devassets.io",
  description:
    "A curated marketplace for production-grade React templates, dashboards and industry websites, maintained by a small senior team.",
  currency: "USD",
  taxNote: "Prices shown excluding VAT. Tax handling will be configured with the payment provider.",
  brandAccent: "indigo",
  legal: {
    termsUrl: "/pricing",
    privacyUrl: "/about",
    refundUrl: "/contact",
    licenseUrl: "/pricing",
  },
  notifications: {
    orderReceipts: true,
    productUpdates: true,
    moderationAlerts: true,
    weeklyDigest: false,
  },
  integrations: [
    {
      id: "stripe",
      name: "Stripe",
      purpose: "Checkout, payments, refunds and payouts",
      connected: false,
      note: "Not connected. Payment records in this workspace are sample data.",
    },
    {
      id: "storage",
      name: "Private object storage",
      purpose: "Product archives with short-lived signed download URLs",
      connected: false,
      note: "Not connected. Files listed here are metadata only — no artifact is stored.",
    },
    {
      id: "email",
      name: "Transactional email",
      purpose: "Receipts, update notices and support replies",
      connected: false,
      note: "Not connected. No email is sent from this environment.",
    },
    {
      id: "analytics",
      name: "Product analytics",
      purpose: "Traffic, funnel and conversion reporting",
      connected: false,
      note: "Not connected. Reports use generated demo figures.",
    },
    {
      id: "webhooks",
      name: "Outbound webhooks",
      purpose: "Notify internal systems on orders and releases",
      connected: false,
      note: "Not connected. Endpoint configuration arrives with the API phase.",
    },
  ],
};

/* ------------------------------------------------------------- audit logs */

const auditActors: { actor: string; role: AdminUser["role"] }[] = [
  { actor: "Ilias Verhoeven", role: "super-admin" },
  { actor: "Marta Sørensen", role: "content-manager" },
  { actor: "Kenji Alvarez", role: "support" },
  { actor: "Rosa Lindqvist", role: "finance" },
  { actor: "system", role: "admin" },
];

const auditActions = [
  {
    action: "product.published",
    resource: "Product",
    context: "Status changed from draft to published.",
  },
  {
    action: "product.updated",
    resource: "Product",
    context: "Pricing and changelog fields edited.",
  },
  {
    action: "version.created",
    resource: "Product version",
    context: "New version record added with changelog.",
  },
  {
    action: "order.refund_recorded",
    resource: "Order",
    context: "Manual refund note added; provider not connected.",
  },
  { action: "coupon.deactivated", resource: "Coupon", context: "Usage limit reached." },
  { action: "review.approved", resource: "Review", context: "Moderation queue action." },
  { action: "review.rejected", resource: "Review", context: "Off-topic content." },
  {
    action: "customer.suspended",
    resource: "Customer",
    context: "Repeated entitlement failures flagged for review.",
  },
  {
    action: "settings.updated",
    resource: "Store settings",
    context: "Notification preferences saved locally.",
  },
  {
    action: "download.blocked",
    resource: "Download",
    context: "Entitlement check failed for requested license.",
  },
];

export const adminAuditLogs: AuditLog[] = Array.from({ length: 36 }, (_, i) => {
  const seed = `audit-${i}`;
  const who = auditActors[int(`${seed}-a`, 0, auditActors.length - 1)] ?? auditActors[0]!;
  const what = auditActions[int(`${seed}-w`, 0, auditActions.length - 1)] ?? auditActions[0]!;
  const target =
    what.resource === "Product" || what.resource === "Product version"
      ? (adminProducts[int(`${seed}-p`, 0, adminProducts.length - 1)]?.name ?? "Template")
      : what.resource === "Order"
        ? (adminOrders[int(`${seed}-o`, 0, adminOrders.length - 1)]?.reference ?? "DA-2300")
        : what.resource === "Customer"
          ? (adminCustomers[int(`${seed}-c`, 0, adminCustomers.length - 1)]?.name ?? "Customer")
          : what.resource;
  return {
    id: `log-${5000 + i}`,
    at: daysAgo(int(`${seed}-d`, 0, 21), int(`${seed}-h`, 7, 20)),
    actor: who.actor,
    actorRole: who.role,
    action: what.action,
    resource: `${what.resource} · ${target}`,
    status: (rand(`${seed}-s`) > 0.92 ? "failed" : "success") as AuditLog["status"],
    context: what.context,
  };
}).sort((a, b) => b.at.localeCompare(a.at));

/* ---------------------------------------------------------------- helpers */

export const dailySeries = (days: number) =>
  Array.from({ length: days }, (_, i) => {
    const offset = days - 1 - i;
    const date = dayOnly(offset);
    const dayOrders = adminOrders.filter(
      (o) => o.placedAt.slice(0, 10) === date && o.status === "paid",
    );
    const baseline = 380 + rand(`series-${date}`) * 900;
    const revenue = Math.round(dayOrders.reduce((s, o) => s + o.total, 0) + baseline);
    return { date, revenue, orders: dayOrders.length + int(`series-o-${date}`, 1, 4) };
  });

export { dayOnly, daysAgo, int, rand };
