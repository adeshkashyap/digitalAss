import {
  BadgePercent,
  CreditCard,
  Download,
  FolderTree,
  Gauge,
  KeyRound,
  Package,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminPath =
  | "/admin"
  | "/admin/products"
  | "/admin/products/new"
  | "/admin/categories"
  | "/admin/orders"
  | "/admin/customers"
  | "/admin/payments"
  | "/admin/coupons"
  | "/admin/licenses"
  | "/admin/reviews"
  | "/admin/downloads"
  | "/admin/reports"
  | "/admin/settings"
  | "/admin/audit-logs";

export interface AdminNavItem {
  to: AdminPath;
  label: string;
  icon: LucideIcon;
  /** Page title reused by the top bar and page headers. */
  title: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavGroup[] = [
  {
    label: "Operations",
    items: [{ to: "/admin", label: "Overview", icon: Gauge, title: "Operations overview" }],
  },
  {
    label: "Catalog",
    items: [
      { to: "/admin/products", label: "Products", icon: Package, title: "Products" },
      {
        to: "/admin/categories",
        label: "Categories & tags",
        icon: FolderTree,
        title: "Categories & tags",
      },
      { to: "/admin/reviews", label: "Reviews", icon: Star, title: "Reviews & moderation" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/admin/orders", label: "Orders", icon: Receipt, title: "Orders" },
      {
        to: "/admin/payments",
        label: "Payments",
        icon: CreditCard,
        title: "Payments & transactions",
      },
      { to: "/admin/coupons", label: "Coupons", icon: BadgePercent, title: "Coupons & discounts" },
      { to: "/admin/licenses", label: "Licenses", icon: KeyRound, title: "License administration" },
    ],
  },
  {
    label: "People",
    items: [{ to: "/admin/customers", label: "Customers", icon: Users, title: "Customers" }],
  },
  {
    label: "Delivery",
    items: [
      {
        to: "/admin/downloads",
        label: "Download monitoring",
        icon: Download,
        title: "Download monitoring",
      },
    ],
  },
  {
    label: "Insight",
    items: [
      {
        to: "/admin/reports",
        label: "Sales & reports",
        icon: TrendingUp,
        title: "Sales & reports",
      },
      { to: "/admin/audit-logs", label: "Audit logs", icon: ScrollText, title: "Audit logs" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { to: "/admin/settings", label: "Store settings", icon: Settings, title: "Store settings" },
    ],
  },
];

export const adminNavItems = adminNav.flatMap((g) => g.items);

export const adminSectionIcon = ShieldCheck;
