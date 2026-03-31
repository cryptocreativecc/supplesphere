"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SourceReviewForm } from "@/components/forms/source-review-form";
import { ProductReviewForm } from "@/components/forms/product-review-form";
import { DiscussionForm } from "@/components/forms/discussion-form";
import { DealForm } from "@/components/forms/deal-form";

type PostType = "discussion" | "source_review" | "product_review" | "deal" | "image_post";

const postTypeConfig: Record<PostType, { label: string; description: string; icon: string; tierRequired?: string }> = {
  discussion: {
    label: "Discussion",
    description: "Start a conversation or ask a question",
    icon: "💬",
  },
  source_review: {
    label: "Source Review",
    description: "Review a supplement retailer or seller",
    icon: "🏪",
  },
  product_review: {
    label: "Product Review",
    description: "Review a specific supplement product",
    icon: "💊",
  },
  deal: {
    label: "Deal",
    description: "Share a discount, coupon, or promotion",
    icon: "🔥",
    tierRequired: "Silver",
  },
  image_post: {
    label: "Image Post",
    description: "Share photos of products, hauls, or stacks",
    icon: "📸",
  },
};

const communityRules = [
  "Be honest and respectful in your reviews",
  "Include specific details about your experience",
  "No self-promotion or affiliate links",
  "Minimum 50 words for reviews, 30 for discussions",
];

export default function SubmitPostPage() {
  const params = useParams();
  const community = params.community as string;
  const [postType, setPostType] = useState<PostType>("discussion");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={`/a/${community}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-accent-teal hover:text-accent-teal-light"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to a/{community}
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px]">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Create a Post</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Posting to{" "}
              <Link href={`/a/${community}`} className="font-medium text-accent-teal">
                a/{community}
              </Link>
            </p>
          </div>

          {/* Post type selector */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
            <label className="mb-3 block text-sm font-medium text-neutral-700">
              Post Type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(Object.entries(postTypeConfig) as [PostType, (typeof postTypeConfig)[PostType]][]).map(
                ([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setPostType(type)}
                    className={`rounded-lg border p-3 text-left transition ${
                      postType === type
                        ? "border-accent-teal bg-accent-teal/5 ring-1 ring-accent-teal"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <span className="text-lg">{config.icon}</span>
                    <p className="mt-1 text-sm font-medium text-neutral-800">
                      {config.label}
                      {config.tierRequired && (
                        <span className="ml-1 text-xs font-normal text-neutral-400">
                          🔒 {config.tierRequired}+
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-neutral-400 line-clamp-1">{config.description}</p>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
            {postType === "source_review" && (
              <SourceReviewForm community={community} />
            )}
            {postType === "product_review" && (
              <ProductReviewForm community={community} />
            )}
            {postType === "discussion" && (
              <DiscussionForm community={community} />
            )}
            {postType === "deal" && (
              <DealForm community={community} />
            )}
            {postType === "image_post" && (
              <DiscussionForm community={community} />
            )}
          </div>
        </div>

        {/* Sidebar: Rules reminder */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
              <h3 className="mb-3 text-sm font-semibold text-brand-navy">
                📋 Posting Guidelines
              </h3>
              <ul className="space-y-2">
                {communityRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-neutral-500">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-teal" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
