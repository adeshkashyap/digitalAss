# Roadmap

## Phase 1 — Public website (done)

- [x] Refine shared design system, controls, metadata, and public-site visual consistency
- [x] Recompose and polish the homepage
- [x] Upgrade catalog discovery and product cards
- [x] Upgrade product detail gallery and purchase experience
- [x] Polish categories, pricing, about, contact, auth, cart, checkout, and 404
- [x] Verify build, route behavior, interactions, and desktop/mobile layouts

## Phase 2 — Customer dashboard (done)

- [x] Typed account data layer, mock repository, and `/api/me/*`-shaped service boundary
- [x] Account shell: desktop sidebar, mobile drawer, top bar, user menu, notifications
- [x] Overview, purchases, downloads, wishlist, orders, licenses, profile, notifications, support
- [x] Reusable account components, skeleton/empty/error states, toast feedback
- [x] Public header/mobile nav entry points into the account area
- [x] Typecheck, build, and desktop/tablet/mobile route + interaction QA

## Phase 3 — Admin dashboard (done)

- [x] Typed admin domain, catalog-derived mock data, `/api/admin/*`-shaped service + query layer
- [x] Admin shell: sidebar, mobile drawer, top bar, operator menu, alerts
- [x] Overview, products list, create/edit product, categories & tags
- [x] Orders list + order detail, customers list + customer detail, payments
- [x] Coupons, reviews moderation, license administration, download monitoring
- [x] Reports, store settings, audit logs
- [x] Typecheck, build, and desktop/tablet/mobile route + interaction QA

## Phase 2b — Dashboard UI polish (not started)

- [ ] `/account/*` shell, data tables, and operator workflows
- [ ] `/admin/*` charts, dense tables, and shared AppShell extraction

## Later phases (not started)

- [ ] Real auth, Node/Express + PostgreSQL/Prisma API, Stripe, storage/signed URLs, email
