"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Upload, X, ArrowLeft, Star, Tag, Plus } from "lucide-react";
import Link from "next/link";

const BADGE_OPTIONS = [
  { value: "", label: "None" },
  { value: "new", label: "New" },
  { value: "sale", label: "Sale" },
  { value: "limited", label: "Limited" },
];

export default function NewProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { token } = useAuth();
  const { store } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [badge, setBadge] = useState("");
  const [variantOptions, setVariantOptions] = useState<{name: string; values: string[]}[]>([]);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing categories
  useEffect(() => {
    if (store) {
      api
        .get<{ categories: string[] }>(`/api/stores/${store.id}/categories`)
        .then(({ categories }) => setExistingCategories(categories))
        .catch(() => {});
    }
  }, [store]);

  useEffect(() => {
    if (editId && token && store) {
      api
        .get<{ product: any }>(`/api/stores/${store.id}/products/${editId}`, { token })
        .then(({ product }) => {
          setName(product.name);
          setDescription(product.description || "");
          setPrice(product.price.toString());
          setComparePrice(product.comparePrice?.toString() || "");
          setImages(product.images || []);
          setStock(product.stock?.toString() || "");
          setIsActive(product.isActive);
          setCategory(product.category || "");
          setIsFeatured(product.isFeatured || false);
          setBadge(product.badge || "");
          if (product.variants?.options) {
            setVariantOptions(product.variants.options);
          }
        })
        .catch(() => router.push("/dashboard/products"));
    }
  }, [editId, token, store, router]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const { url } = await api.upload(file, token);
      setImages((prev) => [...prev, url]);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !store) return;
    setError("");
    setLoading(true);

    const finalCategory = category === "__new__" ? newCategory : category;

    const body = {
      name,
      description: description || undefined,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
      images,
      variants: variantOptions.length > 0 ? { options: variantOptions } : null,
      stock: stock ? parseInt(stock) : null,
      isActive,
      category: finalCategory || null,
      isFeatured,
      badge: badge || null,
    };

    try {
      if (editId) {
        await api.put(`/api/stores/${store.id}/products/${editId}`, body, { token });
      } else {
        await api.post(`/api/stores/${store.id}/products`, body, { token });
      }
      router.push("/dashboard/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/dashboard/products"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 py-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <h1 className="text-xl sm:text-2xl font-bold mb-5">
        {editId ? "Edit Product" : "Add Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chocolate Cake 1kg"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Rich chocolate cake with cream frosting..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Price (LKR)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1500"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Was <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="number"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              placeholder="2000"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Stock <span className="text-gray-400">(leave empty = unlimited)</span>
          </label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Unlimited"
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Variants */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Variants <span className="text-gray-400">(optional)</span>
          </label>
          {variantOptions.map((opt, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={opt.name}
                onChange={(e) => {
                  const updated = [...variantOptions];
                  updated[idx] = { ...updated[idx], name: e.target.value };
                  setVariantOptions(updated);
                }}
                placeholder="e.g. Size"
                className="w-28 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="text"
                value={opt.values.join(", ")}
                onChange={(e) => {
                  const updated = [...variantOptions];
                  updated[idx] = {
                    ...updated[idx],
                    values: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                  };
                  setVariantOptions(updated);
                }}
                placeholder="S, M, L, XL"
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setVariantOptions((prev) => prev.filter((_, i) => i !== idx))}
                className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {variantOptions.length < 5 && (
            <button
              type="button"
              onClick={() => setVariantOptions((prev) => [...prev, { name: "", values: [] }])}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium py-1"
            >
              <Plus className="w-4 h-4" />
              Add Option (e.g. Size, Color)
            </button>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            <Tag className="w-3.5 h-3.5 inline mr-1" />
            Category <span className="text-gray-400">(optional)</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">No category</option>
            {existingCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="__new__">+ Add new category</option>
          </select>
          {category === "__new__" && (
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mt-2"
            />
          )}
        </div>

        {/* Badge */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Badge</label>
          <div className="flex gap-2">
            {BADGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBadge(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  badge === opt.value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <div className="flex gap-3 flex-wrap">
            {images.map((url, i) => (
              <div key={i} className="relative w-24 h-24 sm:w-20 sm:h-20">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover rounded-xl border"
                />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-24 h-24 sm:w-20 sm:h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-400 active:bg-gray-50"
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs mt-1">{uploading ? "..." : "Add"}</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Featured toggle */}
        <label className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-5 h-5 rounded"
          />
          <div>
            <span className="text-sm flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              Featured Product
            </span>
            <p className="text-xs text-gray-400">Show in the Featured section on your store</p>
          </div>
        </label>

        <label className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 rounded"
          />
          <span className="text-sm">Visible on store</span>
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-base hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {loading ? "Saving..." : editId ? "Save Changes" : "Add Product"}
        </button>
      </form>
    </div>
  );
}
