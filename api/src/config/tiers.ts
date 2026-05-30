import { SubscriptionTier } from "@prisma/client";

export interface TierLimits {
  maxProducts: number | null; // null = unlimited
  maxOrdersPerMonth: number | null; // null = unlimited
  maxAdminAccounts: number;
  showBranding: boolean;
  hasRevenueAnalytics: boolean;
  hasCustomerManagement: boolean;
  price: number; // monthly price in LKR
  label: string;
}

export const TIER_CONFIG: Record<SubscriptionTier, TierLimits> = {
  starter: {
    maxProducts: 15,
    maxOrdersPerMonth: 30,
    maxAdminAccounts: 1,
    showBranding: true,
    hasRevenueAnalytics: false,
    hasCustomerManagement: false,
    price: 0,
    label: "Starter",
  },
  pro: {
    maxProducts: 100,
    maxOrdersPerMonth: 500,
    maxAdminAccounts: 3,
    showBranding: false,
    hasRevenueAnalytics: true,
    hasCustomerManagement: true,
    price: 3900,
    label: "Pro",
  },
  business: {
    maxProducts: null,
    maxOrdersPerMonth: null,
    maxAdminAccounts: 10,
    showBranding: false,
    hasRevenueAnalytics: true,
    hasCustomerManagement: true,
    price: 9900,
    label: "Business",
  },
};

export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_CONFIG[tier];
}

export const TIER_ORDER: SubscriptionTier[] = ["starter", "pro", "business"];

export function isTierAtLeast(
  current: SubscriptionTier,
  required: SubscriptionTier
): boolean {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(required);
}
