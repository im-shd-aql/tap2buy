"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { ChevronDown, ChevronUp } from "lucide-react";

const THEME_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
];

const STORE_CATEGORIES = [
  "Baked Goods", "Handmade", "Thrift / Vintage", "Clothing", "Accessories",
  "Home & Garden", "Art", "Food & Beverages", "Beauty", "Electronics", "Other",
];

const FONT_OPTIONS = [
  { value: "modern", label: "Modern", desc: "Clean, tech-forward (Inter)" },
  { value: "classic", label: "Classic", desc: "Elegant, premium (Playfair)" },
  { value: "playful", label: "Playful", desc: "Friendly, approachable (Nunito)" },
];

function Section({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-left font-medium text-sm"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 py-4 space-y-4">{children}</div>}
    </div>
  );
}

export default function SettingsPage() {
  const { token } = useAuth();
  const { store, refreshStore } = useStore();
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  // Branding
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [customColor, setCustomColor] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [fontStyle, setFontStyle] = useState("modern");

  // About & Content
  const [description, setDescription] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [announcement, setAnnouncement] = useState("");

  // Social Links
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Store Policies
  const [deliveryInfo, setDeliveryInfo] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");

  // Store Status
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (store) {
      setName(store.name);
      setCategory(store.category || "");
      setDescription(store.description || "");
      setThemeColor(store.themeColor);
      setLogoUrl(store.logoUrl || "");
      setBannerUrl(store.bannerUrl || "");
      setFontStyle(store.fontStyle || "modern");
      setAboutText(store.aboutText || "");
      setAnnouncement(store.announcement || "");
      setInstagram(store.socialLinks?.instagram || "");
      setFacebook(store.socialLinks?.facebook || "");
      setTiktok(store.socialLinks?.tiktok || "");
      setWhatsappNumber(store.whatsappNumber || "");
      setDeliveryInfo(store.deliveryInfo || "");
      setReturnPolicy(store.returnPolicy || "");
      setIsActive(store.isActive);
      // check if color is a preset
      if (!THEME_COLORS.includes(store.themeColor)) {
        setCustomColor(store.themeColor);
      }
    }
  }, [store]);

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    try {
      const { url } = await api.upload(file, token);
      setter(url);
    } catch {
      setError("Image upload failed");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!store || !token) return;
    setSaving(true);
    setError("");
    setSuccess(false);

    const socialLinks: Record<string, string> = {};
    if (instagram) socialLinks.instagram = instagram;
    if (facebook) socialLinks.facebook = facebook;
    if (tiktok) socialLinks.tiktok = tiktok;

    try {
      await api.put(
        `/api/stores/${store.id}`,
        {
          name,
          category: category || undefined,
          description: description || undefined,
          themeColor,
          logoUrl: logoUrl || undefined,
          bannerUrl: bannerUrl || null,
          announcement: announcement || null,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
          aboutText: aboutText || null,
          deliveryInfo: deliveryInfo || null,
          returnPolicy: returnPolicy || null,
          whatsappNumber: whatsappNumber || null,
          fontStyle,
          isActive,
        },
        { token }
      );
      await refreshStore();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-5">Store Settings</h1>

      <form onSubmit={handleSave} className="space-y-3">
        {/* Section 1: Branding */}
        <Section title="Branding" defaultOpen>
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium mb-2">Logo</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="w-[72px] h-[72px] rounded-xl border flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0"
                onClick={() => logoRef.current?.click()}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-300 text-xs">Upload</span>
                )}
              </button>
              <input ref={logoRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setLogoUrl)} className="hidden" />
              <p className="text-xs text-gray-400">Tap to upload your store logo</p>
            </div>
          </div>

          {/* Banner */}
          <div>
            <label className="block text-sm font-medium mb-2">Banner Image</label>
            <button
              type="button"
              className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden hover:border-indigo-400"
              onClick={() => bannerRef.current?.click()}
            >
              {bannerUrl ? (
                <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm">Click to upload banner (1200x400 recommended)</span>
              )}
            </button>
            <input ref={bannerRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBannerUrl)} className="hidden" />
            {bannerUrl && (
              <button type="button" onClick={() => setBannerUrl("")} className="text-xs text-red-500 mt-1">
                Remove banner
              </button>
            )}
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Store Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Select a category</option>
              {STORE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Theme Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Theme Color</label>
            <div className="flex gap-3 flex-wrap items-center">
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => { setThemeColor(color); setCustomColor(""); }}
                  className={`w-11 h-11 rounded-full border-2 transition-transform ${
                    themeColor === color && !customColor ? "border-gray-900 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor || themeColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setThemeColor(e.target.value);
                  }}
                  className="w-11 h-11 rounded-full border-2 border-gray-300 cursor-pointer p-0.5"
                />
                <span className="text-xs text-gray-400">Custom</span>
              </div>
            </div>
          </div>

          {/* Font Style */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Style</label>
            <div className="grid grid-cols-3 gap-2">
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font.value}
                  type="button"
                  onClick={() => setFontStyle(font.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    fontStyle === font.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-sm">{font.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{font.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Section 2: About & Content */}
        <Section title="About & Content">
          <div>
            <label className="block text-sm font-medium mb-1.5">Short Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Shown in the store header"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">About Your Store</label>
            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              rows={4}
              placeholder="Tell your story — buyers will see this in the About section"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Announcement Bar</label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="e.g. Free delivery on orders over LKR 2,000!"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty to hide</p>
          </div>
        </Section>

        {/* Section 3: Social Links */}
        <Section title="Social Links">
          <div>
            <label className="block text-sm font-medium mb-1.5">Instagram</label>
            <input
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/yourstore"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Facebook</label>
            <input
              type="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/yourstore"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">TikTok</label>
            <input
              type="url"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="https://tiktok.com/@yourstore"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">WhatsApp Number</label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="94771234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">Country code without +, e.g. 94771234567</p>
          </div>
        </Section>

        {/* Section 4: Store Policies */}
        <Section title="Store Policies">
          <div>
            <label className="block text-sm font-medium mb-1.5">Delivery Info</label>
            <textarea
              value={deliveryInfo}
              onChange={(e) => setDeliveryInfo(e.target.value)}
              rows={3}
              placeholder="e.g. We deliver island-wide within 3-5 days..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Return Policy</label>
            <textarea
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              rows={3}
              placeholder="e.g. Returns accepted within 7 days..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </Section>

        {/* Section 5: Store Status */}
        <Section title="Store Status">
          <label className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <div>
              <span className="text-sm font-medium">Store Active</span>
              <p className="text-xs text-gray-400">When off, your store page is hidden from buyers</p>
            </div>
          </label>

          {store && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Your store URL</p>
              <p className="font-mono text-sm break-all">tap2buy.lk/{store.slug}</p>
            </div>
          )}
        </Section>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Settings saved!</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-base hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
