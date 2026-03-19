"use client";

import { useState } from "react";
import { X, Megaphone } from "lucide-react";

export default function AnnouncementBar({
  text,
  themeColor,
}: {
  text: string;
  themeColor: string;
}) {
  const [dismissing, setDismissing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  function handleDismiss() {
    setDismissing(true);
    setTimeout(() => setDismissed(true), 300);
  }

  return (
    <div
      className={`relative text-white text-center text-sm py-2.5 px-10 ${dismissing ? "animate-slide-out-up" : ""}`}
      style={{ backgroundColor: themeColor }}
    >
      <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70" />
      <span className="font-medium">{text}</span>
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
