import { Metadata } from "next";
import { mockProducts, mockCategories } from "@/lib/mock-data";
import { SupplementsFilters } from "./supplements-filters";

export const metadata: Metadata = {
  title: "Browse Supplements",
  description:
    "Browse and review supplement products by category. Find the best protein, creatine, vitamins, and more based on community ratings on SuppleSphere.",
  openGraph: {
    title: "Browse Supplements | SuppleSphere",
    description:
      "Browse and review supplement products by category. Find the best protein, creatine, vitamins, and more based on community ratings.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Supplements | SuppleSphere",
    description:
      "Browse and review supplement products by category.",
  },
  alternates: {
    canonical: "/supplements",
  },
};

export default function SupplementsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy">Supplements</h1>
        <p className="mt-2 text-neutral-500">
          Browse and review individual supplement products by category. Find
          what works based on real community reviews.
        </p>
      </div>

      <SupplementsFilters
        categories={mockCategories}
        products={mockProducts}
      />
    </div>
  );
}
