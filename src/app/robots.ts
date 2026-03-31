import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://supplesphere.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/mod",
          "/settings",
          "/api",
          "/login",
          "/register",
          "/notifications",
          "/points",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
