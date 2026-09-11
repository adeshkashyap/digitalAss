/**
 * Seed data for the customer account area.
 *
 * Everything here is clearly sample data for the pre-backend phase. Product
 * facts are never duplicated — purchases reference the centralized catalog by
 * product id, so titles, previews, prices and versions stay in one place.
 */
import { productBySlug } from "@/lib/catalog/products";
import { licenseById } from "@/lib/catalog/licenses";
import type {
  AccountNotification,
  CustomerUser,
  DownloadEvent,
  DownloadFile,
  LicenseRecord,
  Order,
  Purchase,
  SupportTicket,
} from "./types";
import type { LicenseId } from "@/lib/catalog/types";

const id = (slug: string) => productBySlug(slug)?.id ?? slug;

export const mockUser: CustomerUser = {
  id: "u-donia",
  name: "Donia Rahman",
  email: "donia@northlight.studio",
  company: "Northlight Studio",
  location: "Berlin, Germany",
  timezone: "Europe/Berlin",
  language: "English (US)",
  memberSince: "2025-03-18",
  preferences: {
    productUpdates: true,
    orderReceipts: true,
    downloadAlerts: true,
    marketing: false,
  },
};

interface Seed {
  slug: string;
  license: LicenseId;
  purchasedAt: string;
  ownedVersion: string;
  orderId: string;
  lastDownloadedAt?: string;
  archived?: boolean;
}

const seeds: Seed[] = [
  {
    slug: "react-admin-pro",
    license: "agency",
    purchasedAt: "2026-08-26",
    ownedVersion: "3.4.1",
    orderId: "o-2481",
    lastDownloadedAt: "2026-09-06T09:12:00Z",
  },
  {
    slug: "nexus-saas",
    license: "commercial",
    purchasedAt: "2026-08-26",
    ownedVersion: "2.0.4",
    orderId: "o-2481",
    lastDownloadedAt: "2026-08-27T14:02:00Z",
  },
  {
    slug: "stayora-hotel",
    license: "commercial",
    purchasedAt: "2026-07-19",
    ownedVersion: "1.8.2",
    orderId: "o-2364",
    lastDownloadedAt: "2026-07-19T18:40:00Z",
  },
  {
    slug: "dineflow-restaurant",
    license: "personal",
    purchasedAt: "2026-06-02",
    ownedVersion: "1.3.2",
    orderId: "o-2199",
  },
  {
    slug: "commercex",
    license: "commercial",
    purchasedAt: "2026-05-11",
    ownedVersion: "3.9.0",
    orderId: "o-2087",
    lastDownloadedAt: "2026-06-14T08:25:00Z",
  },
  {
    slug: "educore-school",
    license: "personal",
    purchasedAt: "2025-11-28",
    ownedVersion: "1.9.0",
    orderId: "o-1743",
    lastDownloadedAt: "2025-12-02T11:05:00Z",
    archived: true,
  },
];

export const mockPurchases: Purchase[] = seeds.map((s, i) => {
  const product = productBySlug(s.slug);
  const license = licenseById(s.license);
  const base = product ? (product.salePrice ?? product.price) : 0;
  const purchase: Purchase = {
    id: `pur-${i + 1}`,
    productId: id(s.slug),
    orderId: s.orderId,
    license: s.license,
    purchasedAt: s.purchasedAt,
    ownedVersion: s.ownedVersion,
    pricePaid: Math.round(base * license.multiplier),
  };
  if (s.lastDownloadedAt) purchase.lastDownloadedAt = s.lastDownloadedAt;
  if (s.archived) purchase.archived = true;
  return purchase;
});

const purchaseFor = (slug: string) => mockPurchases.find((p) => p.productId === id(slug))!;

/** Files exposed per purchase. Sizes are representative sample values. */
export function filesFor(
  productSlugOrId: string,
  version: string,
  opts: { assets?: boolean; sizeMb?: number } = {},
): DownloadFile[] {
  const base = productSlugOrId.replace(/^p-/, "");
  const mb = opts.sizeMb ?? 18;
  const files: DownloadFile[] = [
    {
      id: `${base}-source-${version}`,
      kind: "source",
      label: "Source code",
      fileName: `${base}-v${version}-source.zip`,
      fileType: "ZIP",
      size: `${mb.toFixed(1)} MB`,
      version,
    },
    {
      id: `${base}-docs-${version}`,
      kind: "docs",
      label: "Documentation",
      fileName: `${base}-v${version}-docs.pdf`,
      fileType: "PDF",
      size: `${(mb / 6).toFixed(1)} MB`,
      version,
    },
    {
      id: `${base}-changelog-${version}`,
      kind: "changelog",
      label: "Release notes",
      fileName: `${base}-v${version}-changelog.md`,
      fileType: "MD",
      size: "24 KB",
      version,
    },
  ];
  if (opts.assets) {
    files.push({
      id: `${base}-assets-${version}`,
      kind: "assets",
      label: "Design source",
      fileName: `${base}-v${version}-figma.zip`,
      fileType: "ZIP",
      size: `${(mb * 1.4).toFixed(1)} MB`,
      version,
    });
  }
  return files;
}

