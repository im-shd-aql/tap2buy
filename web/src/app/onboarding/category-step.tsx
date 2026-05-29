"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import {
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Smartphone,
  Droplets,
  Palette,
  Watch,
  Package,
} from "lucide-react";

const CATEGORIES = [
  { name: "Fashion", icon: Shirt },
  { name: "Cosmetics", icon: Sparkles },
  { name: "Food", icon: UtensilsCrossed },
  { name: "Electronics", icon: Smartphone },
  { name: "Perfumes", icon: Droplets },
  { name: "Handmade", icon: Palette },
  { name: "Accessories", icon: Watch },
  { name: "Other", icon: Package },
];

interface CategoryStepProps {
  storeName: string;
  token: string;
  onStoreCreated: (storeId: string, slug: string) => void;
}

export default function CategoryStep({
  storeName,
  token,
  onStoreCreated,
}: CategoryStepProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSelect(category: string) {
    setSelected(category);
    setError("");
    setLoading(true);
    try {
      const response = await api.post<{
        store: { id: string; slug: string };
      }>("/api/stores", { name: storeName, category }, { token });

      onStoreCreated(response.store.id, response.store.slug);
    } catch (err: any) {
      setError(err.message || "Failed to create store. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-1">What do you sell?</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Pick the category that best fits your products
      </p>

      {/* Info notice */}
      <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-100 mb-4">
        <p className="text-xs text-blue-700">
          💡 You can update your category once every 30 days
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {CATEGORIES.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => !loading && handleSelect(name)}
            disabled={loading}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all active:scale-[0.97] ${
              selected === name
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-gray-200 bg-white hover:border-gray-300"
            } ${loading && selected !== name ? "opacity-50" : ""}`}
          >
            <Icon
              className={`w-6 h-6 ${
                selected === name ? "text-indigo-600" : "text-gray-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                selected === name ? "text-indigo-700" : "text-gray-700"
              }`}
            >
              {name}
            </span>
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {loading && selected && (
        <p className="text-center text-sm text-gray-500 mt-3">
          Creating your store...
        </p>
      )}
    </div>
  );
}
