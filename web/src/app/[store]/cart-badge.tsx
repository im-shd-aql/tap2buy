"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function CartBadge({
  slug,
  themeColor,
}: {
  slug: string;
  themeColor: string;
}) {
  const { itemCount } = useCart();

  if (itemCount === 0) return null;

  return (
    <Link
      href={`/${slug}/cart`}
      className="relative flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3.5 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors animate-pop"
    >
      <ShoppingCart className="w-4 h-4" />
      <span className="min-w-[1.25rem] text-center">{itemCount}</span>
      {/* Ping dot */}
      <span
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white animate-pulse"
        style={{ backgroundColor: themeColor }}
      />
    </Link>
  );
}