export const mockOrders: Order[] = [
  {
    id: "o-2481",
    reference: "DA-2026-2481",
    placedAt: "2026-08-26",
    status: "paid",
    lines: [
      {
        productId: id("react-admin-pro"),
        license: "agency",
        quantity: 1,
        unitPrice: purchaseFor("react-admin-pro").pricePaid,
      },
      {
        productId: id("nexus-saas"),
        license: "commercial",
        quantity: 1,
        unitPrice: purchaseFor("nexus-saas").pricePaid,
      },
    ],
    subtotal: purchaseFor("react-admin-pro").pricePaid + purchaseFor("nexus-saas").pricePaid,
    discount: 40,
    discountCode: "LAUNCH10",
    tax: 0,
    total: purchaseFor("react-admin-pro").pricePaid + purchaseFor("nexus-saas").pricePaid - 40,
    paymentMethodLabel: "Card (payment provider not connected)",
    invoiceNumber: "INV-2026-2481",
  },
  {
    id: "o-2364",
    reference: "DA-2026-2364",
    placedAt: "2026-07-19",
    status: "paid",
    lines: [
      {
        productId: id("stayora-hotel"),
        license: "commercial",
        quantity: 1,
        unitPrice: purchaseFor("stayora-hotel").pricePaid,
      },
    ],
    subtotal: purchaseFor("stayora-hotel").pricePaid,
    discount: 0,
    tax: 0,
    total: purchaseFor("stayora-hotel").pricePaid,
    paymentMethodLabel: "Card (payment provider not connected)",
    invoiceNumber: "INV-2026-2364",
  },
  {
    id: "o-2199",
    reference: "DA-2026-2199",
    placedAt: "2026-06-02",
    status: "paid",
    lines: [
      {
        productId: id("dineflow-restaurant"),
        license: "personal",
        quantity: 1,
        unitPrice: purchaseFor("dineflow-restaurant").pricePaid,
      },
    ],
    subtotal: purchaseFor("dineflow-restaurant").pricePaid,
    discount: 0,
    tax: 0,
    total: purchaseFor("dineflow-restaurant").pricePaid,
    paymentMethodLabel: "Card (payment provider not connected)",
    invoiceNumber: "INV-2026-2199",
  },
  {
    id: "o-2087",
    reference: "DA-2026-2087",
    placedAt: "2026-05-11",
    status: "paid",
    lines: [
      {
        productId: id("commercex"),
        license: "commercial",
        quantity: 1,
        unitPrice: purchaseFor("commercex").pricePaid,
      },
    ],
    subtotal: purchaseFor("commercex").pricePaid,
    discount: 0,
    tax: 0,
    total: purchaseFor("commercex").pricePaid,
    paymentMethodLabel: "Card (payment provider not connected)",
    invoiceNumber: "INV-2026-2087",
  },
  {
    id: "o-2506",
    reference: "DA-2026-2506",
    placedAt: "2026-09-08",
    status: "pending",
    lines: [
      {
        productId: id("vaultpay-fintech"),
        license: "commercial",
        quantity: 1,
        unitPrice: 232,
      },
    ],
    subtotal: 232,
    discount: 0,
    tax: 0,
    total: 232,
    paymentMethodLabel: "Awaiting payment confirmation",
    invoiceNumber: "INV-2026-2506",
  },
  {
    id: "o-1965",
    reference: "DA-2026-1965",
    placedAt: "2026-04-02",
    status: "refunded",
    lines: [
      {
        productId: id("launchpad-landing"),
        license: "personal",
        quantity: 1,
        unitPrice: 39,
      },
    ],
    subtotal: 39,
    discount: 0,
    tax: 0,
    total: 39,
    paymentMethodLabel: "Refunded to original method",
    invoiceNumber: "INV-2026-1965",
  },
  {
    id: "o-1743",
    reference: "DA-2025-1743",
    placedAt: "2025-11-28",
    status: "paid",
    lines: [
      {
        productId: id("educore-school"),
        license: "personal",
        quantity: 1,
        unitPrice: purchaseFor("educore-school").pricePaid,
      },
    ],
    subtotal: purchaseFor("educore-school").pricePaid,
    discount: 0,
    tax: 0,
    total: purchaseFor("educore-school").pricePaid,
    paymentMethodLabel: "Card (payment provider not connected)",
    invoiceNumber: "INV-2025-1743",
  },
];

