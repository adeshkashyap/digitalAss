# DevAssets public website refinement

## Goal
Elevate the existing public marketplace into a commercially credible, premium experience while preserving its strongest foundations: dark-first tokens, typed catalog data, working local commerce interactions, layered browser previews, and reusable marketplace components. No dashboard, backend, authentication, or payment integration will be added.

## Build pass

### 1. Refine the shared visual system
- Tighten surface contrast, borders, radii, shadows, typography, section rhythm, focus states, and responsive spacing in the global token system.
- Add a restrained noise/grid treatment and reusable motion utilities with reduced-motion fallbacks.
- Use the existing animation stack rather than adding a new dependency; keep movement subtle and performant.
- Standardize repeated marketplace surfaces and interactive controls, replacing raw buttons with the shared control component where practical.

### 2. Make the homepage the strongest screen
- Recompose the hero for clearer hierarchy, stronger primary action, more credible catalog messaging, and a larger product-preview stage on desktop while ensuring the preview appears within the first mobile viewport flow.
- Improve the layered browser previews so they read as distinct, detailed products rather than generic diagrams.
- Refine the technology strip, featured products, category discovery, quality promise, curated collection, live-demo proof, licensing, FAQ, and final call-to-action for better pacing and fewer repetitive card grids.
- Replace ambiguous pre-launch social proof with clearly labeled sample content or editorial proof, avoiding claims that could read as fabricated.

### 3. Upgrade marketplace discovery
- Strengthen the catalog introduction and results summary.
- Improve category chips, search, sorting, active filters, desktop sidebar, and mobile filter sheet while preserving all current filtering behavior.
- Redesign product cards for consistent preview ratios, clearer price hierarchy, richer metadata, visible quick-view/live-demo actions, and stronger mobile layouts.
- Polish loading, empty, and no-results states.

### 4. Upgrade product detail
- Improve identity and metadata hierarchy, expand the browser-frame gallery, and make mobile thumbnails easier to scan.
- Refine the sticky purchase panel, license selection, price treatment, action hierarchy, trust notes, wishlist, share, and live-demo feedback.
- Improve tabs, feature density, included files, technology requirements, release information, reviews, FAQ, and related products without creating oversized repetitive sections.
- Remove unsafe assumptions in the selected license/screen handling.

### 5. Bring all remaining public pages to the same standard
- Refine Categories, Pricing, About, Contact, Login, Signup, Cart, Checkout, and 404 using the same typography, surfaces, spacing, and interaction patterns.
- Improve auth presentation, cart line-item controls, mobile summaries, checkout form grouping, validation feedback, and explicit payment-not-connected state.
- Keep frontend-only behavior honest and avoid fake success states.

### 6. Credibility and metadata pass
- Tighten marketplace copy and clearly distinguish illustrative testimonials/reviews from verified future content.
- Add useful static legal/support information only where it directly supports marketplace trust; do not imply unavailable services.
- Ensure every content route has unique title, description, Open Graph metadata, `og:type`, and Twitter card metadata; transactional/auth pages remain `noindex`.

## Technical details
- Continue using TanStack Start and TanStack Router; do not introduce React Router DOM.
- Keep catalog data and service boundaries centralized for future Node/Express/PostgreSQL/Prisma replacement.
- Do not add a backend, database, real authentication, payment provider, customer dashboard, or admin dashboard.
- Validate with build diagnostics and focused route tests in desktop, tablet, and mobile viewports, including overflow, console errors, filters, product gallery, cart, forms, and checkout.
