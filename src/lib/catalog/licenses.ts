import type { License, LicenseId } from "./types";

export const licenses: License[] = [
  {
    id: "personal",
    name: "Personal",
    blurb: "Learning, side projects and internal prototypes that are not sold.",
    multiplier: 1,
    projects: "1 non-commercial project",
    highlights: [
      "Full source code",
      "1 project, single developer",
      "6 months of updates",
      "Community support",
    ],
  },
  {
    id: "commercial",
    name: "Commercial",
    blurb: "One revenue-generating product or client website.",
    multiplier: 1.8,
    projects: "1 commercial project",
    highlights: [
      "Full source code",
      "1 paid or client project",
      "12 months of updates",
      "Priority email support",
      "Figma source where available",
    ],
    popular: true,
  },
  {
    id: "agency",
    name: "Agency / Extended",
    blurb: "Studios and product teams shipping repeatedly from one purchase.",
    multiplier: 3.2,
    projects: "Unlimited client projects",
    highlights: [
      "Full source code",
      "Unlimited end products",
      "Lifetime updates",
      "Named support contact",
      "Figma source where available",
      "Team seats up to 10 developers",
    ],
  },
];

export const licenseById = (id: LicenseId) => licenses.find((l) => l.id === id) ?? licenses[0]!;

export const licenseMatrix: { feature: string; values: Record<LicenseId, string> }[] = [
  {
    feature: "End products",
    values: { personal: "1", commercial: "1", agency: "Unlimited" },
  },
  {
    feature: "Charge end users",
    values: { personal: "No", commercial: "Yes", agency: "Yes" },
  },
  {
    feature: "Client work",
    values: { personal: "No", commercial: "1 client", agency: "Unlimited clients" },
  },
  {
    feature: "Developer seats",
    values: { personal: "1", commercial: "3", agency: "10" },
  },
  {
    feature: "Update window",
    values: { personal: "6 months", commercial: "12 months", agency: "Lifetime" },
  },
  {
    feature: "Support",
    values: { personal: "Community", commercial: "Priority email", agency: "Named contact" },
  },
  {
    feature: "Remove attribution",
    values: { personal: "Yes", commercial: "Yes", agency: "Yes" },
  },
  {
    feature: "Resell or redistribute source",
    values: { personal: "No", commercial: "No", agency: "No" },
  },
];
