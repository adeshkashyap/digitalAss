/** Compact catalog records aligned with frontend mock IDs for API integration. */
export interface CatalogSeedProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  categorySlug: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  sales: number;
  tech: string[];
  tags: string[];
  pages: number;
  version: string;
  tint: string;
  preview: string;
  featured: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  releasedAt: string;
}

export const catalogProducts: CatalogSeedProduct[] = [
  { id: "p-react-admin-pro", slug: "react-admin-pro", name: "React Admin Pro", tagline: "Operator-grade admin shell with 42 screens", summary: "A dense, keyboard-friendly admin system with role-aware navigation and composable data tables.", categorySlug: "admin-dashboards", price: 89, salePrice: 69, rating: 4.9, reviewCount: 214, sales: 3120, tech: ["React", "TypeScript", "Tailwind CSS", "TanStack Query", "Recharts", "Vite"], tags: ["admin", "data tables", "rbac", "charts", "dark mode"], pages: 42, version: "3.4.1", tint: "indigo", preview: "dashboard", featured: true, bestSeller: true, releasedAt: "2024-11-05" },
  { id: "p-nexus-saas", slug: "nexus-saas", name: "Nexus SaaS", tagline: "Marketing site and product shell in one system", summary: "Everything a SaaS launch needs: marketing surface, onboarding, workspace and billing screens.", categorySlug: "saas", price: 99, rating: 4.8, reviewCount: 167, sales: 2410, tech: ["React", "TypeScript", "Tailwind CSS", "TanStack Router", "Zod"], tags: ["saas", "onboarding", "billing", "marketing", "app shell"], pages: 34, version: "2.1.0", tint: "violet", preview: "analytics", featured: true, isNew: true, releasedAt: "2025-03-19" },
  { id: "p-stayora-hotel", slug: "stayora-hotel", name: "Stayora Hotel", tagline: "Boutique hotel site with a real booking flow", summary: "Room inventory, rate plans, availability calendar and a three-step booking journey.", categorySlug: "hospitality", price: 79, salePrice: 59, rating: 4.7, reviewCount: 132, sales: 1480, tech: ["React", "TypeScript", "Tailwind CSS"], tags: ["hospitality", "booking", "hotel"], pages: 21, version: "1.8.2", tint: "amber", preview: "hospitality", featured: true, releasedAt: "2025-01-12" },
  { id: "p-dineflow-restaurant", slug: "dineflow-restaurant", name: "DineFlow Restaurant", tagline: "Menus, reservations and ordering for food businesses", summary: "Menu builders, reservation widgets and ordering flows with location pages.", categorySlug: "restaurant", price: 69, rating: 4.6, reviewCount: 98, sales: 1120, tech: ["React", "TypeScript", "Tailwind CSS"], tags: ["restaurant", "menu", "reservations"], pages: 17, version: "1.4.0", tint: "rose", preview: "restaurant", featured: false, releasedAt: "2024-09-20" },
  { id: "p-educore-school", slug: "educore-school", name: "EduCore School", tagline: "Admissions, programmes and staff for institutions", summary: "Programme catalogs, admissions journeys, staff directories and event calendars.", categorySlug: "education", price: 74, rating: 4.7, reviewCount: 76, sales: 870, tech: ["React", "TypeScript", "Tailwind CSS"], tags: ["education", "school", "admissions"], pages: 24, version: "2.0.3", tint: "emerald", preview: "education", featured: false, releasedAt: "2024-12-08" },
  { id: "p-commercex", slug: "commercex", name: "CommerceX", tagline: "Storefront, cart and checkout that convert", summary: "Catalog, faceted search, PDP, cart and multi-step checkout with clean state boundaries.", categorySlug: "ecommerce", price: 109, salePrice: 84, rating: 4.8, reviewCount: 189, sales: 1960, tech: ["React", "TypeScript", "Tailwind CSS"], tags: ["ecommerce", "checkout", "catalog"], pages: 29, version: "4.0.0", tint: "cyan", preview: "ecommerce", featured: true, bestSeller: true, releasedAt: "2024-10-15" },
  { id: "p-orbit-analytics", slug: "orbit-analytics", name: "Orbit Analytics", tagline: "Analytics dashboard for product teams", summary: "Dense analytics views with cohort charts, funnels and export-ready tables.", categorySlug: "admin-dashboards", price: 94, rating: 4.7, reviewCount: 112, sales: 1030, tech: ["React", "TypeScript", "Recharts", "Tailwind CSS"], tags: ["analytics", "dashboard", "charts"], pages: 26, version: "1.9.4", tint: "indigo", preview: "analytics", featured: false, releasedAt: "2025-02-28" },
  { id: "p-meridian-corporate", slug: "meridian-corporate", name: "Meridian Corporate", tagline: "Credible corporate presence for B2B", summary: "Services, case studies, investor pages and careers with editorial typography.", categorySlug: "corporate", price: 79, rating: 4.6, reviewCount: 64, sales: 760, tech: ["React", "TypeScript", "Tailwind CSS"], tags: ["corporate", "b2b", "case studies"], pages: 23, version: "2.3.1", tint: "slate", preview: "corporate", featured: false, releasedAt: "2024-08-30" },
  { id: "p-atelier-portfolio", slug: "atelier-portfolio", name: "Atelier Portfolio", tagline: "Editorial project showcases for studios", summary: "Case-study layouts and considered typography for creative studios.", categorySlug: "portfolio", price: 59, salePrice: 44, rating: 4.8, reviewCount: 145, sales: 1340, tech: ["React", "TypeScript", "Tailwind CSS"], tags: ["portfolio", "studio", "case study"], pages: 16, version: "1.6.0", tint: "violet", preview: "portfolio", featured: false, isNew: true, releasedAt: "2025-05-02" },
  { id: "p-launchpad-landing", slug: "launchpad-landing", name: "Launchpad Landing Kit", tagline: "Campaign pages from composable blocks", summary: "Hero, proof, feature, pricing, FAQ and CTA blocks for launch pages.", categorySlug: "landing-pages", price: 49, rating: 4.5, reviewCount: 201, sales: 2280, tech: ["React", "TypeScript", "Tailwind CSS"], tags: ["landing", "marketing", "campaign"], pages: 9, version: "3.1.2", tint: "cyan", preview: "landing", featured: false, releasedAt: "2024-07-14" },
  { id: "p-harborview-resort", slug: "harborview-resort", name: "Harborview Resort", tagline: "Resort site with villas and experiences", summary: "Villa inventory, experience booking and editorial destination storytelling.", categorySlug: "hospitality", price: 89, rating: 4.6, reviewCount: 52, sales: 610, tech: ["React", "TypeScript", "Tailwind CSS"], tags: ["resort", "hospitality", "booking"], pages: 25, version: "1.2.0", tint: "amber", preview: "hospitality", featured: false, isNew: true, releasedAt: "2025-06-18" },
  { id: "p-vaultpay-fintech", slug: "vaultpay-fintech", name: "VaultPay Fintech", tagline: "Payments dashboard for fintech teams", summary: "Ledger views, dispute workflows and compliance-friendly operator consoles.", categorySlug: "saas", price: 129, salePrice: 99, rating: 4.9, reviewCount: 88, sales: 690, tech: ["React", "TypeScript", "Tailwind CSS", "Recharts"], tags: ["fintech", "payments", "dashboard"], pages: 31, version: "2.5.0", tint: "emerald", preview: "dashboard", featured: true, releasedAt: "2025-04-10" },
  { id: "p-marketmesh-store", slug: "marketmesh-store", name: "MarketMesh Store", tagline: "Multi-vendor marketplace storefront", summary: "Vendor profiles, split checkout and operator moderation surfaces.", categorySlug: "ecommerce", price: 119, rating: 4.5, reviewCount: 41, sales: 480, tech: ["React", "TypeScript", "Tailwind CSS"], tags: ["marketplace", "ecommerce", "multi-vendor"], pages: 27, version: "1.1.3", tint: "rose", preview: "ecommerce", featured: false, releasedAt: "2025-07-01" },
];
