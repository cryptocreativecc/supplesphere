import { ImageResponse } from "next/og";
import { mockSources } from "@/lib/mock-data";

export const runtime = "edge";
export const alt = "Source Reviews on SuppleSphere";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const source = mockSources.find((s) => s.slug === slug);
  const name = source?.name || slug.replace(/-/g, " ");
  const rating = source?.avgRating || 0;
  const reviewCount = source?.reviewCount || 0;

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
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "#14b8a6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            fontWeight: 700,
            color: "white",
            marginBottom: "24px",
          }}
        >
          {name.charAt(0)}
        </div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "white",
            marginBottom: "12px",
          }}
        >
          {name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{
                fontSize: "32px",
                color: star <= Math.round(rating) ? "#fbbf24" : "#475569",
              }}
            >
              ★
            </span>
          ))}
          <span style={{ fontSize: "28px", color: "white", marginLeft: "8px" }}>
            {rating.toFixed(1)}
          </span>
        </div>
        <div style={{ fontSize: "20px", color: "#94a3b8" }}>
          {reviewCount} community reviews on SuppleSphere
        </div>
      </div>
    ),
    { ...size }
  );
}
