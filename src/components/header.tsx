"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { SearchBar } from "./search/search-bar";
import { NotificationBell } from "./notifications/notification-bell";

interface User {
  id: string;
  username: string;
  avatar: string;
  points: number;
  reputation_tier: string;
  role?: string;
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserMenuOpen(false);
    router.refresh();
  }

  const tierColours: Record<string, string> = {
    bronze: "text-amber-700",
    silver: "text-neutral-400",
    gold: "text-yellow-500",
    platinum: "text-cyan-400",
    diamond: "text-purple-400",
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-neutral-200 bg-brand-navy shadow-header">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-white"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-teal font-bold text-white">
            S
          </div>
          <span className="hidden text-lg font-bold sm:block">
            SuppleSphere
          </span>
        </Link>

        {/* Search bar (desktop + mobile trigger) */}
        <SearchBar />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/sources"
            className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-brand-navy-light hover:text-white"
          >
            Sources
          </Link>
          <Link
            href="/supplements"
            className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-brand-navy-light hover:text-white"
          >
            Supplements
          </Link>

          {user ? (
            <div className="flex items-center gap-1">
              {/* Notification bell */}
              <NotificationBell />

              <div className="relative ml-1" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-brand-navy-light hover:text-white"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-teal text-xs font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.username}</span>
                  <span
                    className={`text-xs ${tierColours[user.reputation_tier] || ""}`}
                  >
                    ★ {user.points}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 z-50 mt-1 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                    <Link
                      href={`/u/${user.username || user.id}`}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/points"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Points & Reputation
                    </Link>
                    <Link
                      href="/notifications"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Notifications
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    {(user.role === "moderator" || user.role === "admin") && (
                      <>
                        <hr className="my-1 border-neutral-100" />
                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </>
                    )}
                    <hr className="my-1 border-neutral-100" />
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-error hover:bg-neutral-50"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 transition hover:text-white"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-accent-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-teal-light"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="ml-2 rounded-lg p-2 text-neutral-300 hover:bg-brand-navy-light md:hidden"
        >
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-700 bg-brand-navy md:hidden">
          <nav className="space-y-1 px-4 py-3">
            <Link href="/sources" className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-brand-navy-light hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              Sources
            </Link>
            <Link href="/supplements" className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-brand-navy-light hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              Supplements
            </Link>
            <Link href="/deals" className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-brand-navy-light hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              Deals
            </Link>
            {user ? (
              <>
                <Link href="/notifications" className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-brand-navy-light hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                  Notifications
                </Link>
                <Link href={`/u/${user.username || user.id}`} className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-brand-navy-light hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                  My Profile
                </Link>
                <Link href="/points" className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-brand-navy-light hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                  Points & Reputation
                </Link>
                <Link href="/settings" className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-brand-navy-light hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                  Settings
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-brand-navy-light hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-error hover:bg-brand-navy-light">
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-brand-navy-light hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                  Log In
                </Link>
                <Link href="/register" className="block rounded-lg bg-accent-teal px-3 py-2 text-sm font-medium text-white hover:bg-accent-teal-light" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
