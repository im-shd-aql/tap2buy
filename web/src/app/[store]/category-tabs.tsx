"use client";

export default function CategoryTabs({
  categories,
  active,
  onChange,
  themeColor,
}: {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
  themeColor: string;
}) {
  if (categories.length === 0) return null;

  const all = ["All", ...categories];

  return (
    <div className="relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="overflow-x-auto scrollbar-hide px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-2">
          {all.map((cat) => {
            const isActive = cat === "All" ? active === "" : active === cat;
            return (
              <button
                key={cat}
                onClick={() => onChange(cat === "All" ? "" : cat)}
                className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95"
                style={
                  isActive
                    ? { backgroundColor: themeColor, color: "white", boxShadow: `0 3px 12px ${themeColor}35, 0 1px 3px ${themeColor}20` }
                    : { backgroundColor: "#f9fafb", color: "#6b7280", border: "1.5px solid #e5e7eb" }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
