import { prisma } from "../config/database";
import { toDecimal } from "../utils/fees";

export async function creditWallet(
  sellerId: string,
  amount: number,
  description: string,
  referenceId?: string
) {
  const wallet = await prisma.wallet.findUnique({ where: { sellerId } });
  if (!wallet) throw new Error("Wallet not found");

  const newBalance = Number(wallet.balance) + amount;
  const newTotalEarned = Number(wallet.totalEarned) + amount;

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: toDecimal(newBalance),
      totalEarned: toDecimal(newTotalEarned),
      onlineOrderCount: { increment: 1 },
      // Auto-enable COD after 10 online orders
      ...(wallet.onlineOrderCount + 1 >= 10 && !wallet.isCodEnabled
        ? { isCodEnabled: true }
        : {}),
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: "credit",
      amount: toDecimal(amount),
      description,
      referenceId,
      balanceAfter: toDecimal(newBalance),
    },
  });

  return newBalance;
}

export async function debitWallet(
  sellerId: string,
  amount: number,
  description: string,
  referenceId?: string
) {
  const wallet = await prisma.wallet.findUnique({ where: { sellerId } });
  if (!wallet) throw new Error("Wallet not found");

  const newBalance = Number(wallet.balance) - amount;

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: toDecimal(newBalance) },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: "debit",
      amount: toDecimal(amount),
      description,
      referenceId,
      balanceAfter: toDecimal(newBalance),
    },
  });

  return newBalance;
}
