export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  initials: string;
  metric?: string;
}

/** Illustrative testimonials for this pre-launch build. */
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "We evaluated four marketplaces and ApnaCodex was the only one where reading the source made me more confident, not less.",
    author: "Marcus Feld",
    role: "Staff Engineer, logistics platform",
    initials: "MF",
    metric: "Shipped in 3 weeks",
  },
  {
    id: "t2",
    quote:
      "Our agency has delivered eleven client sites on these templates. The agency license paid for itself on the first project.",
    author: "Claire Bennet",
    role: "Founder, six-person studio",
    initials: "CB",
    metric: "11 client launches",
  },
  {
    id: "t3",
    quote:
      "The empty states, error copy and focus styles are all handled. That is the unglamorous work you're really paying for.",
    author: "Elena Duarte",
    role: "Product Designer",
    initials: "ED",
  },
  {
    id: "t4",
    quote:
      "I needed a booking flow that a hotel manager could actually understand. The client approved it in one review round.",
    author: "Ivan Petrov",
    role: "Freelance Developer",
    initials: "IP",
    metric: "1 review round",
  },
  {
    id: "t5",
    quote:
      "Swapping the mock service layer for our Express API took an afternoon. The boundaries were where the docs said they'd be.",
    author: "Priya Raghavan",
    role: "Founding Engineer",
    initials: "PR",
  },
  {
    id: "t6",
    quote:
      "Every chart respects our theme tokens in dark mode. I have not written a single per-chart color override.",
    author: "Lucas Meyer",
    role: "Data Engineer",
    initials: "LM",
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const homeFaqs: Faq[] = [
  {
    q: "What exactly do I get when I buy a template?",
    a: "A zip of the complete TypeScript source: components, routes, styles, mock data layer and documentation. No build obfuscation, no phone-home scripts, no required accounts. Figma source is included where the listing says so.",
  },
  {
    q: "Are these full applications or just the front end?",
    a: "They are production-grade front ends with a clearly isolated service layer and realistic mock data. Every data call goes through one folder, so connecting your own API is a contained change rather than a rewrite.",
  },
  {
    q: "Which license do I need?",
    a: "Personal for learning and non-commercial projects, Commercial for one revenue-generating product or client site, Agency for unlimited client work with team seats. You can upgrade later and pay only the difference.",
  },
  {
    q: "How long do I receive updates?",
    a: "Six months on Personal, twelve months on Commercial and lifetime on Agency. Updates cover dependency bumps, accessibility fixes, new screens and bug fixes, and are delivered as versioned downloads with a changelog.",
  },
  {
    q: "Can I try a template before buying?",
    a: "Yes. Every listing has a full live demo covering all screens, including forms, empty states and dark mode. We deliberately do not hide screens behind the purchase.",
  },
  {
    q: "Do you offer refunds?",
    a: "If a template does not match its description or demo, contact support within 14 days of purchase and we will refund it. Because the files are delivered as source, we cannot refund simple changes of mind.",
  },
];

export const pricingFaqs: Faq[] = [
  {
    q: "Is this a subscription?",
    a: "No. Every purchase is one-time for a specific template and license. There is no recurring charge and nothing stops working if you never buy again.",
  },
  {
    q: "Can I upgrade a license after purchase?",
    a: "Yes. Upgrading from Personal to Commercial or Agency costs the price difference, and your update window extends to the new tier.",
  },
  {
    q: "Can I use one template for multiple client projects?",
    a: "Only with the Agency license, which covers unlimited end products for unlimited clients. Commercial covers a single client project.",
  },
  {
    q: "Can I resell or open-source the code?",
    a: "No license permits redistributing the source itself, whether sold, bundled into another template or published publicly. You may of course ship it as part of a finished website or product.",
  },
  {
    q: "Do you invoice companies?",
    a: "Yes. VAT and company details can be added at checkout and a proper invoice is issued for every purchase.",
  },
];

export const productFaqs: Faq[] = [
  {
    q: "How do I get the files after purchase?",
    a: "Downloads appear in your account immediately after payment as versioned zip archives with signed, expiring links.",
  },
  {
    q: "Is customisation support included?",
    a: "Support covers setup, bugs and clarifying how something works. Bespoke feature development is not included, though we can recommend developers familiar with the codebase.",
  },
  {
    q: "Will this work with my existing project?",
    a: "The templates are standalone React and TypeScript applications. Individual components port cleanly into an existing Tailwind project, but the templates are not distributed as an npm package.",
  },
];

export const techStrip = [
  "React 19",
  "TypeScript",
  "Tailwind CSS 4",
  "Vite",
  "TanStack Query",
  "Radix UI",
  "Recharts",
  "Zod",
];

export const principles = [
  {
    title: "Production-minded UI",
    body: "Loading, empty, error and permission states are designed before the happy path. Nothing looks finished only when the data is perfect.",
  },
  {
    title: "Clean architecture",
    body: "Feature-oriented folders, a single service boundary and typed data models. You can find things, and you can delete things.",
  },
  {
    title: "Responsive by default",
    body: "Every screen is reviewed from 320px to ultrawide, including dense tables, filter panels and multi-step forms.",
  },
  {
    title: "Documentation & updates",
    body: "Written setup and architecture notes per template, versioned releases and a changelog you can actually read.",
  },
];

export const qualityChecklist = [
  "Keyboard navigable with visible focus order",
  "WCAG AA contrast in light and dark themes",
  "Loading, empty, error and permission states designed",
  "No hardcoded colors outside the token file",
  "Responsive review at 320, 768, 1280 and 1920px",
  "Reduced-motion alternative for every animation",
  "TypeScript strict mode with no suppressed errors",
  "Lighthouse performance reviewed on a throttled connection",
  "Dependencies audited and kept to a deliberate minimum",
];

export const workflow = [
  {
    step: "01",
    title: "Scope from real products",
    body: "Every template starts from screens real teams need, not from a moodboard. We list the flows first, then design them.",
  },
  {
    step: "02",
    title: "Design in the token system",
    body: "Typography, spacing and color are defined once. Components are built as variants, never as one-off overrides.",
  },
  {
    step: "03",
    title: "Build for handover",
    body: "Feature folders, typed models and a single service boundary, reviewed by a second engineer before release.",
  },
  {
    step: "04",
    title: "Audit, then publish",
    body: "Accessibility, responsive and performance passes against our checklist. Anything unresolved blocks the release.",
  },
];

export const contactTopics = [
  { value: "presales", label: "Pre-sales question" },
  { value: "licensing", label: "Licensing" },
  { value: "technical", label: "Technical support" },
  { value: "invoice", label: "Invoices & billing" },
  { value: "partnership", label: "Partnership or bulk purchase" },
  { value: "other", label: "Something else" },
];
