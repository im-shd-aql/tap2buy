"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { ImagePlus } from "lucide-react";

interface ProductStepProps {
  storeId: string;
  token: string;
  onProductCreated: (product: { name: string; price: number; image: string }) => void;
}

export default function ProductStep({
  storeId,
  token,
  onProductCreated,
}: ProductStepProps) {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const imageFile = useRef<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError("");
    imageFile.current = file;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile.current || !productName.trim() || !price) return;

    setLoading(true);
    setError("");
    try {
      // Upload image first
      const { url } = await api.upload(imageFile.current, token);

      // Create product
      await api.post(
        `/api/stores/${storeId}/products`,
        {
          name: productName.trim(),
          price: parseFloat(price),
          images: [url],
        },
        { token }
      );

      onProductCreated({
        name: productName.trim(),
        price: parseFloat(price),
        image: url,
      });
    } catch (err: any) {
      setError(err.message || "Failed to add product. Please try again.");
      setLoading(false);
    }
  }

  const isValid = imageFile.current && productName.trim().length > 0 && parseFloat(price) > 0;

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-1">Add your first product</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Customers can order this immediately
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image upload */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full aspect-square max-w-[200px] mx-auto rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors overflow-hidden flex items-center justify-center bg-gray-50"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImagePlus className="w-8 h-8" />
              <span className="text-sm">Tap to add photo</span>
            </div>
          )}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Product name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Product Name</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Chocolate Cake, Cotton T-Shirt"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            maxLength={200}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              LKR
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          {loading ? "Adding product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
