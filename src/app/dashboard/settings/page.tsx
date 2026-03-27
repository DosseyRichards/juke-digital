"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useVenue } from "@/lib/venue-context";
import { useSearchParams } from "next/navigation";
import InputModal, { type PageFormData } from "@/components/input-modal";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
}

interface WebsitePage {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  meta_keywords?: string;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-[var(--muted)]">Loading...</div>}>
      <SettingsInner />
    </Suspense>
  );
}

function SettingsInner() {
  const { activeVenue, venues, refreshVenues, userId } = useVenue();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "true";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [activeTab, setActiveTab] = useState<"venue" | "pages" | "profile">(isNew ? "venue" : "venue");
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [venueForm, setVenueForm] = useState({
    name: "",
    slug: "",
    address: "",
    phone: "",
    email: "",
    description: "",
  });
  const [pageModal, setPageModal] = useState<{ mode: "create" | "rename"; page?: WebsitePage } | null>(null);
  const [openPageMenu, setOpenPageMenu] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showNewVenue, setShowNewVenue] = useState(isNew);
  const supabase = createClient();

  // Ensure profile exists
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData) {
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || "",
          })
          .select()
          .single();
        profileData = newProfile;
      }

      if (profileData) {
        setProfile(profileData);
        setProfileForm({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
        });
      }
    }
    loadProfile();
  }, [supabase]);

  // Load venue form when active venue changes
  useEffect(() => {
    if (activeVenue && !showNewVenue) {
      setEditingVenueId(activeVenue.id);
      setVenueForm({
        name: activeVenue.name || "",
        slug: activeVenue.slug || "",
        address: activeVenue.address || "",
        phone: activeVenue.phone || "",
        email: activeVenue.email || "",
        description: activeVenue.description || "",
      });
    }
  }, [activeVenue, showNewVenue]);

  // Load pages for active venue
  const loadPages = useCallback(async () => {
    if (!activeVenue) return;
    const { data } = await supabase
      .from("website_pages")
      .select("id, title, slug, is_published, sort_order, meta_title, meta_description, og_image, meta_keywords")
      .eq("venue_id", activeVenue.id)
      .order("sort_order");
    if (data) setPages(data);
  }, [activeVenue, supabase]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const resetVenueForm = () => {
    setVenueForm({ name: "", slug: "", address: "", phone: "", email: "", description: "" });
    setEditingVenueId(null);
  };

  const saveVenue = async () => {
    setSaving(true);
    setMessage("");

    if (!userId) return;

    if (editingVenueId && !showNewVenue) {
      const { error } = await supabase
        .from("venues")
        .update({
          ...venueForm,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingVenueId);
      if (error) {
        setMessage(`Error: ${error.message}`);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("venues")
        .insert({
          owner_id: userId,
          ...venueForm,
        })
        .select()
        .single();
      if (error) {
        setMessage(`Error: ${error.message}`);
        setSaving(false);
        return;
      }
      if (data) {
        setEditingVenueId(data.id);
        setShowNewVenue(false);
      }
    }

    await refreshVenues();
    setMessage("Venue saved successfully!");
    setSaving(false);
  };

  const deleteVenue = async (venueId: string) => {
    if (!confirm("Are you sure you want to delete this venue? This will delete all associated data including events, customers, campaigns, pages, and team members.")) return;
    setSaving(true);
    const { error } = await supabase.from("venues").delete().eq("id", venueId);
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Venue deleted.");
      resetVenueForm();
      setShowNewVenue(false);
    }
    await refreshVenues();
    setSaving(false);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage("");

    await supabase
      .from("profiles")
      .update({
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setMessage("Profile updated successfully!");
    setSaving(false);
  };

  // Pages management
  const addPage = async (data: PageFormData) => {
    if (!activeVenue) return;
    const slug = data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const { error } = await supabase.from("website_pages").insert({
      venue_id: activeVenue.id,
      title: data.title,
      slug,
      content: [],
      sort_order: pages.length,
      meta_title: data.metaTitle || null,
      meta_description: data.metaDescription || null,
      og_image: data.ogImage || null,
      meta_keywords: data.metaKeywords || null,
    });
    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }
    setPageModal(null);
    loadPages();
  };

  const togglePublishPage = async (page: WebsitePage) => {
    await supabase
      .from("website_pages")
      .update({ is_published: !page.is_published })
      .eq("id", page.id);
    loadPages();
  };

  const renamePage = async (page: WebsitePage, data: PageFormData) => {
    const slug = data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await supabase
      .from("website_pages")
      .update({
        title: data.title,
        slug,
        meta_title: data.metaTitle || null,
        meta_description: data.metaDescription || null,
        og_image: data.ogImage || null,
        meta_keywords: data.metaKeywords || null,
      })
      .eq("id", page.id);
    setPageModal(null);
    loadPages();
  };

  const deletePage = async (page: WebsitePage) => {
    if (!confirm(`Delete page "${page.title}"?`)) return;
    await supabase.from("website_pages").delete().eq("id", page.id);
    loadPages();
  };

  const movePage = async (page: WebsitePage, direction: "up" | "down") => {
    const idx = pages.findIndex((p) => p.id === page.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= pages.length) return;

    await Promise.all([
      supabase.from("website_pages").update({ sort_order: swapIdx }).eq("id", pages[idx].id),
      supabase.from("website_pages").update({ sort_order: idx }).eq("id", pages[swapIdx].id),
    ]);
    loadPages();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["venue", "pages", "profile"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setMessage(""); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-white border border-[var(--border)]"
            }`}
          >
            {tab === "pages" ? "Website Pages" : tab}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm mb-4 ${
          message.startsWith("Error")
            ? "bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)]"
            : "bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)]"
        }`}>
          {message}
        </div>
      )}

      {/* Venue settings */}
      {activeTab === "venue" && (
        <div className="max-w-xl space-y-4">
          {/* Venue list */}
          {venues.length > 0 && !showNewVenue && (
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[var(--muted)]">Your Venues ({venues.length})</h3>
                <button
                  onClick={() => { setShowNewVenue(true); resetVenueForm(); }}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  + Add New Venue
                </button>
              </div>
              <div className="space-y-2">
                {venues.map((v) => (
                  <div
                    key={v.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                      editingVenueId === v.id
                        ? "bg-[var(--primary)]/10 border border-[var(--primary)]/30"
                        : "bg-[var(--surface-hover)] hover:bg-[var(--border)]"
                    }`}
                    onClick={() => {
                      setEditingVenueId(v.id);
                      setVenueForm({
                        name: v.name || "",
                        slug: v.slug || "",
                        address: v.address || "",
                        phone: v.phone || "",
                        email: v.email || "",
                        description: v.description || "",
                      });
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">
                        {v.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{v.name}</div>
                        {v.slug && (
                          <div className="text-xs text-[var(--muted)]">/site/{v.slug}</div>
                        )}
                      </div>
                    </div>
                    {editingVenueId === v.id && (
                      <span className="text-xs text-[var(--primary)]">Editing</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Venue form */}
          <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {showNewVenue ? "Create New Venue" : editingVenueId ? "Edit Venue" : "Create Your Venue"}
              </h2>
              {showNewVenue && venues.length > 0 && (
                <button
                  onClick={() => {
                    setShowNewVenue(false);
                    if (activeVenue) {
                      setEditingVenueId(activeVenue.id);
                      setVenueForm({
                        name: activeVenue.name || "",
                        slug: activeVenue.slug || "",
                        address: activeVenue.address || "",
                        phone: activeVenue.phone || "",
                        email: activeVenue.email || "",
                        description: activeVenue.description || "",
                      });
                    }
                  }}
                  className="text-sm text-[var(--muted)] hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Venue Name</label>
              <input
                value={venueForm.name}
                onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                placeholder="My Awesome Bar"
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Site URL Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted)] flex-shrink-0">/site/</span>
                <input
                  value={venueForm.slug}
                  onChange={(e) =>
                    setVenueForm({
                      ...venueForm,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                    })
                  }
                  placeholder="my-awesome-bar"
                  className="w-full"
                />
              </div>
              {venueForm.slug && (
                <p className="text-xs mt-1" style={{ color: "var(--primary)" }}>
                  Your site:{" "}
                  <a href={`/site/${venueForm.slug}`} target="_blank" rel="noopener noreferrer" className="underline">
                    localhost:3000/site/{venueForm.slug}
                  </a>
                </p>
              )}
              <p className="text-xs text-[var(--muted)] mt-1">
                Unique URL for your public website. Lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                value={venueForm.address}
                onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
                placeholder="123 Main St, City, State"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={venueForm.phone}
                  onChange={(e) => setVenueForm({ ...venueForm, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={venueForm.email}
                  onChange={(e) => setVenueForm({ ...venueForm, email: e.target.value })}
                  placeholder="info@mybar.com"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={venueForm.description}
                onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })}
                placeholder="Tell customers about your venue..."
                rows={3}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveVenue}
                className="btn-primary"
                disabled={saving || !venueForm.name}
              >
                {saving ? "Saving..." : showNewVenue ? "Create Venue" : "Update Venue"}
              </button>
              {editingVenueId && !showNewVenue && (
                <button
                  onClick={() => deleteVenue(editingVenueId)}
                  className="btn-danger"
                  disabled={saving}
                >
                  Delete Venue
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Website Pages */}
      {activeTab === "pages" && (
        <div className="max-w-xl space-y-4">
          {!activeVenue ? (
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
              <p className="text-[var(--muted)]">Create a venue first to manage website pages.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Pages for {activeVenue.name}</h2>
                  {activeVenue.slug && (
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Live at{" "}
                      <a href={`/site/${activeVenue.slug}`} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] underline">
                        /site/{activeVenue.slug}
                      </a>
                    </p>
                  )}
                </div>
                <button onClick={() => setPageModal({ mode: "create" })} className="btn-primary">
                  + Add Page
                </button>
              </div>

              {pages.length === 0 ? (
                <div className="p-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
                  <p className="text-[var(--muted)] mb-4">No pages yet</p>
                  <button onClick={() => setPageModal({ mode: "create" })} className="btn-primary">
                    Create Your First Page
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {pages.map((page, idx) => (
                    <div
                      key={page.id}
                      className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => movePage(page, "up")}
                            disabled={idx === 0}
                            className="text-[var(--muted)] hover:text-white disabled:opacity-30 text-xs leading-none"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => movePage(page, "down")}
                            disabled={idx === pages.length - 1}
                            className="text-[var(--muted)] hover:text-white disabled:opacity-30 text-xs leading-none"
                          >
                            ▼
                          </button>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm truncate">{page.title}</h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                page.is_published
                                  ? "bg-[var(--success)]/20 text-[var(--success)]"
                                  : "bg-[var(--muted)]/20 text-[var(--muted)]"
                              }`}
                            >
                              {page.is_published ? "Published" : "Draft"}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--muted)] truncate">
                            /{page.slug}
                            {activeVenue.slug && page.is_published && (
                              <>
                                {" · "}
                                <a
                                  href={`/site/${activeVenue.slug}/${page.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[var(--primary)] hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View live
                                </a>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Actions dropdown */}
                      <div className="relative flex-shrink-0 ml-3">
                        <button
                          onClick={() => setOpenPageMenu(openPageMenu === page.id ? null : page.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-white hover:bg-[var(--surface-hover)] transition"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {openPageMenu === page.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenPageMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 w-44 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl z-20 overflow-hidden">
                              <button
                                onClick={() => { togglePublishPage(page); setOpenPageMenu(null); }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--surface-hover)] transition flex items-center gap-2"
                              >
                                <span className="text-base">{page.is_published ? "📝" : "🚀"}</span>
                                {page.is_published ? "Unpublish" : "Publish"}
                              </button>
                              <button
                                onClick={() => { setPageModal({ mode: "rename", page }); setOpenPageMenu(null); }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--surface-hover)] transition flex items-center gap-2"
                              >
                                <span className="text-base">✏️</span>
                                Edit Settings
                              </button>
                              {activeVenue.slug && page.is_published && (
                                <a
                                  href={`/site/${activeVenue.slug}/${page.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setOpenPageMenu(null)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--surface-hover)] transition flex items-center gap-2"
                                >
                                  <span className="text-base">🔗</span>
                                  View Live
                                </a>
                              )}
                              <div className="border-t border-[var(--border)]" />
                              <button
                                onClick={() => { deletePage(page); setOpenPageMenu(null); }}
                                className="w-full text-left px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger)]/10 transition flex items-center gap-2"
                              >
                                <span className="text-base">🗑️</span>
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-[var(--muted)]">
                Edit page content in the <a href="/dashboard/website" className="text-[var(--primary)] hover:underline">Website Builder</a>.
              </p>
            </>
          )}
        </div>
      )}

      {/* Profile settings */}
      {activeTab === "profile" && (
        <div className="max-w-xl space-y-4">
          <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <h2 className="text-lg font-semibold">Your Profile</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={profile?.email || ""}
                disabled
                className="w-full opacity-50"
              />
              <p className="text-xs text-[var(--muted)] mt-1">Email cannot be changed here.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                placeholder="Your name"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input
                value={profile?.role || "owner"}
                disabled
                className="w-full opacity-50 capitalize"
              />
            </div>

            <button
              onClick={saveProfile}
              className="btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </div>
        </div>
      )}

      {/* Page create/rename modal */}
      {pageModal && (
        <InputModal
          title={pageModal.mode === "create" ? "Create New Page" : "Edit Page Settings"}
          placeholder="e.g., Home, Menu, Events, About"
          venueId={activeVenue?.id}
          defaultValues={pageModal.mode === "rename" && pageModal.page ? {
            title: pageModal.page.title,
            metaTitle: pageModal.page.meta_title || "",
            metaDescription: pageModal.page.meta_description || "",
            ogImage: pageModal.page.og_image || "",
            metaKeywords: pageModal.page.meta_keywords || "",
          } : undefined}
          confirmText={pageModal.mode === "create" ? "Create Page" : "Save Changes"}
          onConfirm={(data) => {
            if (pageModal.mode === "create") {
              addPage(data);
            } else if (pageModal.page) {
              renamePage(pageModal.page, data);
            }
          }}
          onClose={() => setPageModal(null)}
        />
      )}
    </div>
  );
}
