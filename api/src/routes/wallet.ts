import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { requireAuth, requireSeller } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { toDecimal } from "../utils/fees";

const router = Router();

// GET /api/wallet — Get balance
router.get("/", requireAuth, requireSeller, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { sellerId: req.user!.id },
    });

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    res.json({ wallet });
  } catch (error) {
    next(error);
  }
});

// GET /api/wallet/transactions — Transaction history
router.get("/transactions", requireAuth, requireSeller, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { sellerId: req.user!.id },
    });

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.walletTransaction.count({
      where: { walletId: wallet.id },
    });

    res.json({ transactions, total, page, limit });
  } catch (error) {
    next(error);
  }
});

// POST /api/wallet/withdraw — Request payout
router.post("/withdraw", requireAuth, requireSeller, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, bankAccountId } = z
      .object({
        amount: z.number().positive().min(500), // Minimum LKR 500 withdrawal
        bankAccountId: z.string().uuid(),
      })
      .parse(req.body);

    const wallet = await prisma.wallet.findUnique({
      where: { sellerId: req.user!.id },
    });

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    if (Number(wallet.balance) < amount) {
      throw new AppError("Insufficient balance", 400);
    }

    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, sellerId: req.user!.id },
    });

    if (!bankAccount) {
      throw new AppError("Bank account not found", 404);
    }

    // Create payout and debit wallet
    const newBalance = Number(wallet.balance) - amount;

    const [payout] = await prisma.$transaction([
      prisma.payout.create({
        data: {
          sellerId: req.user!.id,
          amount: toDecimal(amount),
          bankAccountId: bankAccount.id,
        },
      }),
      prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: toDecimal(newBalance),
          totalWithdrawn: {
            increment: amount,
          },
        },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "withdrawal",
          amount: toDecimal(amount),
          description: `Withdrawal to ${bankAccount.bankName} - ${bankAccount.accountNumber}`,
          balanceAfter: toDecimal(newBalance),
        },
      }),
    ]);

    res.json({ payout });
  } catch (error) {
    next(error);
  }
});

// Bank account routes (nested under wallet for simplicity)

// GET /api/wallet/bank-accounts
router.get("/bank-accounts", requireAuth, requireSeller, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = await prisma.bankAccount.findMany({
      where: { sellerId: req.user!.id },
    });
    res.json({ accounts });
  } catch (error) {
    next(error);
  }
});

// POST /api/wallet/bank-accounts
router.post("/bank-accounts", requireAuth, requireSeller, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = z
      .object({
        bankName: z.string().min(1),
        branch: z.string().min(1),
        accountNumber: z.string().min(1),
        accountName: z.string().min(1),
        isPrimary: z.boolean().optional(),
      })
      .parse(req.body);

    // If this is primary, unset other primary accounts
    if (data.isPrimary) {
      await prisma.bankAccount.updateMany({
        where: { sellerId: req.user!.id },
        data: { isPrimary: false },
      });
    }

    const account = await prisma.bankAccount.create({
      data: {
        sellerId: req.user!.id,
        ...data,
        isPrimary: data.isPrimary ?? false,
      },
    });

    res.status(201).json({ account });
  } catch (error) {
    next(error);
  }
});

export default router;
