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

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl sm:text-2xl font-bold">Products</h1>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-[0.98] transition-transform"
        >
          <Plus className="w-4 h-4" />
          Add
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-8 text-sm">Loading...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center">
          <p className="text-gray-400 mb-4 text-sm">No products yet</p>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-1.5 px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                    No image
                  </div>
                )}
                {!product.isActive && (
                  <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full">
                    Hidden
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-bold text-sm">
                    LKR {Number(product.price).toLocaleString()}
                  </span>
                  {product.comparePrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {Number(product.comparePrice).toLocaleString()}
                    </span>
                  )}
                </div>
                {product.stock !== null && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Stock: {product.stock}
                  </p>
                )}
                <div className="flex gap-2 mt-2.5">
                  <Link
                    href={`/dashboard/products/new?edit=${product.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border rounded-xl text-xs font-medium hover:bg-gray-50 active:bg-gray-100"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2.5 border border-red-200 text-red-500 rounded-xl text-xs hover:bg-red-50 active:bg-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
