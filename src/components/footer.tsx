import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-teal font-bold text-white">
                S
              </div>
              <span className="text-lg font-bold text-brand-navy">
                SuppleSphere
              </span>
            </div>
            <p className="mt-3 text-sm text-neutral-500">
              Community-driven supplement reviews and source ratings. Make
              informed decisions.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">Browse</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/sources"
                  className="text-sm text-neutral-500 transition hover:text-accent-teal"
                >
                  Sources
                </Link>
              </li>
              <li>
                <Link
                  href="/supplements"
                  className="text-sm text-neutral-500 transition hover:text-accent-teal"
                >
                  Supplements
                </Link>
              </li>
              <li>
                <Link
                  href="/deals"
                  className="text-sm text-neutral-500 transition hover:text-accent-teal"
                >
                  Deals
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-sm text-neutral-500 transition hover:text-accent-teal"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Communities */}
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">
              Communities
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/a/sourcereviews"
                  className="text-sm text-neutral-500 transition hover:text-accent-teal"
                >
                  a/sourcereviews
                </Link>
              </li>
              <li>
                <Link
                  href="/a/supplementreviews"
                  className="text-sm text-neutral-500 transition hover:text-accent-teal"
                >
                  a/supplementreviews
                </Link>
              </li>
              <li>
                <Link
                  href="/a/sourcetalk"
                  className="text-sm text-neutral-500 transition hover:text-accent-teal"
                >
                  a/sourcetalk
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform / Legal */}
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-neutral-500 transition hover:text-accent-teal"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  className="text-sm text-neutral-500 transition hover:text-accent-teal"
                >
                  Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-neutral-500 transition hover:text-accent-teal"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-neutral-500 transition hover:text-accent-teal"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-100 pt-6">
          <p className="text-center text-xs text-neutral-400">
            © {new Date().getFullYear()} SuppleSphere. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
