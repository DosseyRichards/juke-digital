"use client";

import { useState, useEffect, useRef } from "react";
import MediaLibrary from "@/components/media-library";

export interface PageFormData {
  title: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  metaKeywords: string;
}

interface InputModalProps {
  title: string;
  placeholder?: string;
  defaultValues?: Partial<PageFormData>;
  confirmText?: string;
  venueId?: string;
  onConfirm: (data: PageFormData) => void;
  onClose: () => void;
}

export default function InputModal({
  title,
  placeholder = "",
  defaultValues = {},
  confirmText = "Create",
  venueId,
  onConfirm,
  onClose,
}: InputModalProps) {
  const [form, setForm] = useState<PageFormData>({
    title: defaultValues.title || "",
    metaTitle: defaultValues.metaTitle || "",
    metaDescription: defaultValues.metaDescription || "",
    ogImage: defaultValues.ogImage || "",
    metaKeywords: defaultValues.metaKeywords || "",
  });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showSeo, setShowSeo] = useState(
    !!(defaultValues.metaTitle || defaultValues.metaDescription || defaultValues.ogImage || defaultValues.metaKeywords)
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.title.trim()) {
      onConfirm({
        ...form,
        title: form.title.trim(),
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        ogImage: form.ogImage.trim(),
        metaKeywords: form.metaKeywords.trim(),
      });
    }
  };

  const slug = form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            {/* Page title */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Page Title</label>
              <input
                ref={inputRef}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={placeholder || "e.g., Home, Menu, Events"}
                className="w-full"
                required
              />
              {form.title.trim() && (
                <p className="text-xs text-[var(--muted)] mt-1">
                  Slug: <span className="text-[var(--primary)]">{slug}</span>
                </p>
              )}
            </div>

            {/* SEO toggle */}
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-white transition"
            >
              <svg
                className={`w-4 h-4 transition ${showSeo ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              SEO &amp; Meta Settings
            </button>

            {/* SEO fields */}
            {showSeo && (
              <div className="space-y-3 p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Meta Title
                  </label>
                  <input
                    value={form.metaTitle}
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                    placeholder={form.title || "Page title used if empty"}
                    className="w-full"
                    maxLength={70}
                  />
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {form.metaTitle.length}/70 — Shown in browser tabs and search results
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    placeholder="Brief description of this page for search engines..."
                    className="w-full"
                    rows={2}
                    maxLength={160}
                  />
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {form.metaDescription.length}/160 — Shown below title in search results
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    OG Image
                  </label>
                  {form.ogImage && (
                    <div className="relative mb-2 rounded-lg overflow-hidden border border-[var(--border)]">
                      <img src={form.ogImage} alt="OG preview" className="w-full h-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, ogImage: "" })}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-black"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={form.ogImage}
                      onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                      placeholder="https://... or browse media"
                      className="w-full"
                    />
                    {venueId && (
                      <button
                        type="button"
                        onClick={() => setShowMediaPicker(true)}
                        className="btn-secondary text-xs flex-shrink-0"
                      >
                        Browse
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Image shown when shared on social media (1200x630 recommended)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Keywords
                  </label>
                  <input
                    value={form.metaKeywords}
                    onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
                    placeholder="bar, cocktails, nightlife, events"
                    className="w-full"
                  />
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Comma-separated keywords for SEO
                  </p>
                </div>

                {/* Preview */}
                {(form.metaTitle || form.title) && (
                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] mb-1.5">Search preview</p>
                    <p className="text-sm text-blue-400 font-medium truncate">
                      {form.metaTitle || form.title}
                    </p>
                    <p className="text-xs text-green-500 truncate">
                      yoursite.com/{slug}
                    </p>
                    {form.metaDescription && (
                      <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">
                        {form.metaDescription}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky footer buttons */}
          <div className="flex gap-3 px-6 py-4 border-t border-[var(--border)] flex-shrink-0 bg-[var(--surface)]">
            <button type="submit" className="btn-primary flex-1" disabled={!form.title.trim()}>
              {confirmText}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>

        {/* Media Library for OG image */}
        {showMediaPicker && venueId && (
          <MediaLibrary
            venueId={venueId}
            onSelect={(url) => {
              setForm({ ...form, ogImage: url });
              setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
          />
        )}
      </div>
    </div>
  );
}
