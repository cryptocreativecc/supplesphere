import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About SuppleSphere",
  description:
    "Learn about SuppleSphere — a community-driven platform for supplement reviews, source ratings, and informed purchasing decisions.",
  openGraph: {
    title: "About SuppleSphere",
    description:
      "Learn about SuppleSphere — a community-driven platform for supplement reviews, source ratings, and informed purchasing decisions.",
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-navy">About SuppleSphere</h1>

      <section className="mt-8 space-y-4 text-neutral-600 leading-relaxed">
        <h2 className="text-xl font-semibold text-brand-navy">Our Mission</h2>
        <p>
          SuppleSphere exists to bring transparency to the supplement industry.
          We&apos;re a community-driven platform where real users share honest
          reviews of supplement products and the retailers that sell them.
        </p>
        <p>
          The supplement market is full of marketing hype and questionable
          claims. We believe that authentic peer reviews from experienced users
          are the best way to cut through the noise and make informed purchasing
          decisions.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-neutral-600 leading-relaxed">
        <h2 className="text-xl font-semibold text-brand-navy">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: "🏪",
              title: "Rate Sources",
              desc: "Review supplement retailers based on delivery speed, product authenticity, packaging, and customer service.",
            },
            {
              icon: "💊",
              title: "Review Supplements",
              desc: "Share detailed reviews of individual products including ingredients, effectiveness, taste, and value for money.",
            },
            {
              icon: "🏘️",
              title: "Join Communities",
              desc: "Engage in topic-specific communities to ask questions, share deals, and discuss supplement trends.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card"
            >
              <div className="mb-3 text-3xl">{item.icon}</div>
              <h3 className="font-semibold text-brand-navy">{item.title}</h3>
              <p className="mt-2 text-sm text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4 text-neutral-600 leading-relaxed">
        <h2 className="text-xl font-semibold text-brand-navy">
          Community Standards
        </h2>
        <p>
          We maintain a high standard for content quality. All reviews must be
          based on genuine personal experience. Our gamified reputation system
          rewards quality contributions and helps surface the most trustworthy
          voices in the community.
        </p>
        <p>
          For full details, please read our{" "}
          <Link href="/guidelines" className="text-accent-teal hover:text-accent-teal-light">
            Community Guidelines
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
