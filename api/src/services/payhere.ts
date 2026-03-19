import crypto from "crypto";
import { env } from "../config/env";

interface PayHereCheckoutParams {
  orderId: string;
  amount: number;
  currency?: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone: string;
  description: string;
}

export function generatePayHereHash(
  merchantId: string,
  orderId: string,
  amount: string,
  currency: string,
  merchantSecret: string
): string {
  const hashedSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  const hash = crypto
    .createHash("md5")
    .update(
      merchantId +
        orderId +
        amount +
        currency +
        hashedSecret
    )
    .digest("hex")
    .toUpperCase();

  return hash;
}

export function getCheckoutData(params: PayHereCheckoutParams) {
  const currency = params.currency || "LKR";
  const amountFormatted = params.amount.toFixed(2);

  const hash = generatePayHereHash(
    env.payhereMerchantId,
    params.orderId,
    amountFormatted,
    currency,
    env.payhereMerchantSecret
  );

  return {
    sandbox: env.payhereBaseUrl.includes("sandbox"),
    merchant_id: env.payhereMerchantId,
    return_url: `${env.apiUrl}/api/payments/return`,
    cancel_url: `${env.apiUrl}/api/payments/cancel`,
    notify_url: `${env.apiUrl}/api/payments/notify`,
    order_id: params.orderId,
    items: params.description,
    currency,
    amount: amountFormatted,
    first_name: params.buyerName.split(" ")[0],
    last_name: params.buyerName.split(" ").slice(1).join(" ") || "-",
    email: params.buyerEmail || "buyer@tap2buy.lk",
    phone: params.buyerPhone,
    address: "-",
    city: "-",
    country: "Sri Lanka",
    hash,
  };
}

export function verifyWebhookHash(
  merchantId: string,
  orderId: string,
  paymentAmount: string,
  paymentCurrency: string,
  statusCode: string,
  md5sig: string
): boolean {
  const hashedSecret = crypto
    .createHash("md5")
    .update(env.payhereMerchantSecret)
    .digest("hex")
    .toUpperCase();

  const expectedHash = crypto
    .createHash("md5")
    .update(
      merchantId +
        orderId +
        paymentAmount +
        paymentCurrency +
        statusCode +
        hashedSecret
    )
    .digest("hex")
    .toUpperCase();

  return expectedHash === md5sig.toUpperCase();
}
