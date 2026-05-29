"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string;
  comparePrice: string | null;
  images: string[];
  stock: number | null;
  isActive: boolean;
}

export default function ProductsPage() {
  const { token } = useAuth();
  const { store } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !store) return;
    api
      .get<{ products: Product[] }>(`/api/stores/${store.id}/products`, { token })
      .then((data) => setProducts(data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, store]);

  async function deleteProduct(id: string) {
    if (!token || !store || !confirm("Delete this product?")) return;
    try {
      await api.delete(`/api/stores/${store.id}/products/${id}`, { token });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-900">Products</h1>
        <span className="text-xs text-gray-400 font-medium">
          {products.length} item{products.length !== 1 ? "s" : ""}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-7 h-7 text-indigo-600" />
          </div>
          <p className="text-gray-500 text-sm mb-1">Add your first product</p>
          <p className="text-gray-400 text-xs mb-5">Start selling by adding products to your store</p>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-semibold active:scale-[0.98] transition-transform"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
            >
              {/* Image */}
              <div className="aspect-square bg-gray-50 relative">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    No image
                  </div>
                )}
                {/* Status badge */}
                {!product.isActive && (
                  <div className="absolute top-2 left-2 bg-gray-900/70 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Hidden
                  </div>
                )}
                {/* Stock indicator */}
                {product.stock !== null && product.stock <= 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Out of stock
                  </div>
                )}
                {product.stock !== null && product.stock > 0 && product.stock <= 5 && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {product.stock} left
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-bold text-sm text-gray-900">
                    LKR {Number(product.price).toLocaleString()}
                  </span>
                  {product.comparePrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {Number(product.comparePrice).toLocaleString()}
                    </span>
                  )}
                </div>
                {product.stock !== null && product.stock > 5 && (
                  <p className="text-xs text-gray-400 mt-0.5">Stock: {product.stock}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-2.5">
                  <Link
                    href={`/dashboard/products/new?edit=${product.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 active:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="flex items-center justify-center px-3 py-2 border border-red-100 text-red-500 rounded-xl text-xs active:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating add button */}
      {products.length > 0 && (
        <Link
          href="/dashboard/products/new"
          className="fixed bottom-20 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center active:scale-95 transition-transform z-30"
        >
          <Plus className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
}
