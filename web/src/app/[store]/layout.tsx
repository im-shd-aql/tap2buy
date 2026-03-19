import { Inter, Playfair_Display, Source_Sans_3, Nunito } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getStoreFontStyle(slug: string): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/api/stores/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return "modern";
    const { store } = await res.json();
    return store.fontStyle || "modern";
  } catch {
    return "modern";
  }
}

const FONT_CLASS_MAP: Record<string, string> = {
  modern: "font-sans",
  classic: "font-serif",
  playful: "font-playful",
};

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = await params;
  const fontStyle = await getStoreFontStyle(slug);
  const fontClass = FONT_CLASS_MAP[fontStyle] || "font-sans";

  return (
    <div
      className={`${inter.variable} ${playfair.variable} ${sourceSans.variable} ${nunito.variable} ${fontClass}`}
    >
      {children}
    </div>
  );
}
