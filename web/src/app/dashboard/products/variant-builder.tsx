"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Plus, Upload, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";

interface VariantOption {
  name: string;
  values: string[];
}

export interface VariantData {
  id?: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  comparePrice?: number | null;
  stock: number | null;
  images: string[];
  isActive: boolean;
  sortOrder: number;
}

interface Props {
  basePrice: number;
  baseStock: number | null;
  token: string;
  onChange: (variants: VariantData[], options: VariantOption[]) => void;
  initialVariants?: VariantData[];
  initialOptions?: VariantOption[];
}

// Reconstruct options from variant attributes
function reconstructOptions(variants: VariantData[]): VariantOption[] {
  if (variants.length === 0) return [];
  const optionMap: Record<string, Set<string>> = {};
  variants.forEach((v) => {
    Object.entries(v.attributes).forEach(([key, value]) => {
      if (!optionMap[key]) optionMap[key] = new Set();
      optionMap[key].add(value);
    });
  });
  return Object.entries(optionMap).map(([name, valueSet]) => ({
    name,
    values: Array.from(valueSet),
  }));
}

// Generate all combinations
function generateCombinations(opts: VariantOption[]): Record<string, string>[] {
  if (opts.length === 0) return [];
  if (opts.length === 1) {
    return opts[0].values.map((value) => ({ [opts[0].name]: value }));
  }
  const [first, ...rest] = opts;
  const restCombos = generateCombinations(rest);
  const combos: Record<string, string>[] = [];
  for (const value of first.values) {
    for (const combo of restCombos) {
      combos.push({ [first.name]: value, ...combo });
    }
  }
  return combos;
}

function attrKey(attrs: Record<string, string>): string {
  return JSON.stringify(Object.entries(attrs).sort());
}

