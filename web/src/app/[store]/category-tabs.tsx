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
    <div className="overflow-x-auto scrollbar-hide px-4 py-2">
      <div className="max-w-3xl mx-auto flex gap-2">
        {all.map((cat) => {
          const isActive = cat === "All" ? active === "" : active === cat;
          return (
            <button
              key={cat}
              onClick={() => onChange(cat === "All" ? "" : cat)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
              style={
                isActive
                  ? { backgroundColor: themeColor, color: "white" }
                  : { backgroundColor: "#f3f4f6", color: "#6b7280" }
              }
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
