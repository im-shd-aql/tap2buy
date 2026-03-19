"use client";

import { Search, X } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  resultCount,
  themeColor,
}: {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  themeColor: string;
}) {
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md shadow-sm px-4 py-3">
      <div className="max-w-3xl mx-auto relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-11 pr-20 py-3 bg-gray-100 rounded-2xl text-sm transition-all duration-200 focus:outline-none focus:bg-white focus:shadow-md"
          style={{
            // Use boxShadow for themed focus ring since focus:ring doesn't support dynamic colors
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = `0 0 0 2px ${themeColor}40, 0 4px 12px rgba(0,0,0,0.08)`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "";
          }}
        />
        {value && resultCount !== undefined && (
          <span className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-gray-400 tabular-nums">
            {resultCount} found
          </span>
        )}
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
