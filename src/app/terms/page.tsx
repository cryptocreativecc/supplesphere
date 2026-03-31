import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "SuppleSphere terms of service — the rules governing use of the platform.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-navy">Terms of Service</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Last updated: 1 January 2026
      </p>

      <div className="mt-8 space-y-8 text-neutral-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            1. Acceptance of Terms
          </h2>
          <p className="mt-2">
            By accessing or using SuppleSphere, you agree to be bound by these
            Terms of Service. If you do not agree, please do not use the
            platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            2. User Accounts
          </h2>
          <p className="mt-2">
            You must be at least 16 years old to create an account. You are
            responsible for maintaining the security of your account and all
            activity under it. One account per person — multi-accounting to
            manipulate reviews or votes is prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            3. User Content
          </h2>
          <p className="mt-2">
            You retain ownership of content you post (reviews, comments, posts).
            By posting, you grant SuppleSphere a non-exclusive, royalty-free
            licence to display, distribute, and use your content on the
            platform. Reviews must be based on genuine personal experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            4. Prohibited Conduct
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Posting fake, paid, or incentivised reviews without disclosure</li>
            <li>Harassment, threats, or personal attacks against other users</li>
            <li>Spam, self-promotion, or advertising without permission</li>
            <li>Manipulating votes, ratings, or reputation through any means</li>
            <li>Impersonating other users or organisations</li>
            <li>Posting illegal content or facilitating illegal activities</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            5. Moderation
          </h2>
          <p className="mt-2">
            We reserve the right to remove content and suspend or ban accounts
            that violate these terms or our community guidelines. Moderation
            decisions can be appealed via the reporting system.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            6. Disclaimer
          </h2>
          <p className="mt-2">
            SuppleSphere is a review platform. We do not sell supplements and
            make no claims about the safety or efficacy of any product. Reviews
            represent individual user opinions and should not be taken as
            medical advice. Always consult a healthcare professional before
            starting any supplement regimen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            7. Limitation of Liability
          </h2>
          <p className="mt-2">
            SuppleSphere is provided &quot;as is&quot; without warranties of any
            kind. We are not liable for any damages arising from your use of the
            platform, including reliance on user-generated reviews.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            8. Changes to Terms
          </h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of the
            platform after changes constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
