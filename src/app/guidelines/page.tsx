import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description:
    "SuppleSphere community guidelines — posting rules, review standards, and moderation policy.",
  alternates: { canonical: "/guidelines" },
  robots: { index: true, follow: true },
};

export default function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-navy">
        Community Guidelines
      </h1>
      <p className="mt-2 text-neutral-500">
        These guidelines help maintain SuppleSphere as a trustworthy,
        high-quality review platform. Please read them before contributing.
      </p>

      <div className="mt-8 space-y-8 text-neutral-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            📝 Posting Rules
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-2">
            <li>
              <strong>Be authentic.</strong> Only post reviews based on genuine
              personal experience. Never post on behalf of a company without
              disclosure.
            </li>
            <li>
              <strong>Be specific.</strong> Include details like order dates,
              delivery times, product batch codes, and specific observations.
              Vague reviews aren&apos;t helpful.
            </li>
            <li>
              <strong>Be respectful.</strong> Disagree with ideas, not people.
              No personal attacks, harassment, or hate speech.
            </li>
            <li>
              <strong>Stay on topic.</strong> Post in the appropriate community.
              Source reviews go to a/sourcereviews, product reviews to
              a/supplementreviews.
            </li>
            <li>
              <strong>No spam.</strong> Affiliate links, repeated promotional
              content, and self-promotion without disclosure are prohibited.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            ⭐ Review Standards
          </h2>
          <div className="mt-3 space-y-4">
            <div>
              <h3 className="font-semibold text-brand-navy">Source Reviews</h3>
              <p className="mt-1 text-sm">
                Rate sources on: product authenticity, delivery speed,
                packaging quality, customer service, and overall value.
                Include evidence where possible (screenshots, photos).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-navy">
                Product Reviews
              </h3>
              <p className="mt-1 text-sm">
                Rate products on: effectiveness, taste/mixability, ingredient
                quality, value for money, and side effects. Mention how long
                you&apos;ve used the product and your dosage.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-navy">
                Verified Purchases
              </h3>
              <p className="mt-1 text-sm">
                Reviews marked as &quot;Verified Purchase&quot; carry more
                weight. You can verify a purchase by uploading proof of order.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            🛡️ Moderation Policy
          </h2>
          <div className="mt-3 space-y-3">
            <p>
              Our moderation team and community moderators enforce these
              guidelines. Actions taken depend on the severity of the violation:
            </p>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                    Warning
                  </span>
                  <span>
                    Minor first-time violations (off-topic posts, low-effort
                    reviews)
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                    Content Removal
                  </span>
                  <span>
                    Reviews that violate guidelines, spam, or misleading content
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    Temporary Ban
                  </span>
                  <span>
                    Repeated violations, harassment, or vote manipulation
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="rounded bg-red-200 px-2 py-0.5 text-xs font-medium text-red-800">
                    Permanent Ban
                  </span>
                  <span>
                    Severe violations, repeated bans, or illegal activity
                  </span>
                </div>
              </div>
            </div>
            <p>
              If you believe a moderation action was taken in error, you can
              appeal by using the report system or contacting the moderation
              team.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            🏆 Reputation & Points
          </h2>
          <p className="mt-2">
            Your reputation tier reflects the quality and quantity of your
            contributions. Higher tiers unlock additional features and perks.
            Attempting to game the points system (through vote manipulation,
            fake reviews, or multi-accounting) will result in a points reset and
            potential ban.
          </p>
        </section>
      </div>
    </div>
  );
}
