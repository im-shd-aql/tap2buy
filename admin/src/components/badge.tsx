import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  // Tiers
  starter: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  pro: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  business: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  // Order status
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  shipped: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  delivered: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
  // Payment
  paid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  failed: "bg-red-500/20 text-red-300 border-red-500/30",
  refunded: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  // Payout
  processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  // Payment method
  online: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  cod: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  // Status
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  inactive: "bg-red-500/20 text-red-300 border-red-500/30",
};

interface BadgeProps {
  variant: string;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border",
      variants[variant] || variants.pending,
      className,
    )}>
      {children}
    </span>
  );
}
