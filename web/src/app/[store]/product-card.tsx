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

const BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: "bg-emerald-500", text: "text-white", label: "NEW" },
  sale: { bg: "bg-red-500", text: "text-white", label: "SALE" },
  limited: { bg: "bg-amber-500", text: "text-white", label: "LIMITED" },
  soldout: { bg: "bg-gray-800", text: "text-white", label: "SOLD OUT" },
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
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
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
            className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide shadow-sm ${badgeStyle.bg} ${badgeStyle.text}`}
          >
            {badgeStyle.label}
          </span>
        )}

        {/* Discount badge */}
        {discount > 0 && !isOutOfStock && (
          <span className="absolute top-2.5 right-2.5 bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
            -{discount}%
          </span>
        )}

        {/* Quick Add — always visible on mobile, hover on desktop */}
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full shadow-lg flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 active:scale-90 ${
              added ? "bg-emerald-500 text-white" : "bg-white"
            }`}
            style={added ? {} : { color: themeColor }}
          >
            {added ? <Check className="w-4.5 h-4.5" strokeWidth={3} /> : <ShoppingCart className="w-4.5 h-4.5" />}
          </button>
        )}
      </div>
      <div className="p-3 pb-3.5">
        <p className="font-medium text-sm line-clamp-2 leading-snug min-h-[2.5rem]">{product.name}</p>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="font-bold text-base" style={{ color: themeColor }}>
            LKR {Number(product.price).toLocaleString()}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-gray-400 line-through">
              {Number(product.comparePrice).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
