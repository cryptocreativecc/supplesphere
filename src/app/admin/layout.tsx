"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/sources", label: "Sources", icon: "🏪" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/reports", label: "Reports", icon: "🚩" },
  { href: "/admin/categories", label: "Categories", icon: "📂" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-56">
          <div className="rounded-xl border border-neutral-200 bg-white p-2 shadow-card lg:sticky lg:top-24">
            <div className="mb-2 px-3 py-2">
              <h2 className="text-sm font-bold tracking-wide text-brand-navy uppercase">
                Admin
              </h2>
            </div>
            <nav className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-accent-teal/10 text-accent-teal"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-brand-navy"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
