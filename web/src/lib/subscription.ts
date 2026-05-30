"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./auth";
import { api } from "./api";

type Tier = "starter" | "pro" | "business";

interface TierCard {
  tier: Tier;
  label: string;
  price: number;
  maxProducts: number | null;
  maxOrdersPerMonth: number | null;
  maxAdminAccounts: number;
  showBranding: boolean;
  hasRevenueAnalytics: boolean;
  hasCustomerManagement: boolean;
  isCurrent: boolean;
}

interface UsageMeter {
  current: number;
  limit: number | null;
}

interface SubscriptionData {
  subscription: {
    tier: Tier;
    label: string;
    startedAt: string | null;
    expiresAt: string | null;
  };
  usage: {
    products: UsageMeter;
    orders: UsageMeter;
  };
  tiers: TierCard[];
}

export function useSubscription() {
  const { token } = useAuth();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<SubscriptionData>("/api/stores/me/subscription", { token })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const tier = data?.subscription.tier ?? "starter";

  return {
    data,
    loading,
    tier,
    isStarter: tier === "starter",
    isPro: tier === "pro",
    isBusiness: tier === "business",
    isAtLeast: (required: Tier) => {
      const order: Tier[] = ["starter", "pro", "business"];
      return order.indexOf(tier) >= order.indexOf(required);
    },
  };
}

export function getUsagePercent(meter: UsageMeter): number {
  if (meter.limit === null) return 0;
  return Math.round((meter.current / meter.limit) * 100);
}

export function getUsageColor(percent: number): string {
  if (percent >= 80) return "red";
  if (percent >= 50) return "amber";
  return "green";
}
