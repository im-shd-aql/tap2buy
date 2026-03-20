"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Package, Sparkles, LayoutGrid, List, ArrowUpDown } from "lucide-react";
import SearchBar from "./search-bar";
import CategoryTabs from "./category-tabs";
import ProductCard from "./product-card";
import ProductListCard from "./product-list-card";
import RecentlyViewed from "./recently-viewed";

type SortOption = "default" | "price-asc" | "price-desc";

interface Product {
  id: string;
  name: string;
  price: string;
  comparePrice: string | null;
  images: string[];
  stock: number | null;
  category: string | null;
  isFeatured: boolean;
  badge: string | null;
}

export default function StoreContent({
  products,
  storeId,
  storeSlug,
  themeColor,
}: {
  products: Product[];
  storeId: string;
  storeSlug: string;
  themeColor: string;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 200);
  }, []);

  // Restore view mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`tap2buy_view_${storeSlug}`);
      if (saved === "list" || saved === "grid") setViewMode(saved);
    } catch {}
  }, [storeSlug]);

  function handleViewMode(mode: "grid" | "list") {
    setViewMode(mode);
    try {
      localStorage.setItem(`tap2buy_view_${storeSlug}`, mode);
    } catch {}
  }

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  const featuredProducts = useMemo(
    () => products.filter((p) => p.isFeatured),
    [products]
  );

  const filtered = useMemo(() => {
    let result = products;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    }
    return result;
  }, [products, debouncedSearch, activeCategory, sortBy]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "default", label: "Newest" },
    { value: "price-asc", label: "Price: Low → High" },
    { value: "price-desc", label: "Price: High → Low" },
  ];

  return (
    <>
      {/* Search */}
      <SearchBar
        value={search}
        onChange={handleSearch}
        resultCount={search ? filtered.length : undefined}
        themeColor={themeColor}
      />

      {/* Categories */}
      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
          themeColor={themeColor}
        />
      )}

      <main className="max-w-3xl mx-auto px-4 py-4">
        {/* Featured Products */}
        {featuredProducts.length > 0 && !search && !activeCategory && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${themeColor}15` }}>
                <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
              </div>
              <h2 className="font-bold text-lg tracking-tight">Featured</h2>
            </div>
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
              <div className="flex gap-3" style={{ minWidth: "min-content" }}>
                {featuredProducts.map((product) => (
                  <div key={product.id} className="w-48 flex-shrink-0 snap-start">
                    <ProductCard
                      product={product}
                      storeId={storeId}
                      storeSlug={storeSlug}
                      themeColor={themeColor}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Product count header + sort + view toggle */}
        {products.length > 0 && (
          <div className="mb-4 space-y-2">
            {/* Row 1: Title + item count */}
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                {!search && !activeCategory && (
                  <h2 className="font-bold text-lg tracking-tight">All Products</h2>
                )}
                {activeCategory && (
                  <h2 className="font-bold text-lg tracking-tight">{activeCategory}</h2>
                )}
                {search && (
                  <h2 className="font-bold text-lg tracking-tight truncate">Results</h2>
                )}
              </div>
              <span className="text-xs text-gray-400 tabular-nums bg-gray-100 px-2.5 py-0.5 rounded-full flex-shrink-0">
                {filtered.length} items
              </span>
            </div>

            {/* Row 2: Sort + view toggle */}
            <div className="flex items-center justify-between gap-2">
              {/* Sort pills (desktop) */}
              <div className="hidden md:flex items-center gap-1.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                      sortBy === opt.value
                        ? "text-white shadow-sm"
                        : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                    }`}
                    style={sortBy === opt.value ? { backgroundColor: themeColor } : {}}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Sort dropdown (mobile) */}
              <div className="md:hidden relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-7 pr-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200 focus:outline-none"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>

              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 border border-gray-200/60 rounded-full p-0.5">
                <button
                  onClick={() => handleViewMode("grid")}
                  className={`p-1.5 rounded-full transition-all duration-200 ${
                    viewMode === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-400"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewMode("list")}
                  className={`p-1.5 rounded-full transition-all duration-200 ${
                    viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-400"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid / List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 animate-fade-up">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              {search
                ? `No products matching "${search}"`
                : "No products available yet"}
            </p>
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="mt-3 text-sm font-medium hover:underline"
                style={{ color: themeColor }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                storeId={storeId}
                storeSlug={storeSlug}
                themeColor={themeColor}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((product) => (
              <ProductListCard
                key={product.id}
                product={product}
                storeId={storeId}
                storeSlug={storeSlug}
                themeColor={themeColor}
              />
            ))}
          </div>
        )}

        {/* Recently Viewed */}
        <RecentlyViewed
          storeSlug={storeSlug}
          storeId={storeId}
          themeColor={themeColor}
          currentProducts={products}
        />
      </main>
    </>
  );
}
