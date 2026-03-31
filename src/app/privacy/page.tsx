import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "SuppleSphere privacy policy — how we collect, use, and protect your personal data.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-navy">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Last updated: 1 January 2026
      </p>

      <div className="mt-8 space-y-8 text-neutral-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            1. Information We Collect
          </h2>
          <p className="mt-2">
            When you create an account we collect your username, email address,
            and any optional profile information you choose to provide (avatar,
            bio). When you browse SuppleSphere we may collect standard analytics
            data such as pages visited, browser type, and IP address.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            2. How We Use Your Data
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>To provide and improve the SuppleSphere platform</li>
            <li>To display your public reviews and community contributions</li>
            <li>To send transactional emails (verification, password reset)</li>
            <li>To calculate and display your reputation tier and points</li>
            <li>To enforce our community guidelines and terms of service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            3. Data Sharing
          </h2>
          <p className="mt-2">
            We do not sell your personal data. Your public profile, reviews, and
            posts are visible to all visitors. We may share anonymised,
            aggregated statistics with third parties for research or analytics
            purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">4. Cookies</h2>
          <p className="mt-2">
            We use essential cookies to maintain your login session. We may use
            analytics cookies to understand how the platform is used. You can
            disable non-essential cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            5. Data Retention
          </h2>
          <p className="mt-2">
            Your account data is retained as long as your account is active. If
            you delete your account, we will remove your personal data within 30
            days. Published reviews may be anonymised and retained for community
            benefit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            6. Your Rights
          </h2>
          <p className="mt-2">
            You have the right to access, correct, or delete your personal data.
            You can do this via your account settings or by contacting us. If
            you are in the UK or EU, you have additional rights under GDPR
            including the right to data portability and the right to object to
            processing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy">
            7. Contact
          </h2>
          <p className="mt-2">
            For privacy-related questions, contact us at
            privacy@supplesphere.com.
          </p>
        </section>
      </div>
    </div>
  );
}
