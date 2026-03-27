"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useVenue } from "@/lib/venue-context";
import MediaLibrary from "@/components/media-library";
import InputModal, { type PageFormData } from "@/components/input-modal";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type BlockType =
  | "hero"
  | "text"
  | "gallery"
  | "menu_section"
  | "hours"
  | "contact"
  | "testimonials"
  | "events"
  | "social"
  | "cta"
  | "divider"
  | "embed";

interface WebsiteBlock {
  id: string;
  type: BlockType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any>;
}

interface WebsitePage {
  id: string;
  title: string;
  slug: string;
  content: WebsiteBlock[];
  is_published: boolean;
  sort_order: number;
}

interface VenueTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  heroStyle: string;
}

/* ------------------------------------------------------------------ */
/*  Block templates                                                    */
/* ------------------------------------------------------------------ */

const blockTemplates: Record<BlockType, () => WebsiteBlock> = {
  hero: () => ({
    id: crypto.randomUUID(),
    type: "hero",
    content: {
      heading: "Welcome to Our Bar",
      subheading: "The best drinks in town",
      buttonText: "View Menu",
      buttonLink: "#menu",
      backgroundImage: "",
      overlayOpacity: "0.5",
    },
  }),
  text: () => ({
    id: crypto.randomUUID(),
    type: "text",
    content: {
      heading: "About Us",
      body: "Tell your story here...",
      image: "",
      imagePosition: "right",
      imageCaption: "",
    },
  }),
  gallery: () => ({
    id: crypto.randomUUID(),
    type: "gallery",
    content: {
      heading: "Gallery",
      images: [] as string[],
      columns: "3",
    },
  }),
  menu_section: () => ({
    id: crypto.randomUUID(),
    type: "menu_section",
    content: {
      heading: "Drinks Menu",
      items: [
        { name: "House Margarita", description: "Tequila, lime, agave", price: "$12", image: "" },
        { name: "Old Fashioned", description: "Bourbon, bitters, orange", price: "$14", image: "" },
      ],
    },
  }),
  hours: () => ({
    id: crypto.randomUUID(),
    type: "hours",
    content: {
      heading: "Hours",
      monday: "4pm - 12am",
      tuesday: "4pm - 12am",
      wednesday: "4pm - 12am",
      thursday: "4pm - 2am",
      friday: "4pm - 2am",
      saturday: "2pm - 2am",
      sunday: "2pm - 10pm",
    },
  }),
  contact: () => ({
    id: crypto.randomUUID(),
    type: "contact",
    content: {
      heading: "Find Us",
      address: "123 Main St",
      phone: "(555) 123-4567",
      email: "hello@yourbar.com",
      mapEmbed: "",
    },
  }),
  testimonials: () => ({
    id: crypto.randomUUID(),
    type: "testimonials",
    content: {
      heading: "What People Say",
      items: [
        { quote: "Best cocktails in the city!", author: "Jane D.", role: "Regular" },
        { quote: "Amazing atmosphere and service.", author: "Mike S.", role: "Yelp Reviewer" },
      ],
    },
  }),
  events: () => ({
    id: crypto.randomUUID(),
    type: "events",
    content: {
      heading: "Upcoming Events",
      autoFeed: false,
      items: [
        { title: "Live Jazz Night", date: "Every Friday", description: "Live jazz from 8pm", image: "" },
      ],
    },
  }),
  social: () => ({
    id: crypto.randomUUID(),
    type: "social",
    content: {
      instagram: "",
      facebook: "",
      twitter: "",
      tiktok: "",
      yelp: "",
      google: "",
    },
  }),
  cta: () => ({
    id: crypto.randomUUID(),
    type: "cta",
    content: {
      heading: "Book Your Event",
      body: "Looking for a venue? We've got you covered.",
      buttonText: "Contact Us",
      buttonLink: "#contact",
      backgroundImage: "",
    },
  }),
  divider: () => ({
    id: crypto.randomUUID(),
    type: "divider",
    content: {
      style: "line",
    },
  }),
  embed: () => ({
    id: crypto.randomUUID(),
    type: "embed",
    content: {
      code: "",
    },
  }),
};

const blockLabels: Record<BlockType, string> = {
  hero: "Hero Banner",
  text: "Text + Image",
  gallery: "Gallery",
  menu_section: "Menu Section",
  hours: "Hours",
  contact: "Contact / Map",
  testimonials: "Testimonials",
  events: "Events",
  social: "Social Links",
  cta: "Call to Action",
  divider: "Divider / Spacer",
  embed: "Embed Code",
};

