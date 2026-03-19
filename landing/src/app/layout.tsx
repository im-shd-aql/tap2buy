import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LangProvider } from "@/context/LangContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tap2buy.lk"),
  title: "Tap2Buy — Your Social Media. Now a Store.",
  description:
    "Create your online store in 60 seconds. Free. No coding. PayHere payments built-in. Built for Sri Lankan micro-sellers on Instagram, Facebook & WhatsApp.",
  keywords: [
    "online store Sri Lanka",
    "sell on Instagram Sri Lanka",
    "ecommerce Sri Lanka",
    "PayHere store",
    "social media store",
    "micro-seller Sri Lanka",
    "free online store",
    "Tap2Buy",
  ],
  openGraph: {
    title: "Tap2Buy — Your Social Media. Now a Store.",
    description:
      "Create your online store in 60 seconds. Free. No coding. PayHere payments built-in.",
    type: "website",
    locale: "en_US",
    url: "https://tap2buy.lk",
    siteName: "Tap2Buy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tap2Buy — Your Social Media. Now a Store.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tap2Buy — Your Social Media. Now a Store.",
    description:
      "Create your online store in 60 seconds. Free. No coding. PayHere payments built-in.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  alternates: {
    canonical: "https://tap2buy.lk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FF6B35" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Tap2Buy",
              url: "https://tap2buy.lk",
              logo: "https://tap2buy.lk/icon-512.png",
              description:
                "Create your online store in 60 seconds. Free. No coding. PayHere payments built-in. Built for Sri Lankan micro-sellers.",
              contactPoint: {
                "@type": "ContactPoint",
                email: "hello@tap2buy.lk",
                contactType: "customer service",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Tap2Buy",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: "https://tap2buy.lk",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "LKR",
              },
              description:
                "Social media-to-store platform for Sri Lankan micro-sellers. Accept payments via PayHere.",
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <LangProvider>{children}</LangProvider>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
