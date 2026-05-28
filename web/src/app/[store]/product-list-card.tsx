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

export default function ProductListCard({
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
      className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/5 hover:ring-black/10 transition-all duration-300 flex group"
    >
      <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] bg-stone-50 relative overflow-hidden flex-shrink-0">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100px, 120px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
            No image
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
        )}
        {badgeStyle && (
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-[0.05em] uppercase ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {badgeStyle.label}
          </span>
        )}
      </div>
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <p className="font-medium text-base text-neutral-900 line-clamp-2 leading-relaxed">{product.name}</p>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-bold text-lg" style={{ color: themeColor }}>
              LKR {Number(product.price).toLocaleString()}
            </span>
            {product.comparePrice && (
              <span className="text-xs text-stone-400 line-through">
                {Number(product.comparePrice).toLocaleString()}
              </span>
            )}
            {discount > 0 && !isOutOfStock && (
              <span className="text-[11px] font-semibold text-rose-600">-{discount}%</span>
            )}
          </div>
        </div>
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            className={`self-end mt-2 w-9 h-9 rounded-lg shadow-sm border flex items-center justify-center transition-all duration-200 active:scale-90 ${
              added ? "bg-emerald-500 text-white border-emerald-500 scale-110" : "bg-white border-black/5 hover:border-black/10"
            }`}
            style={added ? {} : { color: themeColor }}
          >
            {added ? <Check className="w-4 h-4" strokeWidth={3} /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        )}
      </div>
    </Link>
  );
}
