"use client";

import { useState, useCallback } from "react";
import { Share2, X, Link2, MessageCircle, Facebook, Check } from "lucide-react";

export default function ShareSheet({
  productName,
  productUrl,
  shareText,
}: {
  productName: string;
  productUrl: string;
  shareText: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: productUrl,
        });
        return;
      } catch {
        // User cancelled or not supported — fall through to sheet
      }
    }
    setOpen(true);
  }, [productName, productUrl, shareText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [productUrl]);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}: ${productUrl}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;

  return (
    <>
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {/* Bottom sheet overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div
            className="relative bg-white w-full max-w-lg rounded-t-2xl p-5 pb-8 animate-toast-in safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base">Share this product</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Copy Link */}
              <button
                onClick={handleCopy}
                className="flex flex-col items-center gap-2 py-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${copied ? "bg-emerald-100" : "bg-gray-100"}`}>
                  {copied ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Link2 className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {copied ? "Copied!" : "Copy Link"}
                </span>
              </button>

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 py-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <span className="text-xs font-medium text-gray-600">WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 py-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-[#1877F2]" />
                </div>
                <span className="text-xs font-medium text-gray-600">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
