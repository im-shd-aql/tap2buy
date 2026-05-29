"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Store } from "lucide-react";

const CONFETTI_COLORS = [
  "bg-indigo-500",
  "bg-pink-500",
  "bg-yellow-400",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-blue-400",
  "bg-red-500",
  "bg-orange-400",
  "bg-teal-400",
  "bg-indigo-400",
  "bg-pink-400",
  "bg-emerald-400",
  "bg-yellow-500",
  "bg-violet-500",
  "bg-cyan-400",
];

interface ReadyStepProps {
  storeName: string;
  storeSlug: string;
  logoUrl: string | null;
}

export default function ReadyStep({
  storeName,
  storeSlug,
  logoUrl,
}: ReadyStepProps) {
  const [copied, setCopied] = useState(false);
  const storeUrl = `tap2buy.lk/${storeSlug}`;
  const initial = storeName.trim().charAt(0).toUpperCase() || "S";

  function copyUrl() {
    navigator.clipboard.writeText(`https://${storeUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `Check out my new online store: https://${storeUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="flex flex-col items-center text-center px-2 relative">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {CONFETTI_COLORS.map((color, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${color} animate-confetti`}
            style={{
              left: `${8 + (i * 6) % 84}%`,
              top: `${-5 - (i % 3) * 5}%`,
              animationDelay: `${i * 0.08}s`,
              animationDuration: `${1 + (i % 4) * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Checkmark */}
      <div className="animate-scale-circle mb-4">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-8 h-8">
            <path
              d="M5 13l4 4L19 7"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-checkmark"
            />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2 animate-fade-up">
        Your store is ready!
      </h2>
      <p className="text-gray-500 mb-6 text-sm animate-fade-up" style={{ animationDelay: "0.1s" }}>
        Share your store link and start receiving orders
      </p>

      {/* Store preview card */}
      <div className="w-full max-w-xs mb-6 animate-celebrate">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="h-16 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
            ) : (
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">{initial}</span>
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm">{storeName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{storeUrl}</p>
          </div>
        </div>
      </div>

      {/* Copy URL */}
      <div className="w-full max-w-xs mb-6">
        <button
          onClick={copyUrl}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <span className="text-sm font-mono text-gray-700 truncate">
            {storeUrl}
          </span>
          {copied ? (
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-2" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
          )}
        </button>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={shareWhatsApp}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Share on WhatsApp
        </button>

        <a
          href={`/${storeSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View Store
        </a>

        <a
          href="/dashboard"
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Store className="w-4 h-4" />
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
