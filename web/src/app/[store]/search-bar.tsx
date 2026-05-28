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
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100/80 px-4 py-3">
      <div className="max-w-3xl mx-auto relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-11 pr-20 py-3 bg-white rounded-xl text-sm border border-stone-200 focus:border-stone-300 placeholder:text-stone-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-stone-100"
        />
        {value && resultCount !== undefined && (
          <span className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-stone-400 tabular-nums">
            {resultCount} found
          </span>
        )}
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-stone-200 hover:scale-110 rounded-full transition-all"
          >
            <X className="w-4 h-4 text-stone-400" />
          </button>
        )}
      </div>
    </div>
  );
}
