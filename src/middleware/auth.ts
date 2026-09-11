import type { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../lib/config.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "./error.js";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const ADMIN_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUPPORT",
  "CONTENT_MANAGER",
  "FINANCE",
  "ANALYST",
];

export function signToken(user: AuthUser) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] },
  );
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authentication required"));
  }
  try {
    const payload = jwt.verify(header.slice(7), config.JWT_SECRET) as {
      sub: string;
      email: string;
      role: UserRole;
    };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return next(new HttpError(401, "Invalid token"));
    req.user = { id: user.id, email: user.email, role: user.role };
    return next();
  } catch {
    return next(new HttpError(401, "Invalid token"));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || !ADMIN_ROLES.includes(req.user.role)) {
    return next(new HttpError(403, "Admin access required"));
  }
  return next();
}
