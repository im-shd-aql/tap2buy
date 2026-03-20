"use client";

import { useState, useEffect } from "react";

interface VariantOption {
  name: string;
  values: string[];
}

interface Props {
  variants: { options: VariantOption[] };
  themeColor: string;
  onChange: (selected: Record<string, string> | null) => void;
}

export default function VariantSelector({ variants, themeColor, onChange }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  useEffect(() => {
    const allSelected = variants.options.every((opt) => selected[opt.name]);
    onChange(allSelected ? selected : null);
  }, [selected, variants.options, onChange]);

  return (
    <div className="space-y-4">
      {variants.options.map((option) => (
        <div key={option.name}>
          <p className="text-sm font-medium text-gray-700 mb-2">
            {option.name}
            {selected[option.name] && (
              <span className="text-gray-400 font-normal ml-1.5">— {selected[option.name]}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selected[option.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [option.name]: value }))
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                    isSelected
                      ? "text-white border-transparent shadow-sm"
                      : "text-gray-600 border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                  style={isSelected ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
