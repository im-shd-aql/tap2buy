import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { sendOtp, verifyOtp } from "../services/otp";
import { signToken, requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { getFirebaseAuth } from "../config/firebase";
import { env } from "../config/env";

const router = Router();

const sendOtpSchema = z.object({
  phone: z.string().regex(/^0\d{9}$/, "Invalid Sri Lankan phone number"),
});

const verifyOtpSchema = z.object({
  phone: z.string(),
  code: z.string().length(6),
  name: z.string().optional(),
});

const verifyFirebaseTokenSchema = z.object({
  idToken: z.string(),
  name: z.string().optional(),
});

const checkPhoneSchema = z.object({
  phone: z.string().regex(/^0\d{9}$/, "Invalid Sri Lankan phone number"),
});

const registerSchema = z.object({
  idToken: z.string(),
  name: z.string().min(1),
});

const signupSchema = z.object({
  idToken: z.string(),
  name: z.string().min(1),
  storeName: z.string().min(1),
  category: z.string().min(1),
  themeColor: z.string().regex(/^#[0-9A-F]{6}$/i),
});

// POST /api/auth/check-phone - Check if phone number has an account
router.post("/check-phone", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = checkPhoneSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { store: true },
    });

    res.json({
      exists: !!user,
      hasStore: !!user?.store,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/send-otp (Legacy - for mock mode)
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

// POST /api/auth/verify-otp (Legacy - for mock mode)
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

// POST /api/auth/verify-firebase (New - Firebase Phone Auth)
router.post("/verify-firebase", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken, name } = verifyFirebaseTokenSchema.parse(req.body);

    // Verify Firebase ID token
    let decodedToken;
    try {
      const auth = getFirebaseAuth();
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error("[Firebase] Token verification failed:", error);
      throw new AppError("Invalid Firebase token", 401);
    }

    // Extract phone number from Firebase token
    const phoneNumber = decodedToken.phone_number;
    if (!phoneNumber) {
      throw new AppError("Phone number not found in token", 400);
    }

    // Convert Firebase phone format (+94...) to local format (0...)
    const phone = phoneNumber.startsWith("+94")
      ? "0" + phoneNumber.slice(3)
      : phoneNumber;

    // Validate phone format
    if (!/^0\d{9}$/.test(phone)) {
      throw new AppError("Invalid Sri Lankan phone number", 400);
    }

    // Find user (don't auto-create on login)
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      throw new AppError("No account found. Please create your store first.", 404);
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

// POST /api/auth/register - Create user + wallet only (no store) for onboarding flow
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken, name } = registerSchema.parse(req.body);

    // Verify Firebase ID token
    let decodedToken;
    try {
      const auth = getFirebaseAuth();
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error("[Firebase] Token verification failed:", error);
      throw new AppError("Invalid Firebase token", 401);
    }

    // Extract phone number from Firebase token
    const phoneNumber = decodedToken.phone_number;
    if (!phoneNumber) {
      throw new AppError("Phone number not found in token", 400);
    }

    // Convert Firebase phone format (+94...) to local format (0...)
    const phone = phoneNumber.startsWith("+94")
      ? "0" + phoneNumber.slice(3)
      : phoneNumber;

    // Validate phone format
    if (!/^0\d{9}$/.test(phone)) {
      throw new AppError("Invalid Sri Lankan phone number", 400);
    }

    // If user already exists, return existing user + token (graceful re-entry)
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      // Create user
      user = await prisma.user.create({
        data: {
          phone,
          name,
          role: "seller",
        },
      });

      // Create wallet for new seller with COD enabled by default
      await prisma.wallet.create({
        data: { sellerId: user.id, isCodEnabled: true },
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

// POST /api/auth/signup - Create new user with Firebase + create store
router.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken, name, storeName, category, themeColor } = signupSchema.parse(req.body);

    // Verify Firebase ID token
    let decodedToken;
    try {
      const auth = getFirebaseAuth();
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error("[Firebase] Token verification failed:", error);
      throw new AppError("Invalid Firebase token", 401);
    }

    // Extract phone number from Firebase token
    const phoneNumber = decodedToken.phone_number;
    if (!phoneNumber) {
      throw new AppError("Phone number not found in token", 400);
    }

    // Convert Firebase phone format (+94...) to local format (0...)
    const phone = phoneNumber.startsWith("+94")
      ? "0" + phoneNumber.slice(3)
      : phoneNumber;

    // Validate phone format
    if (!/^0\d{9}$/.test(phone)) {
      throw new AppError("Invalid Sri Lankan phone number", 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      throw new AppError("Account already exists with this phone number", 400);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        phone,
        name,
        role: "seller",
      },
    });

    // Create wallet for new seller
    await prisma.wallet.create({
      data: { sellerId: user.id },
    });

    // Create store with slug generated from store name
    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await prisma.store.create({
      data: {
        sellerId: user.id,
        name: storeName,
        slug: `${slug}-${user.id.slice(0, 6)}`,
        category,
        themeColor,
      },
    });

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
