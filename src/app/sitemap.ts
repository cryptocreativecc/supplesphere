import { MetadataRoute } from "next";
import {
  mockSources,
  mockProducts,
  mockBrands,
  mockCommunities,
  mockFeedPosts,
} from "@/lib/mock-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://supplesphere.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/sources`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/supplements`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/deals`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/guidelines`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic source pages
  const sourcePages: MetadataRoute.Sitemap = mockSources.map((source) => ({
    url: `${SITE_URL}/sources/${source.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic product pages
  const productPages: MetadataRoute.Sitemap = mockProducts.map((product) => ({
    url: `${SITE_URL}/supplements/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic brand pages
  const brandPages: MetadataRoute.Sitemap = mockBrands.map((brand) => ({
    url: `${SITE_URL}/brands/${brand.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic community pages
  const communityPages: MetadataRoute.Sitemap = mockCommunities.map(
    (community) => ({
      url: `${SITE_URL}/a/${community.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })
  );

  // Dynamic post pages
  const postPages: MetadataRoute.Sitemap = mockFeedPosts.map((post) => ({
    url: `${SITE_URL}/a/${post.community}/${post.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...sourcePages,
    ...productPages,
    ...brandPages,
    ...communityPages,
    ...postPages,
  ];
}
