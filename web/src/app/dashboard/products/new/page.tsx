"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Upload, X, ArrowLeft, Star, Tag, Plus, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import Link from "next/link";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import VariantBuilder from "../variant-builder";

const BADGE_OPTIONS = [
  { value: "", label: "None" },
  { value: "new", label: "New" },
  { value: "sale", label: "Sale" },
  { value: "limited", label: "Limited" },
];

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/jpeg",
      0.92
    );
  });
}

async function getRotatedImage(imageSrc: string, rotation: number): Promise<string> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  canvas.width = Math.floor(image.width * cos + image.height * sin);
  canvas.height = Math.floor(image.height * cos + image.width * sin);
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  return canvas.toDataURL("image/jpeg", 0.92);
}

export default function NewProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { token } = useAuth();
  const { store } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [badge, setBadge] = useState("");
  const [useVariants, setUseVariants] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [variantOptions, setVariantOptions] = useState<{name: string; values: string[]}[]>([]);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Cropper state
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (store) {
      api
        .get<{ categories: string[] }>(`/api/stores/${store.id}/categories`)
        .then(({ categories }) => setExistingCategories(categories))
        .catch(() => {});
    }
  }, [store]);

  useEffect(() => {
    if (editId && token && store) {
      api
        .get<{ product: any }>(`/api/stores/${store.id}/products/${editId}`, { token })
        .then(({ product }) => {
          setName(product.name);
          setDescription(product.description || "");
          setPrice(product.price.toString());
          setComparePrice(product.comparePrice?.toString() || "");
          setImages(product.images || []);
          setStock(product.stock?.toString() || "");
          setIsActive(product.isActive);
          setCategory(product.category || "");
          setIsFeatured(product.isFeatured || false);
          setBadge(product.badge || "");

          // Check if product has variants
          if (product.hasVariants && product.productVariants?.length > 0) {
            setUseVariants(true);
            setVariants(product.productVariants.map((v: any) => ({
              id: v.id,
              name: v.name,
              attributes: v.attributes,
              price: Number(v.price),
              comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
              stock: v.stock,
              images: v.images || [],
              isActive: v.isActive,
              sortOrder: v.sortOrder,
            })));
          }
        })
        .catch(() => router.push("/dashboard/products"));
    }
  }, [editId, token, store, router]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  async function handleCropConfirm() {
    if (!cropImage || !croppedAreaPixels || !token) return;
    setUploading(true);
    try {
      let srcForCrop = cropImage;
      if (rotation !== 0) {
        srcForCrop = await getRotatedImage(cropImage, rotation);
      }
      const blob = await getCroppedBlob(srcForCrop, croppedAreaPixels);
      const file = new File([blob], "product-image.jpg", { type: "image/jpeg" });
      const { url } = await api.upload(file, token);
      setImages((prev) => [...prev, url]);
      setCropImage(null);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleCropCancel() {
    setCropImage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !store) return;
    setError("");
    setLoading(true);

    const finalCategory = category === "__new__" ? newCategory : category;

    try {
      if (useVariants && variants.length > 0) {
        // Use lowest variant price as the base product price
        const lowestPrice = Math.min(...variants.map((v) => v.price || 0));
        const productBody = {
          name,
          description: description || undefined,
          price: lowestPrice > 0 ? lowestPrice : parseFloat(price) || 0,
          comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
          images,
          hasVariants: true,
          stock: null, // Variants handle their own stock
          isActive,
          category: finalCategory || null,
          isFeatured,
          badge: badge || null,
        };

        let productId = editId;

        if (editId) {
          // Update existing product
          await api.put(`/api/stores/${store.id}/products/${editId}`, productBody, { token });
        } else {
          // Create new product
          const { product } = await api.post<{ product: { id: string } }>(
            `/api/stores/${store.id}/products`,
            productBody,
            { token }
          );
          productId = product.id;
        }

        // Now handle variants
        if (productId) {
          // Delete all existing variants if editing
          if (editId) {
            const { variants: existingVariants } = await api.get<{ variants: any[] }>(
              `/api/stores/${store.id}/products/${productId}/variants`,
              { token }
            );
            await Promise.all(
              existingVariants.map((v) =>
                api.delete(
                  `/api/stores/${store.id}/products/${productId}/variants/${v.id}`,
                  { token }
                )
              )
            );
          }

          // Create new variants one by one to avoid race conditions
          for (const v of variants) {
            await api.post(
              `/api/stores/${store.id}/products/${productId}/variants`,
              {
                name: v.name,
                attributes: v.attributes,
                price: v.price || 0,
                comparePrice: v.comparePrice != null ? v.comparePrice : undefined,
                stock: v.stock !== undefined ? v.stock : null,
                images: v.images || [],
                isActive: v.isActive !== false,
                sortOrder: v.sortOrder || 0,
              },
              { token }
            );
          }
        }
      } else {
        // Simple product without variants
        const body = {
          name,
          description: description || undefined,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
          images,
          hasVariants: false,
          variants: null,
          stock: stock ? parseInt(stock) : null,
          isActive,
          category: finalCategory || null,
          isFeatured,
          badge: badge || null,
        };

        if (editId) {
          await api.put(`/api/stores/${store.id}/products/${editId}`, body, { token });
        } else {
          await api.post(`/api/stores/${store.id}/products`, body, { token });
        }
      }

      router.push("/dashboard/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <Link
        href="/dashboard/products"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 py-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <h1 className="text-xl sm:text-2xl font-bold mb-5">
        {editId ? "Edit Product" : "Add Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-bold text-base">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium mb-1.5">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Chocolate Cake 1kg"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Rich chocolate cake with cream frosting..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Images</label>
            <div className="flex gap-3 flex-wrap">
              {images.map((url, i) => (
                <div key={i} className="relative w-24 h-24 sm:w-20 sm:h-20">
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover rounded-xl border"
                  />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-24 h-24 sm:w-20 sm:h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-400 active:bg-gray-50"
              >
                <Upload className="w-6 h-6" />
                <span className="text-xs mt-1">{uploading ? "..." : "Add"}</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              <Tag className="w-3.5 h-3.5 inline mr-1" />
              Category <span className="text-gray-400">(optional)</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">No category</option>
              {existingCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__new__">+ Add new category</option>
            </select>
            {category === "__new__" && (
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Badge</label>
            <div className="flex gap-2">
              {BADGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBadge(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    badge === opt.value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Variant Toggle */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100 p-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useVariants}
              onChange={(e) => setUseVariants(e.target.checked)}
              className="w-5 h-5 rounded mt-0.5"
            />
            <div>
              <span className="text-sm font-bold block">This product has multiple variants</span>
              <p className="text-xs text-gray-600 mt-0.5">
                Like different sizes, colors, or styles with their own prices and stock
              </p>
            </div>
          </label>
        </div>

        {/* Pricing & Stock (Simple Product) */}
        {!useVariants && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-bold text-base">Pricing & Inventory</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Price (LKR)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1500"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Was <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="number"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="2000"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Stock <span className="text-gray-400">(leave empty = unlimited)</span>
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Unlimited"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Variant Builder */}
        {useVariants && (
          <VariantBuilder
            basePrice={parseFloat(price) || 0}
            baseStock={stock ? parseInt(stock) : null}
            token={token || ""}
            onChange={(v, opts) => {
              setVariants(v);
              setVariantOptions(opts);
            }}
            initialVariants={variants.length > 0 ? variants : undefined}
            initialOptions={variantOptions.length > 0 ? variantOptions : undefined}
          />
        )}

        {/* Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-bold text-base mb-3">Settings</h2>

          <label className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <div>
              <span className="text-sm flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                Featured Product
              </span>
              <p className="text-xs text-gray-400">Show in the Featured section on your store</p>
            </div>
          </label>

          <label className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm">Visible on store</span>
          </label>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        <button
          type="submit"
          disabled={loading || (useVariants && variants.length === 0)}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          {loading ? "Saving..." : editId ? "Save Changes" : "Add Product"}
        </button>
      </form>

      {/* Image Crop Overlay */}
      {cropImage && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-black/80">
            <button
              onClick={handleCropCancel}
              className="text-white text-sm font-medium py-1 px-2"
            >
              Cancel
            </button>
            <span className="text-white text-sm font-medium">Crop Image</span>
            <button
              onClick={handleCropConfirm}
              disabled={uploading}
              className="text-indigo-400 text-sm font-semibold py-1 px-2 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Done"}
            </button>
          </div>

          <div className="flex-1 relative">
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="rect"
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="bg-black/80 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-3 mb-3">
              <ZoomOut className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-indigo-500 h-1"
              />
              <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="flex items-center gap-1.5 text-gray-300 text-xs font-medium px-4 py-2 rounded-lg active:bg-white/10"
              >
                <RotateCw className="w-4 h-4" />
                Rotate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