export const mockLicenses: LicenseRecord[] = mockPurchases.map((p, i) => ({
  id: `lic-${i + 1}`,
  reference: `DA-LIC-${2600 + i * 7}-${p.license.slice(0, 3).toUpperCase()}`,
  productId: p.productId,
  orderId: p.orderId,
  type: p.license,
  status: p.archived === true ? "updates-expired" : p.license === "agency" ? "active" : "active",
  purchasedAt: p.purchasedAt,
  updatesUntil:
    p.license === "agency"
      ? "Lifetime"
      : p.license === "commercial"
        ? `${Number(p.purchasedAt.slice(0, 4)) + 1}${p.purchasedAt.slice(4)}`
        : `${p.purchasedAt.slice(0, 4)}-${String(Math.min(12, Number(p.purchasedAt.slice(5, 7)) + 6)).padStart(2, "0")}${p.purchasedAt.slice(7)}`,
  seats: p.license === "agency" ? 10 : p.license === "commercial" ? 3 : 1,
  ownedVersion: p.ownedVersion,
}));

export const mockDownloadHistory: DownloadEvent[] = [
  {
    id: "dl-1",
    at: "2026-09-06T09:12:00Z",
    productId: id("react-admin-pro"),
    version: "3.4.1",
    fileLabel: "Source code",
    status: "completed",
  },
  {
    id: "dl-2",
    at: "2026-09-06T09:11:00Z",
    productId: id("react-admin-pro"),
    version: "3.4.1",
    fileLabel: "Documentation",
    status: "completed",
  },
  {
    id: "dl-3",
    at: "2026-08-27T14:02:00Z",
    productId: id("nexus-saas"),
    version: "2.0.4",
    fileLabel: "Source code",
    status: "completed",
  },
  {
    id: "dl-4",
    at: "2026-07-19T18:40:00Z",
    productId: id("stayora-hotel"),
    version: "1.8.2",
    fileLabel: "Source code",
    status: "completed",
  },
  {
    id: "dl-5",
    at: "2026-06-14T08:25:00Z",
    productId: id("commercex"),
    version: "3.9.0",
    fileLabel: "Design source",
    status: "expired",
  },
];

export const mockNotifications: AccountNotification[] = [
  {
    id: "n-1",
    category: "product-updates",
    title: "React Admin Pro 3.4.1 is available",
    body: "This release adds a command palette, column presets and Tailwind CSS 4 tokens. Your agency license includes it.",
    at: "2026-09-09T07:30:00Z",
    read: false,
    productId: id("react-admin-pro"),
  },
  {
    id: "n-2",
    category: "downloads",
    title: "Nexus SaaS 2.1.0 replaces your downloaded build",
    body: "You own 2.0.4. The newer build is ready in Downloads whenever you want it.",
    at: "2026-09-08T16:10:00Z",
    read: false,
    productId: id("nexus-saas"),
  },
  {
    id: "n-3",
    category: "purchases",
    title: "Order DA-2026-2506 is awaiting payment",
    body: "Payment processing is not connected in this phase, so the order stays pending as sample data.",
    at: "2026-09-08T11:02:00Z",
    read: false,
    orderId: "o-2506",
  },
  {
    id: "n-4",
    category: "account",
    title: "License reference updated",
    body: "Your Stayora Hotel commercial license now shows a formatted reference in the Licenses page.",
    at: "2026-09-02T09:00:00Z",
    read: true,
  },
  {
    id: "n-5",
    category: "purchases",
    title: "Order DA-2026-2481 completed",
    body: "React Admin Pro and Nexus SaaS were added to your library.",
    at: "2026-08-26T13:45:00Z",
    read: true,
    orderId: "o-2481",
  },
  {
    id: "n-6",
    category: "product-updates",
    title: "CommerceX 4.0.0 is a major release",
    body: "Checkout was rebuilt and the storefront moved to server components. Review the release notes before upgrading.",
    at: "2026-08-30T10:15:00Z",
    read: true,
    productId: id("commercex"),
  },
];

export const mockTickets: SupportTicket[] = [
  {
    id: "t-1",
    reference: "SUP-4821",
    category: "license",
    subject: "Agency license seat count for a second studio",
    message:
      "We are onboarding two contractors and want to confirm they are covered by the agency seat allowance.",
    status: "awaiting-reply",
    createdAt: "2026-09-04T08:20:00Z",
  },
  {
    id: "t-2",
    reference: "SUP-4760",
    category: "download",
    subject: "Design source file for CommerceX",
    message: "The Figma archive link expired before I could pull the latest components.",
    productId: id("commercex"),
    status: "resolved",
    createdAt: "2026-06-15T15:05:00Z",
  },
];

export const mockRecentlyViewedSlugs = [
  "orbit-analytics",
  "vaultpay-fintech",
  "harborview-resort",
  "marketmesh-store",
];
