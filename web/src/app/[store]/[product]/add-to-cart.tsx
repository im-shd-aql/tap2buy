"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Check, Zap, Minus, Plus } from "lucide-react";
import { useToast } from "@/components/toast";

interface Props {
  storeId: string;
  storeSlug: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  outOfStock: boolean;
  themeColor: string;
  variant?: Record<string, string>;
  variantRequired?: boolean;
}

export default function AddToCartButton({
  storeId,
  storeSlug,
  product,
  outOfStock,
  themeColor,
  variant,
  variantRequired,
}: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  function handleAdd() {
    if (variantRequired) return;
    addItem(storeId, {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      ...(variant ? { variant } : {}),
    }, quantity);
    toast(`Added ${quantity > 1 ? `${quantity}x ` : ""}"${product.name}" to cart`, `/${storeSlug}/cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (outOfStock) {
    return (
      <button
        disabled
        className="w-full py-3.5 bg-gray-200 text-gray-500 rounded-2xl font-semibold cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  const disabled = !!variantRequired;

  return (
    <>
      {/* Quantity selector */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-600">Qty:</span>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30"
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 h-10 flex items-center justify-center text-sm font-semibold tabular-nums border-x border-gray-200">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30"
            disabled={quantity >= 99}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop buttons */}
      <div className="hidden sm:flex gap-3">
        <button
          onClick={handleAdd}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-white rounded-2xl font-semibold transition-all duration-200 active:scale-[0.98] ${
            added ? "animate-pulse-once" : ""
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{
            background: added
              ? "#10b981"
              : disabled
                ? "#9ca3af"
                : `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`,
            boxShadow: disabled ? "none" : `0 4px 14px ${themeColor}40`,
          }}
        >
          {added ? (
            <>
              <Check className="w-5 h-5" strokeWidth={3} />
              Added to Cart!
            </>
          ) : disabled ? (
            "Select options above"
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </>
          )}
        </button>
        <button
          onClick={() => {
            handleAdd();
            if (!disabled) router.push(`/${storeSlug}/cart`);
          }}
          disabled={disabled}
          className={`px-8 py-3.5 border-2 rounded-2xl font-semibold transition-all duration-200 hover:bg-gray-50 active:scale-[0.98] flex items-center gap-2 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ borderColor: disabled ? "#9ca3af" : themeColor, color: disabled ? "#9ca3af" : themeColor }}
        >
          <Zap className="w-4 h-4" />
          Buy Now
        </button>
      </div>

      {/* Mobile frosted glass bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 px-4 py-3 flex gap-2.5 z-50 sm:hidden safe-bottom">
        <button
          onClick={handleAdd}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-white rounded-2xl font-semibold text-sm active:scale-[0.97] transition-all duration-200 ${
            added ? "animate-pulse-once" : ""
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{
            background: added
              ? "#10b981"
              : disabled
                ? "#9ca3af"
                : `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`,
            boxShadow: disabled ? "none" : `0 4px 14px ${themeColor}30`,
          }}
        >
          {added ? (
            <>
              <Check className="w-5 h-5" strokeWidth={3} />
              Added!
            </>
          ) : disabled ? (
            "Select options"
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </>
          )}
        </button>
        <button
          onClick={() => {
            handleAdd();
            if (!disabled) router.push(`/${storeSlug}/cart`);
          }}
          disabled={disabled}
          className={`px-5 py-3.5 border-2 rounded-2xl font-semibold text-sm active:scale-[0.97] transition-all duration-200 flex items-center gap-1.5 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ borderColor: disabled ? "#9ca3af" : themeColor, color: disabled ? "#9ca3af" : themeColor }}
        >
          <Zap className="w-4 h-4" />
          Buy Now
        </button>
      </div>
    </>
  );
}
