"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  ExternalLink,
  Copy,
  Check,
  Share2,
  Wallet,
  LogOut,
  Store,
  Info,
  Lock,
  Crown,
} from "lucide-react";
import { useRouter } from "next/navigation";

const THEME_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
];

const STORE_CATEGORIES = [
  "Baked Goods", "Handmade", "Thrift / Vintage", "Clothing", "Accessories",
  "Home & Garden", "Art", "Food & Beverages", "Beauty", "Electronics", "Other",
];

const FONT_OPTIONS = [
  { value: "modern", label: "Modern", desc: "Clean (Inter)" },
  { value: "classic", label: "Classic", desc: "Elegant (Playfair)" },
  { value: "playful", label: "Playful", desc: "Friendly (Nunito)" },
];

export default function StorePage() {
  const { token, logout } = useAuth();
  const { store, refreshStore } = useStore();
  const router = useRouter();
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
  const [copied, setCopied] = useState(false);

  // Brand settings limits from API
  const [nameChangesRemaining, setNameChangesRemaining] = useState(3);
  const [categoryCanChange, setCategoryCanChange] = useState(true);
  const [categoryNextChange, setCategoryNextChange] = useState<Date | null>(null);
  const [limitsLoaded, setLimitsLoaded] = useState(false);

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
      if (!THEME_COLORS.includes(store.themeColor)) {
        setCustomColor(store.themeColor);
      }
    }
  }, [store]);

  // Fetch brand settings limits
  useEffect(() => {
    async function fetchLimits() {
      if (!token) return;
      try {
        const response = await api.get<{
          limits: {
            name: { remaining: number; total: number; resetsAt: string };
            category: { canChange: boolean; nextChangeAt: string | null; cooldownDays: number };
          };
        }>("/api/stores/me/store/limits", { token });
        setNameChangesRemaining(response.limits.name.remaining);
        setCategoryCanChange(response.limits.category.canChange);
        if (response.limits.category.nextChangeAt) {
          setCategoryNextChange(new Date(response.limits.category.nextChangeAt));
        }
        setLimitsLoaded(true);
      } catch (err) {
        console.error("Failed to fetch limits:", err);
      }
    }
    fetchLimits();
  }, [token]);

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

  function copyLink() {
    if (!store) return;
    navigator.clipboard.writeText(`https://tap2buy.lk/${store.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!store) return;
    const url = `https://tap2buy.lk/${store.slug}`;
    const text = encodeURIComponent(`Check out my store on Tap2Buy!\n${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function shareNative() {
    if (!store) return;
    const url = `https://tap2buy.lk/${store.slug}`;
    if (navigator.share) {
      navigator.share({ title: store.name, text: `Check out ${store.name} on Tap2Buy!`, url });
    } else {
      copyLink();
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      <h1 className="text-lg font-bold text-gray-900 mb-4">Store Settings</h1>

      {/* Store Preview Card */}
      {store && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="w-14 h-14 rounded-xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Store className="w-6 h-6 text-indigo-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{name || store.name}</p>
              <p className="text-xs text-gray-400 font-mono truncate">tap2buy.lk/{store.slug}</p>
            </div>
            <Link
              href={`/${store.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium active:scale-[0.98] transition-transform"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* ====== GENERAL SETTINGS ====== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-sm text-gray-900">General Settings</h2>
            <p className="text-xs text-gray-500 mt-0.5">Update anytime</p>
          </div>
          <div className="p-4 space-y-4">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0 hover:border-indigo-300"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
              <button
                type="button"
                className="w-full h-28 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden hover:border-indigo-300"
                onClick={() => bannerRef.current?.click()}
              >
                {bannerUrl ? (
                  <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">Click to upload banner</span>
                )}
              </button>
              <input ref={bannerRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBannerUrl)} className="hidden" />
              {bannerUrl && (
                <button type="button" onClick={() => setBannerUrl("")} className="text-xs text-red-500 mt-1">
                  Remove banner
                </button>
              )}
            </div>

            {/* Theme Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
              <div className="flex gap-2.5 flex-wrap items-center">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => { setThemeColor(color); setCustomColor(""); }}
                    className={`w-9 h-9 rounded-full border-2 transition-transform ${
                      themeColor === color && !customColor ? "border-gray-900 scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={customColor || themeColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setThemeColor(e.target.value);
                  }}
                  className="w-9 h-9 rounded-full border-2 border-gray-200 cursor-pointer p-0.5"
                />
              </div>
            </div>

            {/* Font Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
              <div className="grid grid-cols-3 gap-2">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() => setFontStyle(font.value)}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                      fontStyle === font.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-100 active:border-gray-200"
                    }`}
                  >
                    <p className="font-medium text-xs">{font.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{font.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Shown in the store header"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* About */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">About Your Store</label>
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                rows={3}
                placeholder="Tell your story"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Announcement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Announcement Bar</label>
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="e.g. Free delivery on orders over LKR 2,000!"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty to hide</p>
            </div>

            {/* Social Links */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Social Links</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/yourstore"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Facebook</label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/yourstore"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">TikTok</label>
                <input
                  type="url"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="https://tiktok.com/@yourstore"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="94771234567"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-400 mt-1">Country code without +</p>
              </div>
            </div>

            {/* Delivery & Return */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Policies</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Info</label>
                <textarea
                  value={deliveryInfo}
                  onChange={(e) => setDeliveryInfo(e.target.value)}
                  rows={2}
                  placeholder="e.g. We deliver island-wide within 3-5 days..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Return Policy</label>
                <textarea
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  rows={2}
                  placeholder="e.g. Returns accepted within 7 days..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Store Status */}
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Store Status</h3>
              <label className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      isActive ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${
                        isActive ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">Store Active</span>
                  <p className="text-xs text-gray-400">When off, your store is hidden from buyers</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ====== BRAND SETTINGS ====== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
            <h2 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600" />
              Brand Settings
            </h2>
            <p className="text-xs text-amber-700 mt-0.5">Limited changes to protect your brand</p>
          </div>
          <div className="p-4 space-y-4">
            {/* Store Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Store Name</label>
                <span className="text-xs text-amber-600 font-medium">
                  {nameChangesRemaining} changes remaining in 2026
                </span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                {limitsLoaded && (
                  categoryNextChange ? (
                    <span className="text-xs text-red-600 font-medium">
                      Next change: {categoryNextChange.toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Change once per 30 days</span>
                  )
                )}
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={!categoryCanChange}
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white ${
                  !categoryCanChange ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Select a category</option>
                {STORE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {!categoryCanChange && categoryNextChange && (
                <p className="text-xs text-red-600 mt-1.5">
                  Category is locked. You can change it again on {categoryNextChange.toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Store URL Info (read-only display) */}
            {store && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Store URL</label>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
                  <span className="text-sm font-mono truncate flex-1 text-gray-700">
                    tap2buy.lk/{store.slug}
                  </span>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white active:scale-95 transition-transform"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  URL changes can break existing links. Contact support if needed.
                </p>
              </div>
            )}

            {/* Share buttons */}
            {store && (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={shareWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 text-white rounded-xl text-xs font-medium active:scale-[0.98] transition-transform"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share on WhatsApp
                </button>
                <button
                  type="button"
                  onClick={shareNative}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 active:scale-[0.98] transition-transform"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ====== ACCOUNT SETTINGS ====== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-red-50 border-b border-red-100">
            <h2 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600" />
              Account Settings
            </h2>
            <p className="text-xs text-red-700 mt-0.5">Contact support to modify</p>
          </div>
          <div className="p-4 space-y-3">
            {store && (
              <>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Store ID</span>
                  <span className="text-sm font-mono text-gray-400">{store.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Owner Account</span>
                  <span className="text-sm text-gray-900">Locked</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm text-gray-400">
                    {new Date(store.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Subscription & Payments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <h2 className="font-semibold text-sm text-gray-900">Subscription & Payments</h2>
          <Link
            href="/dashboard/subscription"
            className="flex items-center justify-between p-3 bg-purple-50 rounded-xl active:bg-purple-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Crown className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Manage Plan</span>
            </div>
            <span className="text-purple-600 text-sm font-medium">View</span>
          </Link>
          <Link
            href="/dashboard/wallet"
            className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl active:bg-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Wallet className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-900">Manage Wallet</span>
            </div>
            <span className="text-indigo-600 text-sm font-medium">View</span>
          </Link>
        </div>

        {/* Error / Success */}
        {error && (
          <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm bg-green-50 rounded-xl px-4 py-2.5">Settings saved!</p>
        )}

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-gray-700 active:bg-gray-100 rounded-2xl transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
