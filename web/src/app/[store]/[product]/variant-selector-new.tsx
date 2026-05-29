"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export interface ProductVariant {
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
  variants: ProductVariant[];
  themeColor: string;
  onChange: (variant: ProductVariant | null) => void;
}

// Extract unique attribute names and their possible values from all variants
function extractAttributeOptions(variants: ProductVariant[]): Record<string, string[]> {
  const options: Record<string, Set<string>> = {};

  // Preserve insertion order by iterating through variants in order
  variants.forEach((variant) => {
    Object.entries(variant.attributes).forEach(([key, value]) => {
      if (!options[key]) options[key] = new Set();
      options[key].add(value);
    });
  });

  const result: Record<string, string[]> = {};
  Object.entries(options).forEach(([key, valueSet]) => {
    result[key] = Array.from(valueSet);
  });

  return result;
}

export default function VariantSelectorNew({ variants, themeColor, onChange }: Props) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const attributeOptions = extractAttributeOptions(variants);
  const attributeNames = Object.keys(attributeOptions);

  // Find matching variant
  const findMatchingVariant = useCallback(
    (attrs: Record<string, string>): ProductVariant | null => {
      const allSelected = attributeNames.every((name) => attrs[name]);
      if (!allSelected) return null;

      return (
        variants.find((v) =>
          Object.entries(attrs).every(([key, value]) => v.attributes[key] === value)
        ) || null
      );
    },
    [variants, attributeNames]
  );

  // Notify parent of selection change
  useEffect(() => {
    const match = findMatchingVariant(selectedAttributes);
    onChange(match);
  }, [selectedAttributes, findMatchingVariant, onChange]);

  // Auto-select if only one value for an option
  useEffect(() => {
    const autoSelected: Record<string, string> = {};
    Object.entries(attributeOptions).forEach(([name, values]) => {
      if (values.length === 1) {
        autoSelected[name] = values[0];
      }
    });
    if (Object.keys(autoSelected).length > 0) {
      setSelectedAttributes((prev) => ({ ...autoSelected, ...prev }));
    }
  }, []);

  function handleSelect(attrName: string, value: string) {
    setSelectedAttributes((prev) => ({ ...prev, [attrName]: value }));
  }

  function isValueAvailable(attrName: string, value: string): boolean {
    return variants.some((v) => {
      if (!v.isActive) return false;
      if (v.stock === 0) return false;
      if (v.attributes[attrName] !== value) return false;

      // Check if compatible with other selected attributes
      return Object.entries(selectedAttributes).every(
        ([key, val]) => key === attrName || v.attributes[key] === val
      );
    });
  }

  const selectedVariant = findMatchingVariant(selectedAttributes);
  const selectedPrice = selectedVariant ? Number(selectedVariant.price) : null;
  const selectedComparePrice = selectedVariant?.comparePrice
    ? Number(selectedVariant.comparePrice)
    : null;

  return (
    <div className="space-y-5">
      {attributeNames.map((attrName) => (
        <div key={attrName}>
          <p className="text-sm font-medium text-gray-700 mb-2.5">
            {attrName}
            {selectedAttributes[attrName] && (
              <span className="text-gray-400 font-normal ml-1.5">
                — {selectedAttributes[attrName]}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {attributeOptions[attrName].map((value) => {
              const isSelected = selectedAttributes[attrName] === value;
              const isAvailable = isValueAvailable(attrName, value);

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelect(attrName, value)}
                  disabled={!isAvailable}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                    isSelected
                      ? "text-white border-transparent shadow-sm"
                      : isAvailable
                        ? "text-gray-600 border-gray-200 hover:border-gray-300 bg-white"
                        : "text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed line-through"
                  }`}
                  style={
                    isSelected ? { backgroundColor: themeColor, borderColor: themeColor } : {}
                  }
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected variant info */}
      {selectedVariant && (
        <div className="pt-3 border-t border-gray-100 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold" style={{ color: themeColor }}>
                  LKR {(selectedPrice || 0).toLocaleString()}
                </span>
                {selectedComparePrice && selectedComparePrice > (selectedPrice || 0) && (
                  <span className="text-sm text-gray-400 line-through">
                    LKR {selectedComparePrice.toLocaleString()}
                  </span>
                )}
              </div>
              {selectedVariant.stock !== null && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedVariant.stock > 0 ? (
                    <>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                      {selectedVariant.stock} in stock
                    </>
                  ) : (
                    <span className="text-red-500 font-medium">Out of stock</span>
                  )}
                </p>
              )}
            </div>
            {selectedVariant.images.length > 0 && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100">
                <Image
                  src={selectedVariant.images[0]}
                  alt={selectedVariant.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
