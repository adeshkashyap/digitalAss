import type {
  License,
  LicenseType,
  Order,
  OrderLine,
  Product,
  ProductStatus,
  Purchase,
  Review,
  ReviewStatus,
  User,
  UserPreferences,
} from "@prisma/client";
import { defaultDeliveryFiles, parseDeliveryFiles } from "../lib/delivery-files.js";

type ProductWithReviews = Product & { reviews?: Review[] };

const licenseTypeToId = (t: LicenseType): "personal" | "commercial" | "agency" =>
  t.toLowerCase() as "personal" | "commercial" | "agency";

const licenseIdToType = (id: string): LicenseType => {
  const map: Record<string, LicenseType> = {
    personal: "PERSONAL",
    commercial: "COMMERCIAL",
    agency: "AGENCY",
  };
  const type = map[id];
  if (!type) throw new Error(`Invalid license id: ${id}`);
  return type;
};

const statusToApi = (s: ProductStatus) => s.toLowerCase() as "published" | "draft" | "archived";
const orderStatusToApi = (s: string) => s.toLowerCase();

export const mappers = {
  licenseIdToType,
  licenseTypeToId,

  review(r: Review) {
    return {
      id: r.id,
      author: r.author,
      role: r.role,
      rating: r.rating,
      date: r.createdAt.toISOString().slice(0, 10),
      title: r.title,
      body: r.body,
    };
  },

  product(p: ProductWithReviews, reviews?: Review[]) {
    const desc = Array.isArray(p.description) ? (p.description as string[]) : [];
    const features = Array.isArray(p.features) ? (p.features as { title: string; body: string }[]) : [];
    const screens = Array.isArray(p.screens) ? (p.screens as { label: string; kind: string }[]) : [];
    const reviewList = reviews ?? p.reviews ?? [];
    const approved = reviewList.filter((r) => r.status === "APPROVED");

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      summary: p.summary,
      description: desc,
      categorySlug: p.categorySlug,
      price: p.price,
      salePrice: p.salePrice ?? undefined,
      rating: p.rating,
      reviewCount: p.reviewCount,
      sales: p.sales,
      tech: p.tech,
      tags: p.tags,
      features,
      included: p.included,
      requirements: p.requirements,
      pages: p.pages,
      version: p.version,
      updatedAt: p.updatedAt.toISOString().slice(0, 10),
      releasedAt: p.releasedAt.toISOString().slice(0, 10),
      tint: p.tint,
      preview: p.preview,
      screens,
      featured: p.featured,
      isNew: p.isNew || undefined,
      bestSeller: p.bestSeller || undefined,
      reviews: approved.map((r) => mappers.review(r)),
    };
  },

  category(c: { slug: string; name: string; short: string; description: string; tint: string; preview: string }, count: number) {
    return { ...c, count };
  },

  customerUser(u: User & { preferences: UserPreferences | null }) {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      company: u.company ?? undefined,
      location: u.location ?? undefined,
      timezone: u.timezone,
      language: u.language,
      memberSince: u.createdAt.toISOString().slice(0, 10),
      avatarUrl: u.avatarUrl ?? undefined,
      preferences: {
        productUpdates: u.preferences?.productUpdates ?? true,
        orderReceipts: u.preferences?.orderReceipts ?? true,
        downloadAlerts: u.preferences?.downloadAlerts ?? true,
        marketing: u.preferences?.marketing ?? false,
      },
    };
  },

  orderLine(l: OrderLine & { product?: Product }) {
    return {
      productId: l.productId,
      license: licenseTypeToId(l.license),
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      version: l.product?.version ?? "1.0.0",
    };
  },

  order(o: Order & { lines: (OrderLine & { product?: Product })[] }) {
    const status = orderStatusToApi(o.status);
    const paymentStatus =
      status === "paid"
        ? "succeeded"
        : status === "failed"
          ? "failed"
          : status === "refunded"
            ? "refunded"
            : "pending";

    return {
      id: o.id,
      reference: o.reference,
      placedAt: o.placedAt.toISOString(),
      status,
      paymentStatus,
      lines: o.lines.map(mappers.orderLine),
      subtotal: o.subtotal,
      discount: o.discount,
      discountCode: o.discountCode ?? undefined,
      couponCode: o.discountCode ?? undefined,
      tax: o.tax,
      total: o.total,
      currency: "USD" as const,
      paymentMethodLabel: o.paymentMethodLabel ?? "Card",
      paymentLabel: o.paymentMethodLabel ?? "Card",
      invoiceNumber: o.invoiceNumber ?? `INV-${o.reference}`,
    };
  },

  adminOrder(o: Order & { userId: string; lines: (OrderLine & { product?: Product })[] }) {
    return {
      ...mappers.order(o),
      customerId: o.userId,
      events: [
        {
          at: o.placedAt.toISOString(),
          label: "Order placed",
          detail: orderStatusToApi(o.status),
        },
      ],
    };
  },

  purchase(p: Purchase) {
    return {
      id: p.id,
      productId: p.productId,
      orderId: p.orderId,
      license: licenseTypeToId(p.license),
      purchasedAt: p.purchasedAt.toISOString(),
      ownedVersion: p.ownedVersion,
      pricePaid: p.pricePaid,
      lastDownloadedAt: p.lastDownloadedAt?.toISOString(),
      archived: p.archived || undefined,
    };
  },

  license(l: License) {
    return {
      id: l.id,
      reference: l.reference,
      productId: l.productId,
      orderId: l.orderId,
      type: licenseTypeToId(l.type),
      status: l.status as "active" | "updates-expired" | "refunded",
      purchasedAt: l.purchasedAt.toISOString(),
      updatesUntil: l.updatesUntil.toISOString().slice(0, 10),
      seats: l.seats,
      ownedVersion: l.ownedVersion,
    };
  },

  adminProduct(p: Product) {
    const desc = Array.isArray(p.description) ? (p.description as string[]) : [];
    const deliveryFiles = parseDeliveryFiles(p.deliveryFiles);
    const files =
      deliveryFiles.length > 0
        ? deliveryFiles.map((f) => ({
            id: f.id,
            group: f.group,
            name: f.name,
            type: f.type,
            size: f.size,
            status: f.status,
          }))
        : defaultDeliveryFiles(p.slug, p.version).map((f) => ({
            id: f.id,
            group: f.group,
            name: f.name,
            type: f.type,
            size: f.size,
            status: "missing" as const,
          }));
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      summary: p.summary,
      description: desc,
      categorySlug: p.categorySlug,
      tags: p.tags,
      tech: p.tech,
      price: p.price,
      salePrice: p.salePrice ?? undefined,
      currency: "USD" as const,
      status: statusToApi(p.status),
      featured: p.featured,
      version: p.version,
      updatedAt: p.updatedAt.toISOString().slice(0, 10),
      createdAt: p.createdAt.toISOString().slice(0, 10),
      sales: p.sales,
      downloads: p.downloads,
      revenue: p.revenue,
      rating: p.rating,
      reviewCount: p.reviewCount,
      screenshots: screensCount(p),
      demoUrl: p.demoUrl ?? "",
      docsUrl: p.docsUrl ?? "",
      requirements: p.requirements,
      included: p.included,
      licenseIds: p.licenseIds.map(licenseTypeToId),
      seoTitle: p.seoTitle ?? "",
      seoDescription: p.seoDescription ?? "",
      preview: p.preview,
      tint: p.tint,
      versions: [{ version: p.version, releasedAt: p.releasedAt.toISOString().slice(0, 10), changelog: "Initial release", current: true }],
      files,
      attention: p.status === "DRAFT" ? ["Draft — not visible in catalog"] : [],
    };
  },

  reviewStatus(s: ReviewStatus) {
    return s.toLowerCase() as "pending" | "approved" | "rejected";
  },
};

function screensCount(p: Product) {
  const screens = Array.isArray(p.screens) ? p.screens : [];
  return screens.length;
}
