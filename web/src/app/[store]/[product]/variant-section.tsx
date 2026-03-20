"use client";

import { useState, useCallback } from "react";
import VariantSelector from "./variant-selector";
import AddToCartButton from "./add-to-cart";

interface Props {
  storeId: string;
  storeSlug: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  variants: { options: { name: string; values: string[] }[] } | null;
  outOfStock: boolean;
  themeColor: string;
}

export default function VariantSection({
  storeId,
  storeSlug,
  product,
  variants,
  outOfStock,
  themeColor,
}: Props) {
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string> | null>(null);

  const handleVariantChange = useCallback((selected: Record<string, string> | null) => {
    setSelectedVariant(selected);
  }, []);

  const hasVariants = variants && variants.options.length > 0;
  const variantRequired = !!(hasVariants && !selectedVariant);

  return (
    <>
      {hasVariants && (
        <div className="bg-white px-4 pb-4">
          <VariantSelector
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
          product={product}
          outOfStock={outOfStock}
          themeColor={themeColor}
          variant={selectedVariant || undefined}
          variantRequired={variantRequired}
        />
      </div>
    </>
  );
}