export default function VariantBuilder({
  basePrice,
  baseStock,
  token,
  onChange,
  initialVariants,
  initialOptions,
}: Props) {
  const [options, setOptions] = useState<VariantOption[]>(
    initialOptions || (initialVariants?.length ? reconstructOptions(initialVariants) : [])
  );
  const [variants, setVariants] = useState<VariantData[]>(initialVariants || []);
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [valueInputs, setValueInputs] = useState<Record<number, string>>({});
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Notify parent of changes
  const notifyParent = useCallback(() => {
    onChange(variants, options);
  }, [variants, options, onChange]);

  useEffect(() => {
    notifyParent();
  }, [notifyParent]);

  // ============ Options Management ============

  function addOption() {
    setOptions([...options, { name: "", values: [] }]);
  }

  function updateOptionName(index: number, name: string) {
    const updated = [...options];
    updated[index] = { ...updated[index], name };
    setOptions(updated);
  }

  function addValueToOption(optionIndex: number, value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    const updated = [...options];
    if (updated[optionIndex].values.includes(trimmed)) return;
    updated[optionIndex] = {
      ...updated[optionIndex],
      values: [...updated[optionIndex].values, trimmed],
    };
    setOptions(updated);
    setValueInputs((prev) => ({ ...prev, [optionIndex]: "" }));
  }

  function removeValueFromOption(optionIndex: number, valueIndex: number) {
    const updated = [...options];
    updated[optionIndex] = {
      ...updated[optionIndex],
      values: updated[optionIndex].values.filter((_, i) => i !== valueIndex),
    };
    setOptions(updated);
  }

  function removeOption(index: number) {
    setOptions(options.filter((_, i) => i !== index));
    const newInputs = { ...valueInputs };
    delete newInputs[index];
    setValueInputs(newInputs);
  }

  function handleValueKeyDown(e: React.KeyboardEvent, optionIndex: number) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = valueInputs[optionIndex] || "";
      // Handle comma-separated paste
      const parts = val.split(",").map((v) => v.trim()).filter(Boolean);
      parts.forEach((part) => addValueToOption(optionIndex, part));
      setValueInputs((prev) => ({ ...prev, [optionIndex]: "" }));
    }
  }

  // ============ Variant Generation ============

  function generateVariants() {
    const validOptions = options.filter((o) => o.name.trim() && o.values.length > 0);
    if (validOptions.length === 0) return;

    const combinations = generateCombinations(validOptions);

    // Build a lookup of existing variants to preserve customizations
    const existingLookup = new Map<string, VariantData>();
    variants.forEach((v) => existingLookup.set(attrKey(v.attributes), v));

    const newVariants: VariantData[] = combinations.map((attributes, index) => {
      const key = attrKey(attributes);
      const existing = existingLookup.get(key);

      if (existing) {
        // Preserve existing customizations
        return { ...existing, sortOrder: index };
      }

      return {
        name: Object.values(attributes).join(" / "),
        attributes,
        price: basePrice || 0,
        comparePrice: null,
        stock: baseStock,
        images: [],
        isActive: true,
        sortOrder: index,
      };
    });

    setVariants(newVariants);
  }

  // Auto-regenerate when options change
  const optionsValid = options.filter((o) => o.name.trim() && o.values.length > 0);
  const totalCombinations = optionsValid.length > 0
    ? optionsValid.reduce((acc, o) => acc * o.values.length, 1)
    : 0;

  // ============ Variant Editing ============

  function updateVariant(index: number, field: keyof VariantData, value: any) {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index));
    if (expandedVariant === index) setExpandedVariant(null);
    else if (expandedVariant !== null && expandedVariant > index) {
      setExpandedVariant(expandedVariant - 1);
    }
  }

  async function handleVariantImageUpload(variantIndex: number, file: File) {
    if (!file) return;
    setUploading(`variant-${variantIndex}`);
    try {
      const { url } = await api.upload(file, token);
      const updated = [...variants];
      updated[variantIndex] = {
        ...updated[variantIndex],
        images: [...updated[variantIndex].images, url],
      };
      setVariants(updated);
    } catch {
      // silently fail
    } finally {
      setUploading(null);
    }
  }

  function removeVariantImage(variantIndex: number, imageIndex: number) {
    const updated = [...variants];
    updated[variantIndex] = {
      ...updated[variantIndex],
      images: updated[variantIndex].images.filter((_, i) => i !== imageIndex),
    };
    setVariants(updated);
  }

  function bulkApplyPrice() {
    const price = prompt("Enter price to apply to all variants:");
    if (price !== null && price !== "" && !isNaN(Number(price)) && Number(price) > 0) {
      setVariants(variants.map((v) => ({ ...v, price: Number(price) })));
    }
  }

  function bulkApplyStock() {
    const stock = prompt("Enter stock to apply to all variants (leave empty for unlimited):");
    if (stock === null) return; // cancelled
    if (stock === "") {
      setVariants(variants.map((v) => ({ ...v, stock: null })));
    } else if (!isNaN(Number(stock)) && Number(stock) >= 0) {
      setVariants(variants.map((v) => ({ ...v, stock: parseInt(stock) })));
    }
  }

  return (
    <div className="space-y-5">
      {/* Options Builder */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base">Variant Options</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Add options like Size, Color, Flavor
            </p>
          </div>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            disabled={options.length >= 3}
          >
            <Plus className="w-4 h-4" />
            Add Option
          </button>
        </div>

        {options.length === 0 ? (
          <button
            type="button"
            onClick={addOption}
            className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm"
          >
            <Plus className="w-5 h-5 mx-auto mb-1.5" />
            Add your first option (e.g. Size, Color)
          </button>
        ) : (
          <div className="space-y-4">
            {options.map((option, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) => updateOptionName(idx, e.target.value)}
                    placeholder="Option name (e.g. Size)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Value chips */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {option.values.map((val, vIdx) => (
                    <span
                      key={vIdx}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium"
                    >
                      {val}
                      <button
                        type="button"
                        onClick={() => removeValueFromOption(idx, vIdx)}
                        className="ml-0.5 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add value input */}
                <input
                  type="text"
                  value={valueInputs[idx] || ""}
                  onChange={(e) =>
                    setValueInputs((prev) => ({ ...prev, [idx]: e.target.value }))
                  }
                  onKeyDown={(e) => handleValueKeyDown(e, idx)}
                  onBlur={() => {
                    const val = valueInputs[idx] || "";
                    if (val.trim()) {
                      val.split(",").map((v) => v.trim()).filter(Boolean).forEach((v) => addValueToOption(idx, v));
                      setValueInputs((prev) => ({ ...prev, [idx]: "" }));
                    }
                  }}
                  placeholder={option.values.length > 0 ? "Add another value..." : "Type a value and press Enter (e.g. Small)"}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-300"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Press Enter to add. You can also paste comma-separated values.
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Generate button */}
        {optionsValid.length > 0 && totalCombinations > 0 && (
          <button
            type="button"
            onClick={generateVariants}
            className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors active:scale-[0.98]"
          >
            {variants.length > 0
              ? `Regenerate ${totalCombinations} Variants`
              : `Generate ${totalCombinations} Variants`}
          </button>
        )}
      </div>

      {/* Generated Variants */}
      {variants.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">
              Variants
              <span className="text-gray-400 font-normal ml-1.5">({variants.length})</span>
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={bulkApplyPrice}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Set All Prices
              </button>
              <button
                type="button"
                onClick={bulkApplyStock}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Set All Stock
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {variants.map((variant, idx) => {
              const isExpanded = expandedVariant === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-xl overflow-hidden transition-colors ${
                    isExpanded ? "border-indigo-200 bg-indigo-50/30" : "border-gray-200"
                  }`}
                >
                  {/* Header */}
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    onClick={() => setExpandedVariant(isExpanded ? null : idx)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
                      {Object.entries(variant.attributes).map(([key, val]) => (
                        <span
                          key={key}
                          className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                        >
                          <span className="text-gray-400 mr-1">{key}:</span>
                          {val}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 tabular-nums flex-shrink-0">
                      LKR {(variant.price || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">
                      {variant.stock === null ? "∞" : variant.stock}
                    </span>
                    {!variant.isActive && (
                      <span className="text-[10px] text-red-500 font-medium flex-shrink-0">OFF</span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeVariant(idx); }}
                      className="text-gray-300 hover:text-red-500 p-1 flex-shrink-0 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Price (LKR)</label>
                          <input
                            type="number"
                            value={variant.price || ""}
                            onChange={(e) => updateVariant(idx, "price", e.target.value ? Number(e.target.value) : 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Compare Price</label>
                          <input
                            type="number"
                            value={variant.comparePrice ?? ""}
                            onChange={(e) =>
                              updateVariant(idx, "comparePrice", e.target.value ? Number(e.target.value) : null)
                            }
                            placeholder="—"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Stock</label>
                          <input
                            type="number"
                            value={variant.stock !== null && variant.stock !== undefined ? variant.stock : ""}
                            onChange={(e) =>
                              updateVariant(idx, "stock", e.target.value !== "" ? parseInt(e.target.value) : null)
                            }
                            placeholder="∞"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Images */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Variant Image</label>
                        <div className="flex gap-2 flex-wrap">
                          {variant.images.map((url, imgIdx) => (
                            <div key={imgIdx} className="relative w-16 h-16">
                              <img
                                src={url}
                                alt=""
                                className="w-full h-full object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeVariantImage(idx, imgIdx)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => fileRefs.current[idx]?.click()}
                            disabled={uploading === `variant-${idx}`}
                            className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-400 transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            <span className="text-[10px] mt-0.5">
                              {uploading === `variant-${idx}` ? "..." : "Add"}
                            </span>
                          </button>
                          <input
                            ref={(el) => { fileRefs.current[idx] = el; }}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleVariantImageUpload(idx, file);
                              e.target.value = "";
                            }}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Active Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(e) => updateVariant(idx, "isActive", e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-600">Available for sale</span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
