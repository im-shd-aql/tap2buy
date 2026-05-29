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
    <div className="sticky top-0 z-20 bg-white px-4 py-2.5">
      <div className="max-w-3xl mx-auto relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-16 py-2.5 bg-gray-50 rounded-full text-sm placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white"
        />
        {value && resultCount !== undefined && (
          <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-gray-400 tabular-nums">
            {resultCount} found
          </span>
        )}
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-all"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
