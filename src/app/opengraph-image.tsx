import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SuppleSphere — Community Supplement Reviews & Source Ratings";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
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
              background: "#14b8a6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
              color: "white",
            }}
          >
            S
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "white",
            }}
          >
            SuppleSphere
          </span>
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            maxWidth: "600px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Community-driven supplement reviews, source ratings, and deals
        </div>
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            gap: "16px",
          }}
        >
          {["⭐ Reviews", "🏪 Sources", "💊 Supplements", "🔥 Deals"].map(
            (item) => (
              <div
                key={item}
                style={{
                  background: "rgba(20, 184, 166, 0.15)",
                  border: "1px solid rgba(20, 184, 166, 0.3)",
                  borderRadius: "999px",
                  padding: "8px 20px",
                  fontSize: "16px",
                  color: "#5eead4",
                }}
              >
                {item}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
