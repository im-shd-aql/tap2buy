import { Decimal } from "@prisma/client/runtime/library";

export const ONLINE_FEE_RATE = 0.06; // 6%
export const COD_FEE_RATE = 0.08; // 8%
export const COD_BOOKING_FEE_MIN = 200; // LKR 200 minimum
export const COD_BOOKING_FEE_RATE = 0.10; // 10% of subtotal
export const COD_KILL_SWITCH_LIMIT = -2000; // Wallet balance limit
export const COD_UNLOCK_ORDER_COUNT = 10; // Online orders needed to enable COD

export function calculateServiceFee(
  subtotal: number,
  method: "online" | "cod"
): number {
  const rate = method === "online" ? ONLINE_FEE_RATE : COD_FEE_RATE;
  return Math.round(subtotal * rate * 100) / 100;
}

export function calculateBookingFee(subtotal: number): number {
  const percentFee = subtotal * COD_BOOKING_FEE_RATE;
  return Math.max(COD_BOOKING_FEE_MIN, Math.round(percentFee * 100) / 100);
}

export function calculateTotal(subtotal: number, serviceFee: number): number {
  return Math.round((subtotal + serviceFee) * 100) / 100;
}

export function toDecimal(value: number): Decimal {
  return new Decimal(value.toFixed(2));
}
