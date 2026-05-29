"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { Camera } from "lucide-react";

interface LogoStepProps {
  storeName: string;
  storeId: string;
  token: string;
  onNext: (logoUrl?: string) => void;
}

export default function LogoStep({
  storeName,
  storeId,
  token,
  onNext,
}: LogoStepProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const initial = storeName.trim().charAt(0).toUpperCase() || "S";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const { url } = await api.upload(file, token);
      await api.put(`/api/stores/${storeId}`, { logoUrl: url }, { token });
      onNext(url);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
      setUploading(false);
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-1">Make your store stand out</h2>
      <p className="text-gray-500 mb-8 text-sm">
        Add a logo to help customers recognize your brand
      </p>

      <div className="flex flex-col items-center gap-5">
        {/* Upload area */}
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors"
        >
          {preview ? (
            <img
              src={preview}
              alt="Logo preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-gradient-shift flex items-center justify-center">
              <span className="text-white text-3xl font-bold">{initial}</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
            <Camera className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <p className="text-xs text-gray-400">Tap to upload your logo</p>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="mt-8 space-y-3">
        {preview && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {uploading ? "Uploading..." : "Use This Logo"}
          </button>
        )}

        <button
          onClick={() => onNext()}
          disabled={uploading}
          className="w-full py-3.5 text-gray-600 bg-gray-100 rounded-xl font-medium text-base hover:bg-gray-200 disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
