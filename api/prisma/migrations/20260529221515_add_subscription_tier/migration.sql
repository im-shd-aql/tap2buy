-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('starter', 'pro', 'business');

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "monthly_order_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "monthly_order_reset_at" TIMESTAMP(3),
ADD COLUMN     "subscription_expires_at" TIMESTAMP(3),
ADD COLUMN     "subscription_started_at" TIMESTAMP(3),
ADD COLUMN     "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'starter';
