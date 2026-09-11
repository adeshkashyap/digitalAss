# DevAssets Design System — MASTER

Source of truth for public UI polish. CSS implementation lives in `src/styles.css`.

## Token Architecture

### Primitive → Semantic → Component

| Layer     | Examples                                                                        |
| --------- | ------------------------------------------------------------------------------- |
| Primitive | oklch color values, `--radius`, font families                                   |
| Semantic  | `--background`, `--foreground`, `--brand`, `--muted-foreground`                 |
| Component | `--shadow-glow` (button hero), `--gradient-brand` (CTA), `--tint` (screenshots) |

## Color Palette

Dark-first marketplace. Brand accent: electric indigo/violet/cyan.

| Token                                       | Purpose                          |
| ------------------------------------------- | -------------------------------- |
| `--background` / `--foreground`             | Page canvas and body text        |
| `--surface` / `--surface-2`                 | Elevated panels, inputs          |
| `--card`                                    | Product cards, modals            |
| `--brand`                                   | Primary CTAs, active nav, badges |
| `--muted-foreground`                        | Secondary copy, labels           |
| `--border` / `--border-strong`              | Dividers, card edges             |
| `--success` / `--warning` / `--destructive` | Status semantics                 |

Product tints: `.tint-indigo` … `.tint-slate` set `--tint` and `--tint-2` for screenshot compositions.

## Typography

| Role          | Family         | Utility                 |
| ------------- | -------------- | ----------------------- |
| Display       | Space Grotesk  | `font-display`          |
| Body          | Inter Tight    | `font-sans` (default)   |
| Mono / labels | JetBrains Mono | `font-mono`, `.eyebrow` |

### Fluid scale (CSS utilities)

| Utility            | Use                 |
| ------------------ | ------------------- |
| `.text-display-xl` | Homepage hero       |
| `.text-display-lg` | Page heroes (h1)    |
| `.text-display-md` | Section titles (h2) |
| `.text-body-lg`    | Lead paragraphs     |

Base body: 16px (`text-base`). Minimum readable: 12px only for badges/metadata.

## Spacing

- Layout container: `.shell` — max 84rem, px 1.25rem (lg: 2rem)
- Section rhythm: `py-16` mobile, `py-20` tablet, `py-24` desktop
- Component gap scale: Tailwind 1–12 (0.25rem increments)

## Motion

| Token           | Value                          |
| --------------- | ------------------------------ |
| `--motion-fast` | 150ms                          |
| `--motion-base` | 250ms                          |
| `--motion-slow` | 400ms                          |
| `--motion-ease` | cubic-bezier(0.22, 1, 0.36, 1) |

Utilities: `.reveal`, `.reveal-stagger-*`, `.card-lift`, `.marquee-track` (paused under `prefers-reduced-motion`).

Animate only `transform` and `opacity` in components.

## Component State Matrix

### Button (`variant`)

| State    | brand / hero                           | subtle             | outline             |
| -------- | -------------------------------------- | ------------------ | ------------------- |
| Default  | brand bg + glow shadow                 | surface-2 + border | surface/60 + border |
| Hover    | brightness-110, hero: -translate-y-0.5 | border-strong      | accent bg           |
| Focus    | ring-2 ring-ring                       | ring-2 ring-ring   | ring-2 ring-ring    |
| Disabled | opacity-50, no pointer                 | opacity-50         | opacity-50          |
| Active   | scale 0.985                            | scale 0.985        | scale 0.985         |

### Product card

| State          | Behavior                    |
| -------------- | --------------------------- |
| Default        | border-border, card bg      |
| Hover (lg+)    | card-lift, screenshot scale |
| Focus-within   | Quick actions visible       |
| Touch (max-lg) | Actions always visible      |

## Accessibility

- WCAG 2.1 AA contrast on text and interactive elements
- Skip link to `#main`
- `aria-current="page"` on active nav
- Icon-only buttons require `aria-label`
- `prefers-reduced-motion: reduce` disables animations
