import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/database";
import { AppError } from "./errorHandler";

export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: { id: string; phone: string; role: string }): string {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as any }
  );
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const decoded = jwt.verify(token, env.jwtSecret) as {
      id: string;
      phone: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, phone: true, name: true, role: true },
    });

    if (!user) {
      throw new AppError("User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Invalid token", 401));
    }
  }
}

export function requireSeller(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== "seller") {
    next(new AppError("Seller access required", 403));
    return;
  }
  next();
}