const blockIcons: Record<BlockType, string> = {
  hero: "H",
  text: "T",
  gallery: "G",
  menu_section: "M",
  hours: "Hrs",
  contact: "C",
  testimonials: "Q",
  events: "E",
  social: "S",
  cta: "CTA",
  divider: "--",
  embed: "</>",
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function WebsiteBuilderPage() {
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [activePage, setActivePage] = useState<WebsitePage | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const { activeVenue } = useVenue();
  const venueId = activeVenue?.id ?? null;
  const venueSlug = activeVenue?.slug || "";
  const venueName = activeVenue?.name || "";
  const [theme, setTheme] = useState<VenueTheme>({
    primaryColor: "#6366f1",
    backgroundColor: "#0f0f13",
    textColor: "#f0f0f5",
    fontFamily: "Inter",
    heroStyle: "gradient",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ blockId: string; field: string; index?: number } | null>(null);
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [editingPageTitle, setEditingPageTitle] = useState("");
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const supabase = createClient();

  /* ---- Data loading ---- */

  const loadPages = useCallback(
    async (vId: string) => {
      const { data } = await supabase
        .from("website_pages")
        .select("*")
        .eq("venue_id", vId)
        .order("sort_order");
      if (data) {
        setPages(data);
        if (data.length > 0 && !activePage) {
          setActivePage(data[0]);
        }
      }
    },
    [supabase, activePage]
  );

  useEffect(() => {
    if (activeVenue?.website_theme) {
      setTheme(activeVenue.website_theme as unknown as VenueTheme);
    }
    if (venueId) {
      setActivePage(null);
      loadPages(venueId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  /* ---- Page CRUD ---- */

  const createPage = async (formData: PageFormData) => {
    if (!venueId) return;
    const slug = formData.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const { data: newPage } = await supabase
      .from("website_pages")
      .insert({
        venue_id: venueId,
        title: formData.title,
        slug,
        content: [blockTemplates.hero()],
        sort_order: pages.length,
        meta_title: formData.metaTitle || null,
        meta_description: formData.metaDescription || null,
        og_image: formData.ogImage || null,
        meta_keywords: formData.metaKeywords || null,
      })
      .select()
      .single();

    if (newPage) {
      const newPages = [...pages, newPage];
      setPages(newPages);
      setActivePage(newPage);
      setShowCreatePageModal(false);
    }
  };

  const deletePage = async () => {
    if (!activePage || !venueId) return;
    if (!confirm("Delete this page? This cannot be undone.")) return;
    await supabase.from("website_pages").delete().eq("id", activePage.id);
    setActivePage(null);
    setActiveBlockId(null);
    loadPages(venueId);
  };

  const togglePublish = async () => {
    if (!activePage) return;
    const updated = { ...activePage, is_published: !activePage.is_published };
    await supabase.from("website_pages").update({ is_published: updated.is_published }).eq("id", activePage.id);
    setActivePage(updated);
    setPages(pages.map((p) => (p.id === updated.id ? updated : p)));
  };

  const savePageTitle = async () => {
    if (!activePage || !editingPageTitle.trim()) return;
    const newSlug = editingPageTitle
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const updated = { ...activePage, title: editingPageTitle, slug: newSlug };
    await supabase.from("website_pages").update({ title: editingPageTitle, slug: newSlug }).eq("id", activePage.id);
    setActivePage(updated);
    setPages(pages.map((p) => (p.id === updated.id ? updated : p)));
    setShowPageSettings(false);
  };

  /* ---- Save ---- */

  const savePage = async () => {
    if (!activePage) return;
    setSaving(true);
    await supabase
      .from("website_pages")
      .update({ content: activePage.content, updated_at: new Date().toISOString() })
      .eq("id", activePage.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveTheme = async () => {
    if (!venueId) return;
    setSaving(true);
    await supabase.from("venues").update({ website_theme: theme }).eq("id", venueId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /* ---- Block operations ---- */

  const addBlock = (type: BlockType) => {
    if (!activePage) return;
    const newBlock = blockTemplates[type]();
    const updated = { ...activePage, content: [...activePage.content, newBlock] };
    setActivePage(updated);
    setActiveBlockId(newBlock.id);
    setShowAddBlock(false);
  };

  const updateBlockContent = (blockId: string, field: string, value: unknown) => {
    if (!activePage) return;
    const updated = {
      ...activePage,
      content: activePage.content.map((b) => (b.id === blockId ? { ...b, content: { ...b.content, [field]: value } } : b)),
    };
    setActivePage(updated);
  };

  const removeBlock = (blockId: string) => {
    if (!activePage) return;
    if (!confirm("Remove this block?")) return;
    const updated = { ...activePage, content: activePage.content.filter((b) => b.id !== blockId) };
    setActivePage(updated);
    if (activeBlockId === blockId) setActiveBlockId(null);
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    if (!activePage) return;
    const idx = activePage.content.findIndex((b) => b.id === blockId);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= activePage.content.length) return;
    const newContent = [...activePage.content];
    [newContent[idx], newContent[newIdx]] = [newContent[newIdx], newContent[idx]];
    setActivePage({ ...activePage, content: newContent });
  };

  const duplicateBlock = (blockId: string) => {
    if (!activePage) return;
    const idx = activePage.content.findIndex((b) => b.id === blockId);
    if (idx === -1) return;
    const original = activePage.content[idx];
    const clone = { ...JSON.parse(JSON.stringify(original)), id: crypto.randomUUID() };
    const newContent = [...activePage.content];
    newContent.splice(idx + 1, 0, clone);
    setActivePage({ ...activePage, content: newContent });
    setActiveBlockId(clone.id);
  };

  /* ---- Reorder pages ---- */

  const movePage = async (pageId: string, direction: "up" | "down") => {
    const idx = pages.findIndex((p) => p.id === pageId);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= pages.length) return;
    const newPages = [...pages];
    [newPages[idx], newPages[newIdx]] = [newPages[newIdx], newPages[idx]];
    setPages(newPages);
    // Update sort orders
    for (let i = 0; i < newPages.length; i++) {
      await supabase.from("website_pages").update({ sort_order: i }).eq("id", newPages[i].id);
    }
  };

  /* ---- Active block ---- */

  const activeBlock = activePage?.content.find((b) => b.id === activeBlockId) || null;

  /* ---- Open media library for a block field ---- */

  const openMedia = (blockId: string, field: string, index?: number) => {
    setMediaTarget({ blockId, field, index });
  };

  const handleMediaSelect = (url: string) => {
    if (!mediaTarget || !activePage) return;
    const { blockId, field, index } = mediaTarget;
    const block = activePage.content.find((b) => b.id === blockId);
    if (!block) return;

    if (index !== undefined && Array.isArray(block.content[field])) {
      // Adding to array (gallery images)
      const arr = [...block.content[field]];
      arr.push(url);
      updateBlockContent(blockId, field, arr);
    } else if (field.includes(".")) {
      // Nested field like "items.0.image"
      const parts = field.split(".");
      const items = [...block.content[parts[0]]];
      const itemIndex = parseInt(parts[1]);
      const itemField = parts[2];
      items[itemIndex] = { ...items[itemIndex], [itemField]: url };
      updateBlockContent(blockId, parts[0], items);
    } else {
      updateBlockContent(blockId, field, url);
    }
    setMediaTarget(null);
  };

  /* ================================================================ */
  /*  BLOCK EDITOR                                                     */
  /* ================================================================ */

  const renderBlockEditor = (block: WebsiteBlock) => {
    const c = block.content;

    switch (block.type) {
      case "hero":
        return (
          <div className="space-y-4">
            <Field label="Heading" value={c.heading} onChange={(v) => updateBlockContent(block.id, "heading", v)} />
            <Field label="Subheading" value={c.subheading} onChange={(v) => updateBlockContent(block.id, "subheading", v)} />
            <Field label="Button Text" value={c.buttonText} onChange={(v) => updateBlockContent(block.id, "buttonText", v)} />
            <Field label="Button Link" value={c.buttonLink} onChange={(v) => updateBlockContent(block.id, "buttonLink", v)} placeholder="#section or /page" />
            <ImageField
              label="Background Image"
              value={c.backgroundImage}
              onChoose={() => openMedia(block.id, "backgroundImage")}
              onClear={() => updateBlockContent(block.id, "backgroundImage", "")}
            />
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Overlay Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={c.overlayOpacity || "0.5"}
                onChange={(e) => updateBlockContent(block.id, "overlayOpacity", e.target.value)}
                className="w-full accent-[var(--primary)]"
              />
              <span className="text-xs text-[var(--muted)]">{Math.round((c.overlayOpacity || 0.5) * 100)}%</span>
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-4">
            <Field label="Heading" value={c.heading} onChange={(v) => updateBlockContent(block.id, "heading", v)} />
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Body</label>
              <textarea
                value={c.body || ""}
                onChange={(e) => updateBlockContent(block.id, "body", e.target.value)}
                rows={6}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm"
              />
            </div>
            <ImageField
              label="Image (optional)"
              value={c.image}
              onChoose={() => openMedia(block.id, "image")}
              onClear={() => updateBlockContent(block.id, "image", "")}
            />
            {c.image && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">Image Position</label>
                  <select
                    value={c.imagePosition || "right"}
                    onChange={(e) => updateBlockContent(block.id, "imagePosition", e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <Field label="Image Caption" value={c.imageCaption} onChange={(v) => updateBlockContent(block.id, "imageCaption", v)} />
              </>
            )}
          </div>
        );

      case "gallery":
        return (
          <div className="space-y-4">
            <Field label="Heading" value={c.heading} onChange={(v) => updateBlockContent(block.id, "heading", v)} />
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Columns</label>
              <select
                value={c.columns || "3"}
                onChange={(e) => updateBlockContent(block.id, "columns", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm"
              >
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-2">Images ({(c.images || []).length})</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {(c.images || []).map((img: string, i: number) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-full h-20 object-cover rounded-lg border border-[var(--border)]" />
                    <button
                      onClick={() => {
                        const imgs = [...c.images];
                        imgs.splice(i, 1);
                        updateBlockContent(block.id, "images", imgs);
                      }}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => openMedia(block.id, "images", (c.images || []).length)}
                className="btn-secondary text-xs w-full"
              >
                + Add Image
              </button>
            </div>
          </div>
        );

      case "menu_section":
        return (
          <div className="space-y-4">
            <Field label="Section Heading" value={c.heading} onChange={(v) => updateBlockContent(block.id, "heading", v)} />
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-2">Menu Items</label>
              {(c.items || []).map((item: { name: string; description: string; price: string; image: string }, i: number) => (
                <div key={i} className="p-3 mb-2 rounded-lg bg-[var(--background)] border border-[var(--border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--primary)]">Item {i + 1}</span>
                    <button
                      onClick={() => {
                        const items = [...c.items];
                        items.splice(i, 1);
                        updateBlockContent(block.id, "items", items);
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    value={item.name}
                    onChange={(e) => {
                      const items = [...c.items];
                      items[i] = { ...items[i], name: e.target.value };
                      updateBlockContent(block.id, "items", items);
                    }}
                    placeholder="Item name"
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 text-sm"
                  />
                  <input
                    value={item.description}
                    onChange={(e) => {
                      const items = [...c.items];
                      items[i] = { ...items[i], description: e.target.value };
                      updateBlockContent(block.id, "items", items);
                    }}
                    placeholder="Description"
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 text-sm"
                  />
                  <input
                    value={item.price}
                    onChange={(e) => {
                      const items = [...c.items];
                      items[i] = { ...items[i], price: e.target.value };
                      updateBlockContent(block.id, "items", items);
                    }}
                    placeholder="$12"
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 text-sm"
                  />
                  <ImageField
                    label="Item Image"
                    value={item.image}
                    onChoose={() => openMedia(block.id, `items.${i}.image`)}
                    onClear={() => {
                      const items = [...c.items];
                      items[i] = { ...items[i], image: "" };
                      updateBlockContent(block.id, "items", items);
                    }}
                    small
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const items = [...(c.items || []), { name: "", description: "", price: "", image: "" }];
                  updateBlockContent(block.id, "items", items);
                }}
                className="btn-secondary text-xs w-full"
              >
                + Add Item
              </button>
            </div>
          </div>
        );

      case "hours":
        return (
          <div className="space-y-4">
            <Field label="Heading" value={c.heading} onChange={(v) => updateBlockContent(block.id, "heading", v)} />
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <Field
                key={day}
                label={day.charAt(0).toUpperCase() + day.slice(1)}
                value={c[day] || ""}
                onChange={(v) => updateBlockContent(block.id, day, v)}
                placeholder="e.g. 4pm - 12am or Closed"
              />
            ))}
          </div>
        );

      case "contact":
        return (
          <div className="space-y-4">
            <Field label="Heading" value={c.heading} onChange={(v) => updateBlockContent(block.id, "heading", v)} />
            <Field label="Address" value={c.address} onChange={(v) => updateBlockContent(block.id, "address", v)} />
            <Field label="Phone" value={c.phone} onChange={(v) => updateBlockContent(block.id, "phone", v)} />
            <Field label="Email" value={c.email} onChange={(v) => updateBlockContent(block.id, "email", v)} />
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Map Embed URL</label>
              <input
                value={c.mapEmbed || ""}
                onChange={(e) => updateBlockContent(block.id, "mapEmbed", e.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm"
              />
              <p className="text-xs text-[var(--muted)] mt-1">Paste a Google Maps embed URL</p>
            </div>
          </div>
        );

      case "testimonials":
        return (
          <div className="space-y-4">
            <Field label="Heading" value={c.heading} onChange={(v) => updateBlockContent(block.id, "heading", v)} />
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-2">Testimonials</label>
              {(c.items || []).map((item: { quote: string; author: string; role: string }, i: number) => (
                <div key={i} className="p-3 mb-2 rounded-lg bg-[var(--background)] border border-[var(--border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--primary)]">Quote {i + 1}</span>
                    <button
                      onClick={() => {
                        const items = [...c.items];
                        items.splice(i, 1);
                        updateBlockContent(block.id, "items", items);
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={item.quote}
                    onChange={(e) => {
                      const items = [...c.items];
                      items[i] = { ...items[i], quote: e.target.value };
                      updateBlockContent(block.id, "items", items);
                    }}
                    placeholder="Their testimonial..."
                    rows={2}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={item.author}
                      onChange={(e) => {
                        const items = [...c.items];
                        items[i] = { ...items[i], author: e.target.value };
                        updateBlockContent(block.id, "items", items);
                      }}
                      placeholder="Author name"
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 text-sm"
                    />
                    <input
                      value={item.role}
                      onChange={(e) => {
                        const items = [...c.items];
                        items[i] = { ...items[i], role: e.target.value };
                        updateBlockContent(block.id, "items", items);
                      }}
                      placeholder="Role/title"
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 text-sm"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const items = [...(c.items || []), { quote: "", author: "", role: "" }];
                  updateBlockContent(block.id, "items", items);
                }}
                className="btn-secondary text-xs w-full"
              >
                + Add Testimonial
              </button>
            </div>
          </div>
        );

      case "events":
        return (
          <div className="space-y-4">
            <Field label="Heading" value={c.heading} onChange={(v) => updateBlockContent(block.id, "heading", v)} />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={c.autoFeed || false}
                onChange={(e) => updateBlockContent(block.id, "autoFeed", e.target.checked)}
                className="accent-[var(--primary)]"
              />
              <label className="text-sm">Auto-pull from Events table</label>
            </div>
            {!c.autoFeed && (
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-2">Manual Events</label>
                {(c.items || []).map((item: { title: string; date: string; description: string; image: string }, i: number) => (
                  <div key={i} className="p-3 mb-2 rounded-lg bg-[var(--background)] border border-[var(--border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--primary)]">Event {i + 1}</span>
                      <button
                        onClick={() => {
                          const items = [...c.items];
                          items.splice(i, 1);
                          updateBlockContent(block.id, "items", items);
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      value={item.title}
                      onChange={(e) => {
                        const items = [...c.items];
                        items[i] = { ...items[i], title: e.target.value };
                        updateBlockContent(block.id, "items", items);
                      }}
                      placeholder="Event title"
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 text-sm"
                    />
                    <input
                      value={item.date}
                      onChange={(e) => {
                        const items = [...c.items];
                        items[i] = { ...items[i], date: e.target.value };
                        updateBlockContent(block.id, "items", items);
                      }}
                      placeholder="Date / schedule"
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 text-sm"
                    />
                    <textarea
                      value={item.description}
                      onChange={(e) => {
                        const items = [...c.items];
                        items[i] = { ...items[i], description: e.target.value };
                        updateBlockContent(block.id, "items", items);
                      }}
                      placeholder="Description"
                      rows={2}
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 text-sm"
                    />
                    <ImageField
                      label="Event Image"
                      value={item.image}
                      onChoose={() => openMedia(block.id, `items.${i}.image`)}
                      onClear={() => {
                        const items = [...c.items];
                        items[i] = { ...items[i], image: "" };
                        updateBlockContent(block.id, "items", items);
                      }}
                      small
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const items = [...(c.items || []), { title: "", date: "", description: "", image: "" }];
                    updateBlockContent(block.id, "items", items);
                  }}
                  className="btn-secondary text-xs w-full"
                >
                  + Add Event
                </button>
              </div>
            )}
          </div>
        );

      case "social":
        return (
          <div className="space-y-4">
            <Field label="Instagram URL" value={c.instagram} onChange={(v) => updateBlockContent(block.id, "instagram", v)} placeholder="https://instagram.com/..." />
            <Field label="Facebook URL" value={c.facebook} onChange={(v) => updateBlockContent(block.id, "facebook", v)} placeholder="https://facebook.com/..." />
            <Field label="Twitter / X URL" value={c.twitter} onChange={(v) => updateBlockContent(block.id, "twitter", v)} placeholder="https://x.com/..." />
            <Field label="TikTok URL" value={c.tiktok} onChange={(v) => updateBlockContent(block.id, "tiktok", v)} placeholder="https://tiktok.com/@..." />
            <Field label="Yelp URL" value={c.yelp} onChange={(v) => updateBlockContent(block.id, "yelp", v)} placeholder="https://yelp.com/biz/..." />
            <Field label="Google Business URL" value={c.google} onChange={(v) => updateBlockContent(block.id, "google", v)} placeholder="https://g.page/..." />
          </div>
        );

      case "cta":
        return (
          <div className="space-y-4">
            <Field label="Heading" value={c.heading} onChange={(v) => updateBlockContent(block.id, "heading", v)} />
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Body</label>
              <textarea
                value={c.body || ""}
                onChange={(e) => updateBlockContent(block.id, "body", e.target.value)}
                rows={3}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm"
              />
            </div>
            <Field label="Button Text" value={c.buttonText} onChange={(v) => updateBlockContent(block.id, "buttonText", v)} />
            <Field label="Button Link" value={c.buttonLink} onChange={(v) => updateBlockContent(block.id, "buttonLink", v)} />
            <ImageField
              label="Background Image"
              value={c.backgroundImage}
              onChoose={() => openMedia(block.id, "backgroundImage")}
              onClear={() => updateBlockContent(block.id, "backgroundImage", "")}
            />
          </div>
        );

      case "divider":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Style</label>
              <select
                value={c.style || "line"}
                onChange={(e) => updateBlockContent(block.id, "style", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm"
              >
                <option value="line">Line</option>
                <option value="space">Space</option>
                <option value="dots">Dots</option>
              </select>
            </div>
          </div>
        );

      case "embed":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Embed Code</label>
              <textarea
                value={c.code || ""}
                onChange={(e) => updateBlockContent(block.id, "code", e.target.value)}
                rows={6}
                placeholder='<iframe src="..." />'
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm font-mono"
              />
              <p className="text-xs text-[var(--muted)] mt-1">Paste any embed code, iframe, or HTML snippet</p>
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-[var(--muted)]">No editor for this block type.</p>;
    }
  };

  /* ================================================================ */
  /*  BLOCK PREVIEW                                                    */
  /* ================================================================ */

  const renderBlockPreview = (block: WebsiteBlock) => {
    const c = block.content;

    switch (block.type) {
      case "hero":
        return (
          <div
            className="relative py-24 px-8 text-center overflow-hidden"
            style={{
              backgroundImage: c.backgroundImage ? `url(${c.backgroundImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {c.backgroundImage && (
              <div className="absolute inset-0 bg-black" style={{ opacity: c.overlayOpacity || 0.5 }} />
            )}
            {!c.backgroundImage && (
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/20 to-transparent" />
            )}
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{c.heading}</h1>
              <p className="text-lg md:text-xl text-[var(--muted)] mb-6">{c.subheading}</p>
              {c.buttonText && (
                <a href={c.buttonLink || "#"} className="inline-block px-8 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: theme.primaryColor }}>
                  {c.buttonText}
                </a>
              )}
            </div>
          </div>
        );

      case "text":
        return (
          <div className="py-16 px-8 max-w-4xl mx-auto">
            {c.image ? (
              <div className={`flex flex-col md:flex-row gap-8 items-center ${c.imagePosition === "left" ? "md:flex-row-reverse" : ""}`}>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">{c.heading}</h2>
                  <p className="text-[var(--muted)] text-lg leading-relaxed whitespace-pre-wrap">{c.body}</p>
                </div>
                <div className="flex-1">
                  <img src={c.image} alt={c.imageCaption || ""} className="w-full rounded-xl" />
                  {c.imageCaption && <p className="text-sm text-[var(--muted)] mt-2 text-center">{c.imageCaption}</p>}
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">{c.heading}</h2>
                <p className="text-[var(--muted)] text-lg leading-relaxed whitespace-pre-wrap">{c.body}</p>
              </div>
            )}
          </div>
        );

      case "gallery":
        return (
          <div className="py-16 px-8 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">{c.heading}</h2>
            {(c.images || []).length > 0 ? (
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${c.columns || 3}, 1fr)` }}
              >
                {(c.images || []).map((img: string, i: number) => (
                  <img key={i} src={img} alt="" className="w-full h-48 object-cover rounded-xl" />
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--muted)]">No images added yet</p>
            )}
          </div>
        );

      case "menu_section":
        return (
          <div className="py-16 px-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">{c.heading}</h2>
            <div className="space-y-4">
              {(c.items || []).map((item: { name: string; description: string; price: string; image: string }, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-[var(--border)]">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      <span className="font-bold text-[var(--primary)] flex-shrink-0">{item.price}</span>
                    </div>
                    {item.description && <p className="text-sm text-[var(--muted)] mt-1">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "hours":
        return (
          <div className="py-16 px-8 max-w-lg mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">{c.heading}</h2>
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <div key={day} className="flex justify-between py-3 border-b border-[var(--border)] text-lg">
                <span className="capitalize font-medium">{day}</span>
                <span className="text-[var(--muted)]">{c[day]}</span>
              </div>
            ))}
          </div>
        );

      case "contact":
        return (
          <div className="py-16 px-8">
            <h2 className="text-3xl font-bold mb-6 text-center">{c.heading}</h2>
            <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {c.address && (
                  <div>
                    <p className="text-sm font-medium text-[var(--muted)] mb-1">Address</p>
                    <p className="text-lg">{c.address}</p>
                  </div>
                )}
                {c.phone && (
                  <div>
                    <p className="text-sm font-medium text-[var(--muted)] mb-1">Phone</p>
                    <p className="text-lg">{c.phone}</p>
                  </div>
                )}
                {c.email && (
                  <div>
                    <p className="text-sm font-medium text-[var(--muted)] mb-1">Email</p>
                    <p className="text-lg">{c.email}</p>
                  </div>
                )}
              </div>
              {c.mapEmbed && (
                <div className="rounded-xl overflow-hidden border border-[var(--border)]">
                  <iframe src={c.mapEmbed} className="w-full h-64" loading="lazy" title="Map" />
                </div>
              )}
            </div>
          </div>
        );

      case "testimonials":
        return (
          <div className="py-16 px-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">{c.heading}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {(c.items || []).map((item: { quote: string; author: string; role: string }, i: number) => (
                <div key={i} className="p-6 rounded-xl bg-white/5 border border-[var(--border)]">
                  <p className="text-lg mb-4 italic">&ldquo;{item.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{item.author}</p>
                    {item.role && <p className="text-sm text-[var(--muted)]">{item.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "events":
        return (
          <div className="py-16 px-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">{c.heading}</h2>
            {c.autoFeed ? (
              <p className="text-center text-[var(--muted)]">[Events auto-pulled from your events table]</p>
            ) : (
              <div className="space-y-4">
                {(c.items || []).map((item: { title: string; date: string; description: string; image: string }, i: number) => (
                  <div key={i} className="flex gap-6 items-start p-4 rounded-xl bg-white/5 border border-[var(--border)]">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm font-medium" style={{ color: theme.primaryColor }}>{item.date}</p>
                      {item.description && <p className="text-[var(--muted)] mt-1">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "social":
        return (
          <div className="py-12 px-8 text-center">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {c.instagram && <SocialLink label="Instagram" url={c.instagram} />}
              {c.facebook && <SocialLink label="Facebook" url={c.facebook} />}
              {c.twitter && <SocialLink label="Twitter" url={c.twitter} />}
              {c.tiktok && <SocialLink label="TikTok" url={c.tiktok} />}
              {c.yelp && <SocialLink label="Yelp" url={c.yelp} />}
              {c.google && <SocialLink label="Google" url={c.google} />}
              {!c.instagram && !c.facebook && !c.twitter && !c.tiktok && !c.yelp && !c.google && (
                <p className="text-[var(--muted)]">Add social links in the editor</p>
              )}
            </div>
          </div>
        );

      case "cta":
        return (
          <div
            className="relative py-20 px-8 text-center overflow-hidden"
            style={{
              backgroundImage: c.backgroundImage ? `url(${c.backgroundImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {c.backgroundImage && <div className="absolute inset-0 bg-black/60" />}
            {!c.backgroundImage && <div className="absolute inset-0" style={{ backgroundColor: theme.primaryColor, opacity: 0.1 }} />}
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-3">{c.heading}</h2>
              <p className="text-[var(--muted)] text-lg mb-6 max-w-xl mx-auto">{c.body}</p>
              {c.buttonText && (
                <a href={c.buttonLink || "#"} className="inline-block px-8 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: theme.primaryColor }}>
                  {c.buttonText}
                </a>
              )}
            </div>
          </div>
        );

      case "divider":
        if (c.style === "space") return <div className="py-8" />;
        if (c.style === "dots") return <div className="py-8 text-center text-2xl tracking-[1em] text-[var(--muted)]">...</div>;
        return <hr className="my-8 mx-8 border-[var(--border)]" />;

      case "embed":
        return (
          <div className="py-8 px-8 max-w-4xl mx-auto">
            {c.code ? (
              <div dangerouslySetInnerHTML={{ __html: c.code }} className="[&>iframe]:w-full [&>iframe]:rounded-xl [&>iframe]:min-h-[300px]" />
            ) : (
              <p className="text-center text-[var(--muted)]">Add embed code in the editor</p>
            )}
          </div>
        );

      default:
        return <div className="py-8 px-8 text-center text-[var(--muted)]">Unknown block</div>;
    }
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  if (!venueId) {
    return (
      <div className="p-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold" style={{ color: "var(--primary)" }}>W</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Website Builder</h2>
          <p className="text-[var(--muted)] mb-4">Create a venue in Settings to start building your website.</p>
          <a href="/dashboard/settings" className="btn-primary inline-block">Go to Settings</a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Website Builder</h1>
          {venueSlug && (
            <a
              href={`/site/${venueSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
              style={{ color: theme.primaryColor }}
            >
              Live site: /site/{venueSlug}
            </a>
          )}
          {!venueSlug && (
            <p className="text-sm text-[var(--muted)]">
              Set a slug in <a href="/dashboard/settings" className="underline">Settings</a> to publish your site
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThemePanel(!showThemePanel)}
            className="btn-secondary text-sm"
          >
            Theme
          </button>
          <button onClick={() => setShowCreatePageModal(true)} className="btn-primary text-sm">
            + New Page
          </button>
        </div>
      </div>

      {/* Theme panel (collapsible) */}
      {showThemePanel && (
        <div className="mb-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Theme Settings</h3>
            <button onClick={() => setShowThemePanel(false)} className="text-[var(--muted)] hover:text-white text-sm">&times;</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" />
                <input value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={theme.backgroundColor} onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" />
                <input value={theme.backgroundColor} onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })} className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={theme.textColor} onChange={(e) => setTheme({ ...theme, textColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" />
                <input value={theme.textColor} onChange={(e) => setTheme({ ...theme, textColor: e.target.value })} className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Font</label>
              <select value={theme.fontFamily} onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm">
                <option value="Inter">Inter</option>
                <option value="DM Sans">DM Sans</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Roboto">Roboto</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Lora">Lora</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={saveTheme} className="btn-primary text-sm w-full" disabled={saving}>
                {saving ? "Saving..." : "Save Theme"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page tabs */}
      {pages.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 flex-shrink-0">
          {pages.map((page, idx) => (
            <div key={page.id} className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={() => { setActivePage(page); setActiveBlockId(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  activePage?.id === page.id
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-white border border-[var(--border)]"
                }`}
              >
                {page.title}
                {page.is_published && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />}
              </button>
              <div className="flex flex-col">
                <button onClick={() => movePage(page.id, "up")} disabled={idx === 0} className="text-[10px] text-[var(--muted)] hover:text-white disabled:opacity-20 leading-none px-0.5">&lsaquo;</button>
                <button onClick={() => movePage(page.id, "down")} disabled={idx === pages.length - 1} className="text-[10px] text-[var(--muted)] hover:text-white disabled:opacity-20 leading-none px-0.5">&rsaquo;</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main layout: left editor + right preview */}
      {activePage ? (
        <div className="flex gap-4 flex-1 min-h-0">
          {/* LEFT: Editor panel */}
          <div className="w-96 flex-shrink-0 flex flex-col min-h-0">
            {/* Page actions bar */}
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <button onClick={savePage} className="btn-primary text-sm flex-1" disabled={saving}>
                {saved ? "Saved!" : saving ? "Saving..." : "Save Page"}
              </button>
              <button onClick={togglePublish} className="btn-secondary text-sm">
                {activePage.is_published ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={() => { setEditingPageTitle(activePage.title); setShowPageSettings(true); }}
                className="btn-secondary text-sm px-2"
                title="Page settings"
              >
                ...
              </button>
            </div>

            {/* Page settings mini-panel */}
            {showPageSettings && (
              <div className="mb-3 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex-shrink-0 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">Page Title</label>
                  <input
                    value={editingPageTitle}
                    onChange={(e) => setEditingPageTitle(e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={savePageTitle} className="btn-primary text-xs">Save</button>
                  <button onClick={() => setShowPageSettings(false)} className="btn-secondary text-xs">Cancel</button>
                  <button onClick={deletePage} className="ml-auto text-xs text-red-400 hover:text-red-300">Delete Page</button>
                </div>
              </div>
            )}

            {/* Block list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {activePage.content.map((block, idx) => (
                <div
                  key={block.id}
                  className={`rounded-lg border transition cursor-pointer ${
                    activeBlockId === block.id
                      ? "border-[var(--primary)] bg-[var(--surface)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--muted)]"
                  }`}
                >
                  {/* Block header (always visible) */}
                  <div
                    className="flex items-center gap-2 px-3 py-2.5"
                    onClick={() => setActiveBlockId(activeBlockId === block.id ? null : block.id)}
                  >
                    <span className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: theme.primaryColor + "20", color: theme.primaryColor }}>
                      {blockIcons[block.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">{blockLabels[block.type]}</span>
                      <span className="text-xs text-[var(--muted)] truncate block">
                        {block.content.heading || block.content.style || (block.type === "social" ? "Social links" : block.type === "embed" ? "Embed" : "")}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => moveBlock(block.id, "up")} disabled={idx === 0} className="p-1 text-xs text-[var(--muted)] hover:text-white disabled:opacity-20">^</button>
                      <button onClick={() => moveBlock(block.id, "down")} disabled={idx === activePage.content.length - 1} className="p-1 text-xs text-[var(--muted)] hover:text-white disabled:opacity-20">v</button>
                      <button onClick={() => duplicateBlock(block.id)} className="p-1 text-xs text-[var(--muted)] hover:text-white" title="Duplicate">D</button>
                      <button onClick={() => removeBlock(block.id)} className="p-1 text-xs text-red-400 hover:text-red-300" title="Delete">&times;</button>
                    </div>
                  </div>

                  {/* Block editor (expanded) */}
                  {activeBlockId === block.id && (
                    <div className="px-3 pb-3 border-t border-[var(--border)] pt-3">
                      {renderBlockEditor(block)}
                    </div>
                  )}
                </div>
              ))}

              {/* Add block button */}
              <div className="relative">
                <button
                  onClick={() => setShowAddBlock(!showAddBlock)}
                  className="w-full py-3 rounded-lg border-2 border-dashed border-[var(--border)] text-sm text-[var(--muted)] hover:text-white hover:border-[var(--primary)] transition"
                >
                  + Add Block
                </button>
                {showAddBlock && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl p-3 grid grid-cols-2 gap-1.5">
                    {(Object.keys(blockTemplates) as BlockType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => addBlock(type)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition text-left"
                      >
                        <span className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: theme.primaryColor + "20", color: theme.primaryColor }}>
                          {blockIcons[type]}
                        </span>
                        <span className="text-xs font-medium">{blockLabels[type]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Live preview */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="text-sm font-medium text-[var(--muted)]">Preview</h3>
              {activePage.is_published && venueSlug && (
                <a
                  href={`/site/${venueSlug}/${activePage.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:underline"
                  style={{ color: theme.primaryColor }}
                >
                  Open live page
                </a>
              )}
            </div>
            <div
              className="flex-1 overflow-y-auto rounded-xl border border-[var(--border)]"
              style={{ backgroundColor: theme.backgroundColor, color: theme.textColor, fontFamily: theme.fontFamily }}
            >
              {/* Nav preview */}
              <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: theme.textColor + "15" }}>
                <span className="text-lg font-bold">{venueName || "Your Venue"}</span>
                <div className="flex gap-4 text-sm" style={{ color: theme.textColor + "80" }}>
                  {pages.filter((p) => p.is_published).map((p) => (
                    <span key={p.id} className={`cursor-default ${p.id === activePage.id ? "font-semibold" : ""}`} style={p.id === activePage.id ? { color: theme.primaryColor } : undefined}>
                      {p.title}
                    </span>
                  ))}
                </div>
              </nav>

              {/* Blocks */}
              {activePage.content.map((block) => (
                <div
                  key={block.id}
                  className={`relative transition ${activeBlockId === block.id ? "ring-2 ring-inset" : "hover:ring-1 hover:ring-inset"}`}
                  style={{ outlineColor: theme.primaryColor, outlineStyle: activeBlockId === block.id ? "solid" : undefined, outlineWidth: activeBlockId === block.id ? "2px" : undefined }}
                  onClick={() => setActiveBlockId(block.id)}
                >
                  {renderBlockPreview(block)}
                </div>
              ))}

              {activePage.content.length === 0 && (
                <div className="py-24 text-center" style={{ color: theme.textColor + "60" }}>
                  <p className="text-lg mb-2">Empty page</p>
                  <p className="text-sm">Add blocks from the left panel to build your page.</p>
                </div>
              )}

              {/* Footer preview */}
              <footer className="border-t py-8 px-6 text-center text-sm" style={{ borderColor: theme.textColor + "15", color: theme.textColor + "60" }}>
                <p>&copy; {new Date().getFullYear()} {venueName || "Your Venue"}. All rights reserved.</p>
                <p className="mt-2 text-xs opacity-50">Powered by Juke Digital</p>
              </footer>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold" style={{ color: "var(--primary)" }}>W</span>
            </div>
            <h2 className="text-lg font-semibold mb-2">
              {pages.length === 0 ? "Create Your First Page" : "Select a Page"}
            </h2>
            <p className="text-[var(--muted)] mb-4">
              {pages.length === 0
                ? "Start building your website by creating your first page."
                : "Choose a page from the tabs above to start editing."}
            </p>
            {pages.length === 0 && (
              <button onClick={() => setShowCreatePageModal(true)} className="btn-primary">
                + Create First Page
              </button>
            )}
          </div>
        </div>
      )}

      {/* Media Library modal */}
      {mediaTarget && venueId && (
        <MediaLibrary
          venueId={venueId}
          onSelect={handleMediaSelect}
          onClose={() => setMediaTarget(null)}
        />
      )}

      {/* Create Page modal */}
      {showCreatePageModal && (
        <InputModal
          title="Create New Page"
          placeholder="e.g., Home, Menu, Events, About"
          venueId={venueId ?? undefined}
          confirmText="Create Page"
          onConfirm={createPage}
          onClose={() => setShowCreatePageModal(false)}
        />
      )}
    </div>
  );
}

/* ================================================================ */
/*  Reusable sub-components                                         */
/* ================================================================ */

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--muted)] mb-1">{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm"
      />
    </div>
  );
}

function ImageField({
  label,
  value,
  onChoose,
  onClear,
  small,
}: {
  label: string;
  value: string;
  onChoose: () => void;
  onClear: () => void;
  small?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--muted)] mb-1">{label}</label>
      {value ? (
        <div className="flex items-center gap-2">
          <img src={value} alt="" className={`${small ? "w-12 h-12" : "w-20 h-14"} object-cover rounded-lg border border-[var(--border)]`} />
          <div className="flex flex-col gap-1">
            <button onClick={onChoose} className="btn-secondary text-xs">Change</button>
            <button onClick={onClear} className="text-xs text-red-400 hover:text-red-300">Remove</button>
          </div>
        </div>
      ) : (
        <button onClick={onChoose} className="btn-secondary text-xs">Choose Image</button>
      )}
    </div>
  );
}

function SocialLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 rounded-lg bg-white/5 border border-[var(--border)] text-sm font-medium hover:bg-white/10 transition"
    >
      {label}
    </a>
  );
}
