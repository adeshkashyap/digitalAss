import type { AdminUser } from "./types";

export const roleLabels: Record<AdminUser["role"], string> = {
  super_admin: "Super admin",
  admin: "Admin",
  support: "Support",
  content_manager: "Content manager",
  finance: "Finance",
  analyst: "Analyst",
};
