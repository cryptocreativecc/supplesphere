import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TierUpChecker } from "@/components/points/tier-up-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://supplesphere.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SuppleSphere — Community Supplement Reviews & Source Ratings",
    template: "%s | SuppleSphere",
  },
  description:
    "Community-driven supplement reviews, source ratings, and deals. Make informed purchasing decisions with authentic peer reviews from real users.",
  keywords: [
    "supplements",
    "reviews",
    "supplement reviews",
    "source reviews",
    "supplement community",
    "protein reviews",
    "creatine reviews",
    "supplement deals",
  ],
  openGraph: {
    type: "website",
    siteName: "SuppleSphere",
    title: "SuppleSphere — Community Supplement Reviews & Source Ratings",
    description:
      "Community-driven supplement reviews, source ratings, and deals. Make informed purchasing decisions with authentic peer reviews.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "SuppleSphere — Community Supplement Reviews & Source Ratings",
    description:
      "Community-driven supplement reviews, source ratings, and deals.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-neutral-50 font-sans text-neutral-800 antialiased">
        <Header />
        <main className="pt-16">{children}</main>
        <Footer />
        <TierUpChecker />
      </body>
    </html>
  );
}
