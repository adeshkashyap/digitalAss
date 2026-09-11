import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { mappers } from "../utils/mappers.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new HttpError(409, "Email already registered");

    const password = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password,
        preferences: { create: {} },
      },
      include: { preferences: true },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user: mappers.customerUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { preferences: true },
    });
    if (!user) throw new HttpError(404, "User not found");
    res.json(mappers.customerUser(user));
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { preferences: true },
    });
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token, user: mappers.customerUser(user) });
  } catch (err) {
    next(err);
  }
});
