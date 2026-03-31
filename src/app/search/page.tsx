import { Metadata } from "next";
import { SearchPageClient } from "./search-client";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q
    ? `Search Results for "${q}"`
    : "Search";
  const description = q
    ? `Search results for "${q}" on SuppleSphere — find supplements, sources, reviews, and communities.`
    : "Search SuppleSphere for supplements, sources, reviews, and communities.";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | SuppleSphere`,
      description,
    },
    twitter: {
      card: "summary",
      title: `${title} | SuppleSphere`,
      description,
    },
    alternates: {
      canonical: "/search",
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function SearchPage() {
  return <SearchPageClient />;
}
