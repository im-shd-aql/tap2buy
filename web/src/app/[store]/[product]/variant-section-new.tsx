"use client";

import { useState, useCallback } from "react";
import VariantSelectorNew from "./variant-selector-new";
import AddToCartButton from "./add-to-cart";

interface ProductVariant {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price: string | number;
  comparePrice: string | number | null;
  stock: number | null;
  images: string[];
  isActive: boolean;
}

interface Props {
  storeId: string;
  storeSlug: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  variants: ProductVariant[];
  outOfStock: boolean;
  themeColor: string;
}

export default function VariantSectionNew({
  storeId,
  storeSlug,
  product,
  variants,
  outOfStock,
  themeColor,
}: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const handleVariantChange = useCallback((variant: ProductVariant | null) => {
    setSelectedVariant(variant);
  }, []);

  const hasVariants = variants && variants.length > 0;
  const variantRequired = !!(hasVariants && !selectedVariant);

  // Get current price and stock from selected variant or product
  const currentPrice = selectedVariant ? Number(selectedVariant.price) : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : (outOfStock ? 0 : null);
  const isOutOfStock = currentStock === 0;

  return (
    <>
      {hasVariants && (
        <div className="bg-white px-4 pb-4">
          <VariantSelectorNew
            variants={variants}
            themeColor={themeColor}
            onChange={handleVariantChange}
          />
        </div>
      )}
      <div className="bg-white px-4 pb-6">
        <AddToCartButton
          storeId={storeId}
          storeSlug={storeSlug}
          product={{
            ...product,
            price: currentPrice,
          }}
          outOfStock={isOutOfStock}
          themeColor={themeColor}
          variantId={selectedVariant?.id}
          variant={selectedVariant?.attributes}
          variantRequired={variantRequired}
        />
      </div>
    </>
  );
}
