"use client";

import { useState, useEffect, useCallback } from "react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.items || []);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function openCreateForm() {
    setForm({ name: "", slug: "", icon: "💊", description: "" });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(cat: CategoryItem) {
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, description: cat.description });
    setEditingId(cat.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;
      await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setShowForm(false);
      fetchCategories();
    } catch {
      // silent
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchCategories();
    } catch {
      // silent
    }
  }

  async function moveCategory(id: string, direction: "up" | "down") {
    const idx = categories.findIndex((c) => c.id === id);
    if ((direction === "up" && idx <= 0) || (direction === "down" && idx >= categories.length - 1)) return;
    const newOrder = [...categories];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setCategories(newOrder);
    // In a real app, persist order to backend
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-brand-navy">Category Management</h1>
        <button
          onClick={openCreateForm}
          className="rounded-lg bg-accent-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-teal-light"
        >
          + Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-neutral-400">Loading…</div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl bg-neutral-50 p-8 text-center">
          <div className="mb-2 text-4xl">📂</div>
          <h3 className="text-lg font-semibold text-neutral-700">No categories yet</h3>
          <p className="mb-4 text-sm text-neutral-400">Create your first supplement category.</p>
          <button onClick={openCreateForm} className="rounded-lg bg-accent-teal px-4 py-2 text-sm font-medium text-white">
            Create Category
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-card"
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveCategory(cat.id, "up")}
                  disabled={idx === 0}
                  className="rounded p-0.5 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveCategory(cat.id, "down")}
                  disabled={idx === categories.length - 1}
                  className="rounded p-0.5 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                >
                  ▼
                </button>
              </div>

              <span className="text-2xl">{cat.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-brand-navy">{cat.name}</div>
                <div className="text-xs text-neutral-500">/{cat.slug}</div>
                {cat.description && (
                  <p className="mt-0.5 text-sm text-neutral-400 line-clamp-1">{cat.description}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditForm(cat)}
                  className="rounded px-3 py-1.5 text-xs font-medium text-accent-teal bg-accent-teal/10 hover:bg-accent-teal/20"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="rounded px-3 py-1.5 text-xs font-medium text-error bg-error/10 hover:bg-error/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-semibold text-brand-navy">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: editingId ? f.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                  }))}
                  required
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-accent-teal focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-accent-teal focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Icon (emoji)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-accent-teal focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-accent-teal focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 rounded-lg bg-accent-teal px-4 py-2 text-sm font-medium text-white hover:bg-accent-teal-light disabled:opacity-50">
                  {isSaving ? "Saving…" : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
