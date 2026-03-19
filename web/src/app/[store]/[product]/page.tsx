import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "./add-to-cart";
import ImageGallery from "./image-gallery";
import ShareSheet from "./share-sheet";
import RecentlyViewedTracker from "./recently-viewed-tracker";
import Link from "next/link";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tap2buy.lk";

interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  price: string;
  comparePrice: string | null;
  images: string[];
  variants: any;
  stock: number | null;
  badge: string | null;
  category: string | null;
}

interface Store {
  id: string;
  slug: string;
  name: string;
  themeColor: string;
  whatsappNumber: string | null;
  products: Product[];
}

const BADGE_DISPLAY: Record<string, { bg: string; label: string }> = {
  new: { bg: "bg-emerald-100 text-emerald-700", label: "New Arrival" },
  sale: { bg: "bg-red-100 text-red-700", label: "On Sale" },
  limited: { bg: "bg-amber-100 text-amber-700", label: "Limited Edition" },
};

async function getProduct(storeSlug: string, productId: string) {
  try {
    const storeRes = await fetch(`${API_URL}/api/stores/${storeSlug}`, {
      next: { revalidate: 30 },
    });
    if (!storeRes.ok) return null;
    const { store } = await storeRes.json();

    const res = await fetch(
      `${API_URL}/api/stores/${store.id}/products/${productId}`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return { product: data.product as Product, store: store as Store };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ store: string; product: string }>;
}): Promise<Metadata> {
  const { store: storeSlug, product: productId } = await params;
  const data = await getProduct(storeSlug, productId);
  if (!data) return { title: "Product Not Found" };

  const { product, store } = data;
  const price = `LKR ${Number(product.price).toLocaleString()}`;

  return {
    title: `${product.name} — ${price} | ${store.name}`,
    description: product.description || `${product.name} for ${price} at ${store.name}`,
    openGraph: {
      title: `${product.name} — ${price}`,
      description: product.description || `Shop ${product.name} at ${store.name} on Tap2Buy`,
      url: `${SITE_URL}/${storeSlug}/${productId}`,
      siteName: "Tap2Buy",
      ...(product.images[0] ? { images: [{ url: product.images[0], width: 600, height: 600 }] } : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ store: string; product: string }>;
}) {
  const { store: storeSlug, product: productId } = await params;
  const data = await getProduct(storeSlug, productId);

  if (!data) notFound();

  const { product, store } = data;
  const discount = product.comparePrice
    ? Math.round(
        ((Number(product.comparePrice) - Number(product.price)) /
          Number(product.comparePrice)) *
          100
      )
    : 0;

  const productUrl = `https://tap2buy.lk/${storeSlug}/${productId}`;
  const shareText = `Check out ${product.name} - LKR ${Number(product.price).toLocaleString()} at ${store.name}`;
  const whatsappAskLink = store.whatsappNumber
    ? `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(
        `Hi! I'm interested in "${product.name}" (LKR ${Number(product.price).toLocaleString()}) from your Tap2Buy store: https://tap2buy.lk/${storeSlug}/${productId}`
      )}`
    : null;

  const relatedProducts = (store.products || [])
    .filter((p) => p.id !== product.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  const badgeInfo = product.badge ? BADGE_DISPLAY[product.badge] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <RecentlyViewedTracker
        storeSlug={storeSlug}
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0] || "",
        }}
      />
      {/* Back nav */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={`/${storeSlug}`}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {store.name}
          </Link>
          <ShareSheet
            productName={product.name}
            productUrl={productUrl}
            shareText={shareText}
          />
        </div>
      </div>

      {/* Image gallery */}
      <div className="max-w-3xl mx-auto bg-white">
        <ImageGallery images={product.images} name={product.name} themeColor={store.themeColor} />
      </div>

      {/* Details */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white px-4 pt-5 pb-6 -mt-1">
          {/* Badge */}
          {badgeInfo && (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${badgeInfo.bg}`}>
              {badgeInfo.label}
            </span>
          )}

          <h1 className="text-xl sm:text-2xl font-bold leading-tight">{product.name}</h1>

          {/* Price section */}
          <div className="flex items-baseline gap-3 mt-3">
            <span
              className="text-3xl font-bold"
              style={{ color: store.themeColor }}
            >
              LKR {Number(product.price).toLocaleString()}
            </span>
            {product.comparePrice && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  LKR {Number(product.comparePrice).toLocaleString()}
                </span>
                <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          {product.stock !== null && (
            <div className="mt-2">
              {product.stock > 0 ? (
                <p className="text-sm text-gray-500">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
                  {product.stock} in stock
                </p>
              ) : (
                <p className="text-sm text-red-500 font-medium">Out of stock</p>
              )}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Add to cart */}
        <div className="bg-white px-4 pb-6">
          <AddToCartButton
            storeId={store.id}
            storeSlug={storeSlug}
            product={{
              id: product.id,
              name: product.name,
              price: Number(product.price),
              image: product.images[0] || "",
            }}
            outOfStock={product.stock === 0}
            themeColor={store.themeColor}
          />
        </div>

        {/* WhatsApp Ask */}
        {whatsappAskLink && (
          <div className="px-4 pb-6">
            <a
              href={whatsappAskLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366]/10 text-[#25D366] rounded-2xl text-sm font-semibold hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Ask seller about this product
            </a>
          </div>
        )}
      </div>

      {/* You might also like */}
      {relatedProducts.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 mt-2 mb-4">
          <h3 className="font-bold text-lg mb-4">You might also like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={`/${storeSlug}/${rp.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="aspect-square bg-gray-100 relative">
                  {rp.images[0] ? (
                    <Image
                      src={rp.images[0]}
                      alt={rp.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium line-clamp-2 leading-snug">{rp.name}</p>
                  <p className="text-sm font-bold mt-1.5" style={{ color: store.themeColor }}>
                    LKR {Number(rp.price).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="text-center py-6 pb-28 sm:pb-6">
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Powered by{" "}
          <a href="https://tap2buy.lk" className="underline hover:text-gray-500 transition-colors">
            Tap2Buy
          </a>
        </div>
      </footer>
    </div>
  );
}
