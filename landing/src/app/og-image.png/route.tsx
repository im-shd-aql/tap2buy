import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FF6B35 0%, #FF8F5E 50%, #FFB088 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 800,
              color: "white",
            }}
          >
            T
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "white",
            }}
          >
            Tap2Buy
          </span>
        </div>
        <div
          style={{
            fontSize: "32px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            maxWidth: "600px",
          }}
        >
          Your Social Media. Now a Store.
        </div>
        <div
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.7)",
            marginTop: "16px",
          }}
        >
          Free online store for Sri Lankan sellers
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
