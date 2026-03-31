const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://supplesphere.com";
const SITE_NAME = "SuppleSphere";

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Community-driven supplement reviews, source ratings, and deals. Make informed purchasing decisions with authentic peer reviews.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Community-driven supplement reviews, source ratings, and deals.",
    sameAs: [],
  };
}

export function generateSourceSchema(source: {
  name: string;
  slug: string;
  url: string;
  description: string;
  avgRating: number;
  reviewCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: source.name,
    url: `https://${source.url}`,
    description: source.description,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: source.avgRating,
      bestRating: 5,
      worstRating: 1,
      reviewCount: source.reviewCount,
    },
  };
}

export function generateProductSchema(product: {
  name: string;
  slug: string;
  brandName: string;
  description: string;
  avgRating: number;
  reviewCount: number;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brandName,
    },
    category: product.category,
    url: `${SITE_URL}/supplements/${product.slug}`,
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.avgRating,
            bestRating: 5,
            worstRating: 1,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };
}

export function generateReviewSchema(post: {
  title: string;
  body: string;
  rating: number;
  author: string;
  created?: string;
  itemName?: string;
  itemType?: "source" | "product";
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    name: post.title,
    reviewBody: post.body,
    author: {
      "@type": "Person",
      name: post.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: post.rating,
      bestRating: 5,
      worstRating: 1,
    },
    datePublished: post.created || new Date().toISOString(),
    itemReviewed: post.itemName
      ? {
          "@type": post.itemType === "product" ? "Product" : "Organization",
          name: post.itemName,
        }
      : undefined,
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
