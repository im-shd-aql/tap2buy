"use client";

import Link from "next/link";
import { Store, ShoppingBag, CreditCard, Truck } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center px-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Start selling online
          <br />
          in minutes
        </h1>
        <p className="text-gray-500 mt-3 text-base">
          No website. No coding. No payment gateway needed.
        </p>
      </div>

      {/* Storefront preview mockup */}
      <div className="w-full max-w-xs mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="h-20 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="p-4">
            <div className="text-sm font-semibold text-gray-800 mb-3">Your Store Name</div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-2">
                  <div className="w-full aspect-square bg-gray-200 rounded-md mb-1.5" />
                  <div className="h-2 bg-gray-200 rounded w-3/4 mb-1" />
                  <div className="h-2 bg-indigo-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: ShoppingBag, label: "Products" },
          { icon: CreditCard, label: "Payments" },
          { icon: Truck, label: "Delivery" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
              <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-xs py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all"
      >
        Create My Store
      </button>

      <p className="text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-indigo-600 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
