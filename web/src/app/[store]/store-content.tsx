"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { Package, Sparkles, ArrowUpDown } from "lucide-react";
import SearchBar from "./search-bar";
import CategoryTabs from "./category-tabs";
import ProductCard from "./product-card";
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
  hasVariants?: boolean;
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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 200);
  }, []);

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

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Featured Products */}
        {featuredProducts.length > 0 && !search && !activeCategory && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${themeColor}15` }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: themeColor }} />
              </div>
              <h2 className="text-base font-semibold tracking-tight text-gray-900">Featured</h2>
            </div>
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
              <div className="flex gap-3" style={{ minWidth: "min-content" }}>
                {featuredProducts.map((product) => (
                  <div key={product.id} className="w-44 flex-shrink-0 snap-start">
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

        {/* Product count header + sort */}
        {products.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              {!search && !activeCategory && (
                <h2 className="text-base font-semibold tracking-tight text-gray-900">All Products</h2>
              )}
              {activeCategory && (
                <h2 className="text-base font-semibold tracking-tight text-gray-900">{activeCategory}</h2>
              )}
              {search && (
                <h2 className="text-base font-semibold tracking-tight text-gray-900 truncate">Results</h2>
              )}
              <span className="text-xs text-gray-400 tabular-nums bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                {filtered.length}
              </span>
            </div>

            {/* Sort pills (desktop only) */}
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
          </div>
        )}

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 animate-fade-up">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-600 font-medium">
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
        ) : (
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
