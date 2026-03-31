import { Metadata } from "next";
import { SourceCard } from "@/components/source-card";
import { mockSources, mockCategories } from "@/lib/mock-data";
import { SourcesFilters } from "./sources-filters";

export const metadata: Metadata = {
  title: "Browse Supplement Sources",
  description:
    "Browse and review supplement retailers and online sellers. Find trusted sources with community ratings and verified reviews on SuppleSphere.",
  openGraph: {
    title: "Browse Supplement Sources | SuppleSphere",
    description:
      "Browse and review supplement retailers and online sellers. Find trusted sources with community ratings and verified reviews.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Supplement Sources | SuppleSphere",
    description:
      "Browse and review supplement retailers and online sellers.",
  },
  alternates: {
    canonical: "/sources",
  },
};

export default function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy">Sources</h1>
        <p className="mt-2 text-neutral-500">
          Browse and review supplement retailers and online sellers. Find
          trusted sources backed by community reviews.
        </p>
      </div>

      <SourcesFilters categories={mockCategories} sources={mockSources} />
    </div>
  );
}
