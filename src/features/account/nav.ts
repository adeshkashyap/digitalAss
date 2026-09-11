import {
  Bell,
  Download,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  Package,
  ReceiptText,
  ScrollText,
  UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AccountNavItem {
  to:
    | "/account"
    | "/account/purchases"
    | "/account/downloads"
    | "/account/wishlist"
    | "/account/orders"
    | "/account/licenses"
    | "/account/profile"
    | "/account/notifications"
    | "/account/support";
  label: string;
  icon: LucideIcon;
  /** Short page description reused by breadcrumbs and page headers. */
  title: string;
}

export interface AccountNavGroup {
  label: string;
  items: AccountNavItem[];
}

export const accountNav: AccountNavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/account", label: "Dashboard", icon: LayoutDashboard, title: "Overview" }],
  },
  {
    label: "Library",
    items: [
      { to: "/account/purchases", label: "Purchases", icon: Package, title: "My purchases" },
      { to: "/account/downloads", label: "Downloads", icon: Download, title: "Downloads" },
      { to: "/account/wishlist", label: "Wishlist", icon: Heart, title: "Wishlist" },
    ],
  },
  {
    label: "Orders",
    items: [
      {
        to: "/account/orders",
        label: "Orders & billing",
        icon: ReceiptText,
        title: "Orders & billing",
      },
      { to: "/account/licenses", label: "Licenses", icon: ScrollText, title: "Licenses" },
    ],
  },
  {
    label: "Personal",
    items: [
      {
        to: "/account/profile",
        label: "Profile & settings",
        icon: UserCog,
        title: "Profile & settings",
      },
      { to: "/account/notifications", label: "Notifications", icon: Bell, title: "Notifications" },
    ],
  },
  {
    label: "Support",
    items: [
      { to: "/account/support", label: "Help & support", icon: LifeBuoy, title: "Help & support" },
    ],
  },
];

export const accountNavItems = accountNav.flatMap((g) => g.items);
