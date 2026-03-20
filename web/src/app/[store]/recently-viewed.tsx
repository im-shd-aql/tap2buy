"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

interface RecentProduct {
  id: string;
  name: string;
  price: string;
  image: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  images: string[];
}

const MAX_RECENT = 10;

export function trackRecentlyViewed(storeSlug: string, product: RecentProduct) {
  try {
    const key = `tap2buy_recent_${storeSlug}`;
    const raw = localStorage.getItem(key);
    let items: RecentProduct[] = raw ? JSON.parse(raw) : [];
    // Remove existing entry for this product
    items = items.filter((p) => p.id !== product.id);
    // Add to front
    items.unshift(product);
    // Keep max
    items = items.slice(0, MAX_RECENT);
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

export default function RecentlyViewed({
  storeSlug,
  storeId,
  themeColor,
  currentProducts,
}: {
  storeSlug: string;
  storeId: string;
  themeColor: string;
  currentProducts: Product[];
}) {
  const [recent, setRecent] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const key = `tap2buy_recent_${storeSlug}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const items: RecentProduct[] = JSON.parse(raw);
        // Only show products that still exist in the store
        const validIds = new Set(currentProducts.map((p) => p.id));
        setRecent(items.filter((p) => validIds.has(p.id)));
      }
    } catch {}
  }, [storeSlug, currentProducts]);

  if (recent.length === 0) return null;

  return (
    <section className="mt-8 mb-2">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-100">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
        </div>
        <h2 className="font-semibold tracking-tight text-sm text-gray-500">Recently Viewed</h2>
      </div>
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3" style={{ minWidth: "min-content" }}>
          {recent.map((product) => (
            <Link
              key={product.id}
              href={`/${storeSlug}/${product.id}`}
              className="w-28 flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-sm ring-1 ring-gray-100 hover:ring-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-square bg-gray-100 relative">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                    No image
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-[11px] font-medium line-clamp-1 leading-snug">{product.name}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: themeColor }}>
                  LKR {Number(product.price).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
