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
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex group"
    >
      <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] bg-gray-100 relative overflow-hidden flex-shrink-0">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100px, 120px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            No image
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
        )}
        {badgeStyle && (
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide ${badgeStyle.bg} ${badgeStyle.text}`}
          >
            {badgeStyle.label}
          </span>
        )}
      </div>
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <p className="font-medium text-sm line-clamp-2 leading-snug">{product.name}</p>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-bold text-base" style={{ color: themeColor }}>
              LKR {Number(product.price).toLocaleString()}
            </span>
            {product.comparePrice && (
              <span className="text-xs text-gray-400 line-through">
                {Number(product.comparePrice).toLocaleString()}
              </span>
            )}
            {discount > 0 && !isOutOfStock && (
              <span className="text-[10px] font-bold text-red-500">-{discount}%</span>
            )}
          </div>
        </div>
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            className={`self-end mt-2 w-9 h-9 rounded-full shadow flex items-center justify-center transition-all duration-200 active:scale-90 ${
              added ? "bg-emerald-500 text-white" : "bg-gray-100"
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
