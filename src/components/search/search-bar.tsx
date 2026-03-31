"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QuickResult {
  id: string;
  type: "source" | "product" | "post" | "community";
  title: string;
  subtitle?: string;
  url: string;
}

interface GroupedResults {
  sources: QuickResult[];
  products: QuickResult[];
  posts: QuickResult[];
  communities: QuickResult[];
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GroupedResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const allResults = results
    ? [
        ...results.sources,
        ...results.products,
        ...results.posts,
        ...results.communities,
      ]
    : [];

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&quick=true`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsOpen(false);
      setMobileOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, allResults.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < allResults.length) {
        router.push(allResults[activeIndex].url);
        setIsOpen(false);
        setMobileOpen(false);
        setQuery("");
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
        setMobileOpen(false);
      }
    }
  }

  function handleSubmit() {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setMobileOpen(false);
    }
  }

  const typeIcons: Record<string, string> = {
    source: "🏪",
    product: "💊",
    post: "📝",
    community: "👥",
  };

  const typeLabels: Record<string, string> = {
    sources: "Sources",
    products: "Products",
    posts: "Posts",
    communities: "Communities",
  };

  function renderGroup(items: QuickResult[], label: string) {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="px-3 py-1.5 text-xs font-semibold tracking-wide text-neutral-400 uppercase">
          {label}
        </div>
        {items.map((item, idx) => {
          const globalIdx = allResults.indexOf(item);
          return (
            <Link
              key={item.id}
              href={item.url}
              className={`flex items-center gap-3 px-3 py-2 text-sm transition ${
                globalIdx === activeIndex
                  ? "bg-accent-teal/10 text-accent-teal"
                  : "text-neutral-700 hover:bg-neutral-50"
              }`}
              onClick={() => {
                setIsOpen(false);
                setMobileOpen(false);
                setQuery("");
              }}
            >
              <span className="text-base">{typeIcons[item.type]}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{item.title}</div>
                {item.subtitle && (
                  <div className="truncate text-xs text-neutral-400">
                    {item.subtitle}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  const dropdown =
    isOpen && results ? (
      <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg">
        {allResults.length === 0 && !isLoading ? (
          <div className="p-4 text-center text-sm text-neutral-400">
            No results found for &ldquo;{query}&rdquo;
          </div>
        ) : (
          <>
            {renderGroup(results.sources, typeLabels.sources)}
            {renderGroup(results.products, typeLabels.products)}
            {renderGroup(results.posts, typeLabels.posts)}
            {renderGroup(results.communities, typeLabels.communities)}
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="block border-t border-neutral-100 px-3 py-2.5 text-center text-sm font-medium text-accent-teal hover:bg-neutral-50"
              onClick={() => {
                setIsOpen(false);
                setMobileOpen(false);
              }}
            >
              View all results →
            </Link>
          </>
        )}
        {isLoading && (
          <div className="p-3 text-center text-sm text-neutral-400">
            Searching…
          </div>
        )}
      </div>
    ) : null;

  return (
    <>
      {/* Desktop search */}
      <div className="relative mx-4 hidden max-w-xl flex-1 md:flex" ref={containerRef}>
        <div className="relative w-full">
          <svg
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onFocus={() => {
              if (results && query.trim().length >= 2) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search sources, supplements, posts..."
            className="w-full rounded-full border border-neutral-600 bg-brand-navy-light py-2 pr-4 pl-10 text-sm text-white placeholder-neutral-400 transition focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
          />
        </div>
        {dropdown}
      </div>

      {/* Mobile search toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-lg p-2 text-neutral-300 hover:bg-brand-navy-light md:hidden"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      {/* Mobile full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-white md:hidden">
          <div className="flex h-14 items-center gap-2 border-b border-neutral-200 px-4">
            <button
              onClick={() => {
                setMobileOpen(false);
                setIsOpen(false);
              }}
              className="shrink-0 rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="w-full rounded-lg border border-neutral-200 py-2 pr-4 pl-4 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={handleSubmit}
              className="shrink-0 rounded-lg bg-accent-teal px-3 py-2 text-sm font-medium text-white"
            >
              Search
            </button>
          </div>
          <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            {isLoading && (
              <div className="p-6 text-center text-sm text-neutral-400">
                Searching…
              </div>
            )}
            {results && !isLoading && allResults.length === 0 && (
              <div className="p-6 text-center text-sm text-neutral-400">
                No results found for &ldquo;{query}&rdquo;
              </div>
            )}
            {results && !isLoading && allResults.length > 0 && (
              <div className="divide-y divide-neutral-100">
                {renderGroup(results.sources, typeLabels.sources)}
                {renderGroup(results.products, typeLabels.products)}
                {renderGroup(results.posts, typeLabels.posts)}
                {renderGroup(results.communities, typeLabels.communities)}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="block px-3 py-3 text-center text-sm font-medium text-accent-teal"
                  onClick={() => setMobileOpen(false)}
                >
                  View all results →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
