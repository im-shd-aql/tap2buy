"use client";

import { useLang } from "@/hooks/useLang";

export default function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center rounded-full bg-warm-100 p-0.5 text-sm font-medium">
      <button
        onClick={() => setLang("en")}
        className={`rounded-full px-3 py-1 transition-all ${
          lang === "en"
            ? "bg-primary text-white shadow-sm"
            : "text-muted hover:text-dark"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("si")}
        className={`rounded-full px-3 py-1 transition-all ${
          lang === "si"
            ? "bg-primary text-white shadow-sm"
            : "text-muted hover:text-dark"
        }`}
      >
        සිං
      </button>
    </div>
  );
}
