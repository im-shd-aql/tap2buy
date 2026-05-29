"use client";

interface StoreNameStepProps {
  storeName: string;
  setStoreName: (name: string) => void;
  onNext: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function StoreNameStep({
  storeName,
  setStoreName,
  onNext,
}: StoreNameStepProps) {
  const slug = slugify(storeName);
  const isValid = storeName.trim().length >= 2;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isValid) onNext();
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-1">What&apos;s your store name?</h2>
      <p className="text-gray-500 mb-6 text-sm">
        This is what customers will see when they visit
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g. Nira's Cakes, Style Hub, Fresh Bites"
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            autoFocus
            maxLength={100}
          />
        </div>

        {/* Live URL preview */}
        {storeName.trim().length > 0 && (
          <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Your store URL</p>
            <p className="text-sm font-mono">
              <span className="text-gray-400">tap2buy.lk/</span>
              <span className="text-indigo-600 font-semibold">
                {slug || "your-store"}
              </span>
            </p>
          </div>
        )}

        {/* Info notice */}
        <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
          <p className="text-xs text-blue-700">
            💡 You can change your store name up to 3 times per year. Choose carefully!
          </p>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          Next
        </button>
      </form>
    </div>
  );
}
