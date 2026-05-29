"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { MapPin, Globe, Package } from "lucide-react";

const DELIVERY_OPTIONS = [
  { id: "colombo", label: "Colombo Only", icon: MapPin },
  { id: "island", label: "Island-wide", icon: Globe },
  { id: "pickup", label: "Pickup Available", icon: Package },
];

interface DeliveryStepProps {
  storeId: string;
  token: string;
  onNext: () => void;
}

export default function DeliveryStep({
  storeId,
  token,
  onNext,
}: DeliveryStepProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleOption(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      // Build delivery info text
      const parts: string[] = [];
      if (selected.includes("colombo")) parts.push("Colombo delivery available");
      if (selected.includes("island")) parts.push("Island-wide delivery");
      if (selected.includes("pickup")) parts.push("Pickup available");
      if (deliveryFee && parseFloat(deliveryFee) > 0) {
        parts.push(`Delivery fee: LKR ${parseFloat(deliveryFee).toFixed(0)}`);
      }
      if (parts.length === 0) parts.push("Contact seller for delivery details");

      const deliveryInfo = parts.join(". ") + ".";

      await api.put(
        `/api/stores/${storeId}`,
        { deliveryInfo },
        { token }
      );

      onNext();
    } catch (err: any) {
      setError(err.message || "Failed to save. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-1">Set up delivery</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Let customers know how they can get their orders
      </p>

      <div className="space-y-3 mb-5">
        {DELIVERY_OPTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => toggleOption(id)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
              selected.includes(id)
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                selected.includes(id) ? "text-indigo-600" : "text-gray-400"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                selected.includes(id) ? "text-indigo-700" : "text-gray-700"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Delivery fee */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-1.5">
          Delivery fee (optional)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            LKR
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-all"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}
