import Link from "next/link";
import { Metadata } from "next";
import { DealsClient } from "./deals-client";

export const metadata: Metadata = {
  title: "Supplement Deals & Discounts",
  description:
    "The latest supplement deals, discount codes, and promotions from trusted sources on SuppleSphere.",
  openGraph: {
    title: "Supplement Deals & Discounts | SuppleSphere",
    description:
      "The latest supplement deals, discount codes, and promotions from trusted sources.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Supplement Deals & Discounts | SuppleSphere",
    description:
      "The latest supplement deals, discount codes, and promotions.",
  },
  alternates: {
    canonical: "/deals",
  },
};

const mockDeals = [
  {
    id: "deal-1",
    title: "20% off all protein powders",
    description: "Stack with free shipping over £30 for extra savings. Includes all whey, casein, and plant-based proteins.",
    sourceName: "SupplementHQ",
    sourceSlug: "supplementhq",
    dealPrice: "20% OFF",
    code: "SPRING20",
    url: "https://supplementhq.co.uk",
    expires: "2026-04-05T23:59:59Z",
    category: "Protein",
    upvotes: 47,
    downvotes: 2,
    commentCount: 8,
    isPromoted: true,
    author: "DealHunter",
    created: "2d ago",
  },
  {
    id: "deal-2",
    title: "Buy 2 Get 1 Free on all creatine",
    description: "Great deal on Creapure creatine monohydrate. The micronised version is back in stock too.",
    sourceName: "PureProtein UK",
    sourceSlug: "pureprotein-uk",
    dealPrice: "B2G1 FREE",
    code: "B2G1",
    url: "https://pureprotein.co.uk",
    expires: "2026-04-08T23:59:59Z",
    category: "Creatine",
    upvotes: 34,
    downvotes: 1,
    commentCount: 5,
    isPromoted: false,
    author: "StrengthScience",
    created: "1d ago",
  },
  {
    id: "deal-3",
    title: "Free shipping on all orders",
    description: "No minimum spend required. International shipping also reduced by 50%.",
    sourceName: "VitalStack",
    sourceSlug: "vitalstack",
    dealPrice: "FREE SHIPPING",
    code: "FREESHIP",
    url: "https://vitalstack.com",
    expires: "2026-04-10T23:59:59Z",
    category: "All",
    upvotes: 21,
    downvotes: 3,
    commentCount: 2,
    isPromoted: false,
    author: "BargainSpotter",
    created: "3d ago",
  },
  {
    id: "deal-4",
    title: "30% off entire creatine range",
    description: "Includes premium Creapure monohydrate. Code valid sitewide on all creatine products. Stack with loyalty points for extra savings.",
    sourceName: "ProteinWorks",
    sourceSlug: "proteinworks",
    dealPrice: "30% OFF",
    code: "SPRING30",
    url: "https://proteinworks.co.uk",
    expires: "2026-04-05T23:59:59Z",
    category: "Creatine",
    upvotes: 56,
    downvotes: 1,
    commentCount: 12,
    isPromoted: true,
    author: "DealHunter",
    created: "1d ago",
  },
  {
    id: "deal-5",
    title: "40% off vitamins and minerals",
    description: "Massive clearance on selected vitamins. Includes Vitamin D3, Omega-3, and multivitamins. While stocks last.",
    sourceName: "Holland & Barrett",
    sourceSlug: "holland-barrett",
    dealPrice: "40% OFF",
    code: "VITA40",
    url: "https://hollandandbarrett.com",
    expires: "2026-04-03T23:59:59Z",
    category: "Vitamins",
    upvotes: 89,
    downvotes: 4,
    commentCount: 15,
    isPromoted: false,
    author: "NutritionNerd",
    created: "4h ago",
  },
  {
    id: "deal-6",
    title: "£10 off pre-workout bundles",
    description: "Save £10 on any pre-workout bundle with this code. Minimum spend £25. Includes C4, Ghost, and Gorilla Mind.",
    sourceName: "BulkPowders",
    sourceSlug: "bulkpowders",
    dealPrice: "£10 OFF",
    code: "PRE10",
    url: "https://bulk.com",
    expires: "2026-04-12T23:59:59Z",
    category: "Pre-Workout",
    upvotes: 15,
    downvotes: 0,
    commentCount: 3,
    isPromoted: false,
    author: "GymRat42",
    created: "5h ago",
  },
];

export default function DealsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Deals & Promos</h1>
          <p className="mt-2 text-neutral-500">
            The latest supplement deals, discount codes, and promotions.
          </p>
        </div>
        <Link
          href="/a/sourcetalk/submit"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-teal px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-teal-light"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit a Deal
        </Link>
      </div>

      <DealsClient deals={mockDeals} />
    </div>
  );
}
