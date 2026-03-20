import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, MessageCircle, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import CartBadge from "./cart-badge";
import AnnouncementBar from "./announcement-bar";
import StoreContent from "./store-content";
import StickyHeader from "./sticky-header";
import BackToTop from "./back-to-top";
import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tap2buy.lk";

interface Product {
  id: string;
  name: string;
  price: string;
  comparePrice: string | null;
  images: string[];
  stock: number | null;
  isActive: boolean;
  category: string | null;
  isFeatured: boolean;
  badge: string | null;
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  tiktok?: string;
}

interface Store {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  logoUrl: string | null;
  themeColor: string;
  bannerUrl: string | null;
  announcement: string | null;
  socialLinks: SocialLinks | null;
  aboutText: string | null;
  deliveryInfo: string | null;
  returnPolicy: string | null;
  whatsappNumber: string | null;
  fontStyle: string | null;
  products: Product[];
}

async function getStore(slug: string): Promise<Store | null> {
  try {
    const res = await fetch(`${API_URL}/api/stores/${slug}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.store;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ store: string }>;
}): Promise<Metadata> {
  const { store: slug } = await params;
  const store = await getStore(slug);
  if (!store) return { title: "Store Not Found" };

  return {
    title: `${store.name} | Tap2Buy`,
    description: store.description || `Shop ${store.name} on Tap2Buy — ${store.category || "Online Store"}`,
    openGraph: {
      title: store.name,
      description: store.description || `Shop ${store.name} on Tap2Buy`,
      url: `${SITE_URL}/${store.slug}`,
      siteName: "Tap2Buy",
      ...(store.bannerUrl
        ? { images: [{ url: store.bannerUrl, width: 1200, height: 400 }] }
        : store.logoUrl
          ? { images: [{ url: store.logoUrl, width: 200, height: 200 }] }
          : {}),
    },
  };
}

function SocialIcon({ type, url }: { type: string; url: string }) {
  const icons: Record<string, React.ReactNode> = {
    instagram: <Instagram className="w-5 h-5" />,
    facebook: <Facebook className="w-5 h-5" />,
    tiktok: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.71a8.2 8.2 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.14z" />
      </svg>
    ),
  };
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
    >
      {icons[type] || null}
    </a>
  );
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = await params;
  const store = await getStore(slug);

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-3xl">🏪</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Store not found</h1>
          <p className="text-gray-500">This store doesn&apos;t exist or is inactive.</p>
        </div>
      </div>
    );
  }

  const socialEntries = store.socialLinks
    ? Object.entries(store.socialLinks).filter(([, v]) => v)
    : [];

  const whatsappLink = store.whatsappNumber
    ? `https://wa.me/${store.whatsappNumber}`
    : `https://wa.me/?text=${encodeURIComponent(
        `Check out ${store.name} on Tap2Buy: https://tap2buy.lk/${store.slug}`
      )}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <StickyHeader
        storeName={store.name}
        storeSlug={store.slug}
        logoUrl={store.logoUrl}
        themeColor={store.themeColor}
      />
      <BackToTop />

      {/* Announcement Bar */}
      {store.announcement && (
        <AnnouncementBar text={store.announcement} themeColor={store.themeColor} />
      )}

      {/* Hero Section */}
      <header className="relative text-white overflow-hidden">
        {store.bannerUrl ? (
          /* Banner variant */
          <div className="relative">
            <div className="relative w-full h-52 sm:h-64">
              <Image
                src={store.bannerUrl}
                alt={`${store.name} banner`}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${store.themeColor} 0%, ${store.themeColor}99 35%, transparent 70%)`,
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
              <div className="max-w-3xl mx-auto flex items-end justify-between">
                <div className="flex items-center gap-3.5">
                  {store.logoUrl && (
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl bg-white/15 backdrop-blur-md ring-1 ring-white/10 flex-shrink-0">
                      <Image
                        src={store.logoUrl}
                        alt={store.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight drop-shadow-md">{store.name}</h1>
                    {store.category && (
                      <p className="text-sm opacity-90 mt-0.5">{store.category}</p>
                    )}
                  </div>
                </div>
                <CartBadge slug={store.slug} themeColor={store.themeColor} />
              </div>
            </div>
          </div>
        ) : (
          /* Gradient variant (no banner) */
          <div
            className="px-4 py-10 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${store.themeColor} 0%, ${store.themeColor}bb 50%, ${store.themeColor}88 100%)`,
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-8 w-24 h-24 rounded-full opacity-[0.07] bg-white" />
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                {store.logoUrl && (
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl bg-white/15 backdrop-blur-md ring-1 ring-white/10 flex-shrink-0">
                    <Image
                      src={store.logoUrl}
                      alt={store.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{store.name}</h1>
                  {store.category && (
                    <p className="text-sm opacity-90 mt-0.5">{store.category}</p>
                  )}
                </div>
              </div>
              <CartBadge slug={store.slug} themeColor={store.themeColor} />
            </div>
          </div>
        )}
        {/* Description + Social links row below hero */}
        {(store.description || socialEntries.length > 0) && (
          <div
            className="px-4 py-3 border-t border-white/15"
            style={{ backgroundColor: store.themeColor }}
          >
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              {store.description && (
                <p className="text-sm opacity-90 flex-1">{store.description}</p>
              )}
              {socialEntries.length > 0 && (
                <div className="flex gap-2 flex-shrink-0">
                  {socialEntries.map(([type, url]) => (
                    <SocialIcon key={type} type={type} url={url as string} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Interactive content: Search, Categories, Featured, Grid */}
      <StoreContent
        products={store.products}
        storeId={store.id}
        storeSlug={store.slug}
        themeColor={store.themeColor}
      />

      {/* About Section */}
      {store.aboutText && (
        <section className="max-w-3xl mx-auto px-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-100 border-l-4" style={{ borderLeftColor: store.themeColor }}>
            <div className="flex items-center gap-3 mb-3">
              {store.logoUrl && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={store.logoUrl}
                    alt={store.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-bold text-sm">About {store.name}</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {store.aboutText}
            </p>
          </div>
        </section>
      )}

      {/* Store Info Footer */}
      {(store.deliveryInfo || store.returnPolicy) && (
        <section className="max-w-3xl mx-auto px-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-100 space-y-4">
            {store.deliveryInfo && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Delivery</h4>
                  <p className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">
                    {store.deliveryInfo}
                  </p>
                </div>
              </div>
            )}
            {store.returnPolicy && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Returns</h4>
                  <p className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">
                    {store.returnPolicy}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* WhatsApp FAB */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-5 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-10"
        style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Footer */}
      <footer className="text-center py-8 space-y-4">
        {socialEntries.length > 0 && (
          <div className="flex justify-center gap-2">
            {socialEntries.map(([type, url]) => (
              <a
                key={type}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 hover:shadow-sm hover:scale-105 transition-all duration-200"
              >
                {type === "instagram" && <Instagram className="w-4 h-4" />}
                {type === "facebook" && <Facebook className="w-4 h-4" />}
                {type === "tiktok" && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.71a8.2 8.2 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.14z" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        )}
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Powered by{" "}
          <a href="https://tap2buy.lk" className="font-medium hover:text-gray-500 underline decoration-gray-300 underline-offset-2 transition-colors">
            Tap2Buy
          </a>
        </div>
      </footer>
    </div>
  );
}
