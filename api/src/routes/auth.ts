import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { sendOtp, verifyOtp } from "../services/otp";
import { signToken, requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

const sendOtpSchema = z.object({
  phone: z.string().regex(/^0\d{9}$/, "Invalid Sri Lankan phone number"),
});

const verifyOtpSchema = z.object({
  phone: z.string(),
  code: z.string().length(6),
  name: z.string().optional(),
});

// POST /api/auth/send-otp
router.post("/send-otp", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = sendOtpSchema.parse(req.body);
    const result = await sendOtp(phone);

    if (!result.success) {
      throw new AppError("Failed to send OTP");
    }

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, code, name } = verifyOtpSchema.parse(req.body);

    const isValid = await verifyOtp(phone, code);
    if (!isValid) {
      throw new AppError("Invalid or expired OTP", 401);
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: name || null,
          role: "seller",
        },
      });

      // Create wallet for new seller
      await prisma.wallet.create({
        data: { sellerId: user.id },
      });
    }

    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;
