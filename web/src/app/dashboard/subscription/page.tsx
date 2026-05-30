"use client";

import { useSubscription, getUsagePercent, getUsageColor } from "@/lib/subscription";
import {
  Crown,
  Package,
  ShoppingCart,
  Check,
  X,
  ArrowUpRight,
  MessageCircle,
  Eye,
  BarChart3,
  Users,
  UserPlus,
  Sparkles,
  Zap,
} from "lucide-react";

const BAR_COLORS: Record<string, { bg: string; fill: string; text: string }> = {
  green: { bg: "bg-green-100", fill: "bg-green-500", text: "text-green-700" },
  amber: { bg: "bg-amber-100", fill: "bg-amber-500", text: "text-amber-700" },
  red: { bg: "bg-red-100", fill: "bg-red-500", text: "text-red-700" },
};

const TIER_STYLES: Record<string, { accent: string; bg: string; border: string; icon: string; badge: string }> = {
  starter: { accent: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200", icon: "text-gray-500 bg-gray-100", badge: "bg-gray-100 text-gray-600" },
  pro: { accent: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-300", icon: "text-indigo-600 bg-indigo-100", badge: "bg-indigo-100 text-indigo-700" },
  business: { accent: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300", icon: "text-amber-600 bg-amber-100", badge: "bg-amber-100 text-amber-700" },
};

// Feature list with per-tier values
const FEATURES: {
  label: string;
  icon: typeof Package;
  values: Record<string, { text: string; available: boolean }>;
}[] = [
  {
    label: "Products",
    icon: Package,
    values: {
      starter: { text: "Up to 15", available: true },
      pro: { text: "Up to 100", available: true },
      business: { text: "Unlimited", available: true },
    },
  },
  {
    label: "Orders per month",
    icon: ShoppingCart,
    values: {
      starter: { text: "Up to 30", available: true },
      pro: { text: "Up to 500", available: true },
      business: { text: "Unlimited", available: true },
    },
  },
  {
    label: "Analytics",
    icon: Eye,
    values: {
      starter: { text: "Views only", available: true },
      pro: { text: "Full revenue", available: true },
      business: { text: "Full revenue", available: true },
    },
  },
  {
    label: "Revenue & sales data",
    icon: BarChart3,
    values: {
      starter: { text: "No", available: false },
      pro: { text: "Yes", available: true },
      business: { text: "Yes", available: true },
    },
  },
  {
    label: "Customer management",
    icon: Users,
    values: {
      starter: { text: "No", available: false },
      pro: { text: "Yes", available: true },
      business: { text: "Yes", available: true },
    },
  },
  {
    label: "Admin accounts",
    icon: UserPlus,
    values: {
      starter: { text: "1", available: true },
      pro: { text: "3", available: true },
      business: { text: "10+", available: true },
    },
  },
  {
    label: "Remove Tap2Buy branding",
    icon: Sparkles,
    values: {
      starter: { text: "No", available: false },
      pro: { text: "Yes", available: true },
      business: { text: "Yes", available: true },
    },
  },
];

export default function SubscriptionPage() {
  const { data, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">
        Unable to load subscription data.
      </div>
    );
  }

  const { subscription, usage, tiers } = data;
  const currentTier = tiers.find((t) => t.isCurrent)!;

  const productPercent = usage.products.limit !== null
    ? getUsagePercent(usage.products)
    : 0;
  const orderPercent = usage.orders.limit !== null
    ? getUsagePercent(usage.orders)
    : 0;

  const productColor = BAR_COLORS[getUsageColor(productPercent)];
  const orderColor = BAR_COLORS[getUsageColor(orderPercent)];

  const whatsappMessage = encodeURIComponent(
    `Hi! I'd like to upgrade my Tap2Buy store subscription from the ${subscription.label} plan. Please assist me with the process.`
  );
  const whatsappLink = `https://wa.me/94766489119?text=${whatsappMessage}`;

  const style = TIER_STYLES[subscription.tier];

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-gray-900">Subscription</h1>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
          {subscription.label}
        </span>
      </div>

      {/* ===== CURRENT PLAN CARD ===== */}
      <div className={`rounded-2xl border-2 ${style.border} overflow-hidden mb-5`}>
        <div className={`${style.bg} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${style.icon}`}>
              <Crown className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Plan</p>
              <p className={`font-bold ${style.accent}`}>{subscription.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {currentTier.price === 0 ? "Free" : `Rs ${currentTier.price.toLocaleString()}`}
            </p>
            {currentTier.price > 0 && (
              <p className="text-[10px] text-gray-400">per month</p>
            )}
          </div>
        </div>

        {/* Usage meters */}
        <div className="p-4 space-y-4 bg-white">
          {/* Products */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-gray-400" />
                Products
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {usage.products.limit !== null
                  ? `${usage.products.current} / ${usage.products.limit}`
                  : `${usage.products.current}`}
              </span>
            </div>
            {usage.products.limit !== null ? (
              <>
                <div className={`h-2.5 ${productColor.bg} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full rounded-full ${productColor.fill} transition-all duration-500`}
                    style={{ width: `${Math.min(productPercent, 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${productPercent >= 80 ? productColor.text : "text-gray-400"}`}>
                  {productPercent >= 100
                    ? "Limit reached — upgrade to add more"
                    : productPercent >= 80
                      ? `Only ${usage.products.limit! - usage.products.current} remaining`
                      : `${usage.products.limit! - usage.products.current} remaining`}
                </p>
              </>
            ) : (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Unlimited
              </p>
            )}
          </div>

          {/* Orders */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-gray-400" />
                Orders this month
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {usage.orders.limit !== null
                  ? `${usage.orders.current} / ${usage.orders.limit}`
                  : `${usage.orders.current}`}
              </span>
            </div>
            {usage.orders.limit !== null ? (
              <>
                <div className={`h-2.5 ${orderColor.bg} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full rounded-full ${orderColor.fill} transition-all duration-500`}
                    style={{ width: `${Math.min(orderPercent, 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${orderPercent >= 80 ? orderColor.text : "text-gray-400"}`}>
                  {orderPercent >= 100
                    ? "Limit reached — new orders will be rejected"
                    : orderPercent >= 80
                      ? `Only ${usage.orders.limit! - usage.orders.current} remaining`
                      : `${usage.orders.limit! - usage.orders.current} remaining`}
                </p>
              </>
            ) : (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Unlimited
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ===== FEATURE COMPARISON ===== */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Compare Plans</h2>

        {/* Tier header row */}
        <div className="bg-white rounded-t-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-4 border-b border-gray-100">
            <div className="p-3" />
            {tiers.map((t) => (
              <div
                key={t.tier}
                className={`p-3 text-center ${t.isCurrent ? "bg-indigo-50" : ""}`}
              >
                <p className={`text-xs font-bold ${t.isCurrent ? "text-indigo-700" : "text-gray-900"}`}>
                  {t.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {t.price === 0 ? "Free" : `Rs ${t.price.toLocaleString()}`}
                </p>
                {t.isCurrent && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-bold rounded-full uppercase tracking-wider">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Feature rows */}
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className={`grid grid-cols-4 ${i < FEATURES.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <div className="p-2.5 pr-1 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-[11px] text-gray-600 leading-tight">{feature.label}</span>
                </div>
                {tiers.map((t) => {
                  const val = feature.values[t.tier];
                  return (
                    <div
                      key={t.tier}
                      className={`p-2.5 flex items-center justify-center ${t.isCurrent ? "bg-indigo-50/50" : ""}`}
                    >
                      {val.available ? (
                        val.text === "Yes" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <span className="text-[11px] font-medium text-gray-800 text-center">{val.text}</span>
                        )
                      ) : (
                        <X className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="bg-white rounded-b-2xl border border-t-0 border-gray-100" />
      </div>

      {/* ===== UPGRADE CTA ===== */}
      {subscription.tier !== "business" && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5" />
            <h3 className="font-bold text-base">Upgrade your plan</h3>
          </div>
          <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
            {subscription.tier === "starter"
              ? "Unlock revenue analytics, customer management, and remove Tap2Buy branding from your store."
              : "Get unlimited products, unlimited orders, and 10+ admin accounts for your growing business."}
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-indigo-700 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform shadow-lg shadow-indigo-700/20"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            Request Upgrade via WhatsApp
            <ArrowUpRight className="w-4 h-4" />
          </a>
          <p className="text-[10px] text-indigo-200 text-center mt-2.5">
            We&apos;ll activate your plan within a few hours
          </p>
        </div>
      )}

      {/* ===== PLAN CARDS (detailed) ===== */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">All Plans</h2>
        {tiers.map((tier) => {
          const ts = TIER_STYLES[tier.tier];
          const isUpgrade = tier.price > currentTier.price;
          return (
            <div
              key={tier.tier}
              className={`bg-white rounded-2xl border-2 overflow-hidden ${
                tier.isCurrent ? ts.border : "border-gray-100"
              }`}
            >
              <div className={`px-4 py-3 flex items-center justify-between ${tier.isCurrent ? ts.bg : ""}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{tier.label}</h3>
                    {tier.isCurrent && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ts.badge}`}>
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {tier.price === 0 ? "Free forever" : `Rs ${tier.price.toLocaleString()}/month`}
                  </p>
                </div>
                {tier.isCurrent && (
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ts.icon}`}>
                    <Crown className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="px-4 py-3 space-y-2 border-t border-gray-50">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">
                    {tier.maxProducts === null ? "Unlimited" : tier.maxProducts} products
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ShoppingCart className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">
                    {tier.maxOrdersPerMonth === null ? "Unlimited" : tier.maxOrdersPerMonth} orders/month
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {tier.hasRevenueAnalytics ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-gray-300" />
                  )}
                  <span className={tier.hasRevenueAnalytics ? "text-gray-600" : "text-gray-400"}>
                    Revenue analytics
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {tier.hasCustomerManagement ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-gray-300" />
                  )}
                  <span className={tier.hasCustomerManagement ? "text-gray-600" : "text-gray-400"}>
                    Customer management
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {!tier.showBranding ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-gray-300" />
                  )}
                  <span className={!tier.showBranding ? "text-gray-600" : "text-gray-400"}>
                    Remove Tap2Buy branding
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <UserPlus className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">
                    {tier.maxAdminAccounts >= 10 ? "10+" : tier.maxAdminAccounts} admin{tier.maxAdminAccounts !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {isUpgrade && (
                <div className="px-4 pb-4">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Upgrade to {tier.label}
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center mt-5">
        To upgrade or downgrade, contact us via WhatsApp. Changes take effect immediately.
      </p>
    </div>
  );
}
