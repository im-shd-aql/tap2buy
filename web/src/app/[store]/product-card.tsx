"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/toast";

interface Product {
  id: string;
  name: string;
  price: string;
  comparePrice: string | null;
  images: string[];
  stock: number | null;
  badge: string | null;
}

const BADGE_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  new: { bg: "bg-emerald-600/10", text: "text-emerald-700", border: "border border-emerald-600/20", label: "NEW" },
  sale: { bg: "bg-rose-600/10", text: "text-rose-700", border: "border border-rose-600/20", label: "SALE" },
  limited: { bg: "bg-amber-600/10", text: "text-amber-700", border: "border border-amber-600/20", label: "LIMITED" },
  soldout: { bg: "bg-stone-200", text: "text-stone-600", border: "border border-stone-300", label: "SOLD OUT" },
};

export default function ProductCard({
  product,
  storeId,
  storeSlug,
  themeColor,
}: {
  product: Product;
  storeId: string;
  storeSlug: string;
  themeColor: string;
}) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock === 0;
  const badgeKey = isOutOfStock ? "soldout" : product.badge;
  const badgeStyle = badgeKey ? BADGE_STYLES[badgeKey] : null;

  const discount =
    product.comparePrice
      ? Math.round(
          ((Number(product.comparePrice) - Number(product.price)) /
            Number(product.comparePrice)) *
            100
        )
      : 0;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(storeId, {
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0] || "",
    });
    toast(`Added "${product.name}" to cart`, `/${storeSlug}/cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link
      href={`/${storeSlug}/${product.id}`}
      className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/5 hover:ring-black/10 transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="aspect-square bg-stone-50 relative overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">
            No image
          </div>
        )}

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
        )}

        {/* Badge */}
        {badgeStyle && (
          <span
            className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-[0.05em] uppercase ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {badgeStyle.label}
          </span>
        )}

        {/* Discount badge */}
        {discount > 0 && !isOutOfStock && (
          <span className="absolute top-2.5 right-2.5 bg-gradient-to-br from-rose-500 to-rose-600 text-white px-2 py-1 rounded-md text-[11px] font-semibold tracking-[0.05em] shadow-md">
            -{discount}%
          </span>
        )}

        {/* Quick Add — always visible on mobile, hover on desktop */}
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            className={`absolute bottom-2.5 right-2.5 w-11 h-11 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 active:scale-90 border ${
              added ? "bg-emerald-500 text-white scale-110 border-emerald-500" : "bg-white border-black/5 hover:border-black/10"
            }`}
            style={added ? {} : { color: themeColor }}
          >
            {added ? <Check className="w-4.5 h-4.5" strokeWidth={3} /> : <ShoppingCart className="w-4.5 h-4.5" />}
          </button>
        )}
      </div>
      <div className="px-4 py-4">
        <p className="font-medium text-base text-neutral-900 line-clamp-2 leading-relaxed min-h-[3rem]">{product.name}</p>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="font-bold text-lg" style={{ color: themeColor }}>
            LKR {Number(product.price).toLocaleString()}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-stone-400 line-through">
              {Number(product.comparePrice).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
