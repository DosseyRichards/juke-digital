"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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

interface BlockStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  textAlign?: "left" | "center" | "right";
  textColor?: string;
  maxWidth?: "full" | "contained" | "narrow";
}

interface WebsiteBlock {
  id: string;
  type: BlockType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any>;
  style?: BlockStyle;
  hidden?: boolean;
  cssClass?: string;
  anchorId?: string;
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

type ViewportMode = "desktop" | "tablet" | "mobile";

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
      alignment: "center",
      minHeight: "500",
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
      height: "40",
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
  hero: "\u2B50",
  text: "\uD83D\uDCC4",
  gallery: "\uD83D\uDDBC\uFE0F",
  menu_section: "\uD83C\uDF7D\uFE0F",
  hours: "\uD83D\uDD50",
  contact: "\uD83D\uDCCD",
  testimonials: "\uD83D\uDCAC",
  events: "\uD83C\uDF89",
  social: "\uD83C\uDF10",
  cta: "\uD83D\uDCE3",
  divider: "\u2796",
  embed: "\uD83D\uDCBB",
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
  const [mediaTarget, setMediaTarget] = useState<{ blockId: string; field: string; index?: number } | null>(null);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [leftSidebarTab, setLeftSidebarTab] = useState<"blocks" | "layers">("layers");
  const [rightPanelSection, setRightPanelSection] = useState<"content" | "style" | "advanced">("content");
  const [undoStack, setUndoStack] = useState<WebsiteBlock[][]>([]);
  const [redoStack, setRedoStack] = useState<WebsiteBlock[][]>([]);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedLayerIdx, setDraggedLayerIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
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

  /* ---- Keyboard shortcuts ---- */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        savePage();
      }
      if (e.key === "Escape") {
        setActiveBlockId(null);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && activeBlockId) {
        const el = document.activeElement;
        if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable)) return;
        e.preventDefault();
        removeBlock(activeBlockId, true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBlockId, activePage, undoStack, redoStack]);

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

  /* ---- Undo / Redo ---- */

  const pushUndo = () => {
    if (!activePage) return;
    setUndoStack((prev) => [...prev.slice(-29), JSON.parse(JSON.stringify(activePage.content))]);
    setRedoStack([]);
  };

  const undo = () => {
    if (!activePage || undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, JSON.parse(JSON.stringify(activePage.content))]);
    setUndoStack((u) => u.slice(0, -1));
    setActivePage({ ...activePage, content: prev });
  };

  const redo = () => {
    if (!activePage || redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, JSON.parse(JSON.stringify(activePage.content))]);
    setRedoStack((r) => r.slice(0, -1));
    setActivePage({ ...activePage, content: next });
  };

  /* ---- Block operations ---- */

  const addBlock = (type: BlockType) => {
    if (!activePage) return;
    pushUndo();
    const newBlock = blockTemplates[type]();
    const updated = { ...activePage, content: [...activePage.content, newBlock] };
    setActivePage(updated);
    setActiveBlockId(newBlock.id);
    setLeftSidebarTab("layers");
  };

  const updateBlockContent = (blockId: string, field: string, value: unknown) => {
    if (!activePage) return;
    const updated = {
      ...activePage,
      content: activePage.content.map((b) => (b.id === blockId ? { ...b, content: { ...b.content, [field]: value } } : b)),
    };
    setActivePage(updated);
  };

  const updateBlockStyle = (blockId: string, field: string, value: unknown) => {
    if (!activePage) return;
    const updated = {
      ...activePage,
      content: activePage.content.map((b) => (b.id === blockId ? { ...b, style: { ...(b.style || {}), [field]: value } } : b)),
    };
    setActivePage(updated);
  };

  const updateBlockMeta = (blockId: string, field: string, value: unknown) => {
    if (!activePage) return;
    const updated = {
      ...activePage,
      content: activePage.content.map((b) => (b.id === blockId ? { ...b, [field]: value } : b)),
    };
    setActivePage(updated);
  };

  const removeBlock = (blockId: string, skipConfirm = false) => {
    if (!activePage) return;
    if (!skipConfirm && !confirm("Remove this block?")) return;
    pushUndo();
    const updated = { ...activePage, content: activePage.content.filter((b) => b.id !== blockId) };
    setActivePage(updated);
    if (activeBlockId === blockId) setActiveBlockId(null);
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    if (!activePage) return;
    pushUndo();
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
    pushUndo();
    const idx = activePage.content.findIndex((b) => b.id === blockId);
    if (idx === -1) return;
    const original = activePage.content[idx];
    const clone = { ...JSON.parse(JSON.stringify(original)), id: crypto.randomUUID() };
    const newContent = [...activePage.content];
    newContent.splice(idx + 1, 0, clone);
    setActivePage({ ...activePage, content: newContent });
    setActiveBlockId(clone.id);
  };

  const toggleBlockVisibility = (blockId: string) => {
    if (!activePage) return;
    const updated = {
      ...activePage,
      content: activePage.content.map((b) => (b.id === blockId ? { ...b, hidden: !b.hidden } : b)),
    };
    setActivePage(updated);
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
      const arr = [...block.content[field]];
      arr.push(url);
      updateBlockContent(blockId, field, arr);
    } else if (field.includes(".")) {
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

  /* ---- Inline edit handler ---- */

  const handleInlineEdit = (blockId: string, field: string, value: string) => {
    updateBlockContent(blockId, field, value);
  };

  /* ---- Layer drag handlers ---- */

  const handleLayerDragStart = (idx: number) => {
    setDraggedLayerIdx(idx);
  };

  const handleLayerDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleLayerDrop = (idx: number) => {
    if (draggedLayerIdx === null || !activePage) return;
    pushUndo();
    const newContent = [...activePage.content];
    const [moved] = newContent.splice(draggedLayerIdx, 1);
    newContent.splice(idx, 0, moved);
    setActivePage({ ...activePage, content: newContent });
    setDraggedLayerIdx(null);
    setDragOverIdx(null);
  };

  /* ---- Viewport width ---- */

  const viewportWidth = viewportMode === "desktop" ? "100%" : viewportMode === "tablet" ? "768px" : "375px";

  /* ---- Max width helper ---- */

  const getMaxWidthClass = (mw?: string) => {
    if (mw === "narrow") return "max-w-2xl";
    if (mw === "contained") return "max-w-5xl";
    return "w-full";
  };

  /* ================================================================ */
  /*  BLOCK PREVIEW                                                    */
  /* ================================================================ */

  const renderBlockPreview = (block: WebsiteBlock) => {
    const c = block.content;
    const s = block.style || {};

    const wrapStyle: React.CSSProperties = {
      backgroundColor: s.backgroundColor || undefined,
      backgroundImage: s.backgroundImage ? `url(${s.backgroundImage})` : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
      paddingTop: s.paddingTop ? `${s.paddingTop}px` : undefined,
      paddingRight: s.paddingRight ? `${s.paddingRight}px` : undefined,
      paddingBottom: s.paddingBottom ? `${s.paddingBottom}px` : undefined,
      paddingLeft: s.paddingLeft ? `${s.paddingLeft}px` : undefined,
      textAlign: s.textAlign || undefined,
      color: s.textColor || undefined,
    };

    const inner = (content: React.ReactNode) => (
      <div style={wrapStyle} className={s.maxWidth ? getMaxWidthClass(s.maxWidth) + " mx-auto" : ""}>
        {content}
      </div>
    );

    switch (block.type) {
      case "hero":
        return inner(
          <div
            className="relative overflow-hidden"
            style={{
              backgroundImage: c.backgroundImage ? `url(${c.backgroundImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: `${c.minHeight || 500}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: c.alignment === "left" ? "flex-start" : c.alignment === "right" ? "flex-end" : "center",
            }}
          >
            {c.backgroundImage && (
              <div className="absolute inset-0 bg-black" style={{ opacity: parseFloat(c.overlayOpacity) || 0.5 }} />
            )}
            {!c.backgroundImage && (
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/20 to-transparent" />
            )}
            <div className="relative z-10 px-8 py-24 w-full" style={{ textAlign: (c.alignment as React.CSSProperties["textAlign"]) || "center" }}>
              <h1
                className="text-4xl md:text-5xl font-bold mb-3 outline-none"
                contentEditable={!previewMode}
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit(block.id, "heading", e.currentTarget.textContent || "")}
              >
                {c.heading}
              </h1>
              <p
                className="text-lg md:text-xl opacity-70 mb-6 outline-none"
                contentEditable={!previewMode}
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit(block.id, "subheading", e.currentTarget.textContent || "")}
              >
                {c.subheading}
              </p>
              {c.buttonText && (
                <span
                  className="inline-block px-8 py-3 rounded-lg font-semibold text-white cursor-text outline-none"
                  style={{ backgroundColor: theme.primaryColor }}
                  contentEditable={!previewMode}
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit(block.id, "buttonText", e.currentTarget.textContent || "")}
                >
                  {c.buttonText}
                </span>
              )}
            </div>
          </div>
        );

      case "text":
        return inner(
          <div className="py-16 px-8 max-w-4xl mx-auto">
            {c.image ? (
              <div className={`flex flex-col md:flex-row gap-8 items-center ${c.imagePosition === "left" ? "md:flex-row-reverse" : ""}`}>
                <div className="flex-1">
                  <h2
                    className="text-3xl font-bold mb-4 outline-none"
                    contentEditable={!previewMode}
                    suppressContentEditableWarning
                    onBlur={(e) => handleInlineEdit(block.id, "heading", e.currentTarget.textContent || "")}
                  >
                    {c.heading}
                  </h2>
                  <p
                    className="opacity-70 text-lg leading-relaxed whitespace-pre-wrap outline-none"
                    contentEditable={!previewMode}
                    suppressContentEditableWarning
                    onBlur={(e) => handleInlineEdit(block.id, "body", e.currentTarget.textContent || "")}
                  >
                    {c.body}
                  </p>
                </div>
                <div className="flex-1">
                  <img src={c.image} alt={c.imageCaption || ""} className="w-full rounded-xl" />
                  {c.imageCaption && <p className="text-sm opacity-60 mt-2 text-center">{c.imageCaption}</p>}
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <h2
                  className="text-3xl font-bold mb-4 outline-none"
                  contentEditable={!previewMode}
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit(block.id, "heading", e.currentTarget.textContent || "")}
                >
                  {c.heading}
                </h2>
                <p
                  className="opacity-70 text-lg leading-relaxed whitespace-pre-wrap outline-none"
                  contentEditable={!previewMode}
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit(block.id, "body", e.currentTarget.textContent || "")}
                >
                  {c.body}
                </p>
              </div>
            )}
          </div>
        );

      case "gallery":
        return inner(
          <div className="py-16 px-8 max-w-5xl mx-auto">
            <h2
              className="text-3xl font-bold mb-8 text-center outline-none"
              contentEditable={!previewMode}
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit(block.id, "heading", e.currentTarget.textContent || "")}
            >
              {c.heading}
            </h2>
            {(c.images || []).length > 0 ? (
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${c.columns || 3}, 1fr)` }}>
                {(c.images || []).map((img: string, i: number) => (
                  <img key={i} src={img} alt="" className="w-full h-48 object-cover rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-40">
                <p className="text-lg">No images added yet</p>
                <p className="text-sm mt-1">Select this block and add images in the right panel</p>
              </div>
            )}
          </div>
        );

      case "menu_section":
        return inner(
          <div className="py-16 px-8 max-w-3xl mx-auto">
            <h2
              className="text-3xl font-bold mb-8 text-center outline-none"
              contentEditable={!previewMode}
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit(block.id, "heading", e.currentTarget.textContent || "")}
            >
              {c.heading}
            </h2>
            <div className="space-y-4">
              {(c.items || []).map((item: { name: string; description: string; price: string; image: string }, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      <span className="font-bold flex-shrink-0" style={{ color: theme.primaryColor }}>{item.price}</span>
                    </div>
                    {item.description && <p className="text-sm opacity-60 mt-1">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "hours":
        return inner(
          <div className="py-16 px-8 max-w-lg mx-auto">
            <h2
              className="text-3xl font-bold mb-6 text-center outline-none"
              contentEditable={!previewMode}
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit(block.id, "heading", e.currentTarget.textContent || "")}
            >
              {c.heading}
            </h2>
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <div key={day} className="flex justify-between py-3 border-b border-white/10 text-lg">
                <span className="capitalize font-medium">{day}</span>
                <span className="opacity-60">{c[day]}</span>
              </div>
            ))}
          </div>
        );

      case "contact":
        return inner(
          <div className="py-16 px-8">
            <h2
              className="text-3xl font-bold mb-6 text-center outline-none"
              contentEditable={!previewMode}
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit(block.id, "heading", e.currentTarget.textContent || "")}
            >
              {c.heading}
            </h2>
            <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {c.address && (
                  <div>
                    <p className="text-sm font-medium opacity-60 mb-1">Address</p>
                    <p className="text-lg">{c.address}</p>
                  </div>
                )}
                {c.phone && (
                  <div>
                    <p className="text-sm font-medium opacity-60 mb-1">Phone</p>
                    <p className="text-lg">{c.phone}</p>
                  </div>
                )}
                {c.email && (
                  <div>
                    <p className="text-sm font-medium opacity-60 mb-1">Email</p>
                    <p className="text-lg">{c.email}</p>
                  </div>
                )}
              </div>
              {c.mapEmbed && (
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <iframe src={c.mapEmbed} className="w-full h-64" loading="lazy" title="Map" />
                </div>
              )}
            </div>
          </div>
        );

      case "testimonials":
        return inner(
          <div className="py-16 px-8 max-w-4xl mx-auto">
            <h2
              className="text-3xl font-bold mb-8 text-center outline-none"
              contentEditable={!previewMode}
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit(block.id, "heading", e.currentTarget.textContent || "")}
            >
              {c.heading}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {(c.items || []).map((item: { quote: string; author: string; role: string }, i: number) => (
                <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-lg mb-4 italic">&ldquo;{item.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{item.author}</p>
                    {item.role && <p className="text-sm opacity-60">{item.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "events":
        return inner(
          <div className="py-16 px-8 max-w-4xl mx-auto">
            <h2
              className="text-3xl font-bold mb-8 text-center outline-none"
              contentEditable={!previewMode}
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit(block.id, "heading", e.currentTarget.textContent || "")}
            >
              {c.heading}
            </h2>
            {c.autoFeed ? (
              <p className="text-center opacity-60">[Events auto-pulled from your events table]</p>
            ) : (
              <div className="space-y-4">
                {(c.items || []).map((item: { title: string; date: string; description: string; image: string }, i: number) => (
                  <div key={i} className="flex gap-6 items-start p-4 rounded-xl bg-white/5 border border-white/10">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm font-medium" style={{ color: theme.primaryColor }}>{item.date}</p>
                      {item.description && <p className="opacity-60 mt-1">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "social":
        return inner(
          <div className="py-12 px-8 text-center">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {c.instagram && <SocialLink label="Instagram" url={c.instagram} />}
              {c.facebook && <SocialLink label="Facebook" url={c.facebook} />}
              {c.twitter && <SocialLink label="Twitter" url={c.twitter} />}
              {c.tiktok && <SocialLink label="TikTok" url={c.tiktok} />}
              {c.yelp && <SocialLink label="Yelp" url={c.yelp} />}
              {c.google && <SocialLink label="Google" url={c.google} />}
              {!c.instagram && !c.facebook && !c.twitter && !c.tiktok && !c.yelp && !c.google && (
                <p className="opacity-50">Add social links in the properties panel</p>
              )}
            </div>
          </div>
        );

      case "cta":
        return inner(
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
              <h2
                className="text-3xl font-bold mb-3 outline-none"
                contentEditable={!previewMode}
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit(block.id, "heading", e.currentTarget.textContent || "")}
              >
                {c.heading}
              </h2>
              <p
                className="opacity-70 text-lg mb-6 max-w-xl mx-auto outline-none"
                contentEditable={!previewMode}
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit(block.id, "body", e.currentTarget.textContent || "")}
              >
                {c.body}
              </p>
              {c.buttonText && (
                <span
                  className="inline-block px-8 py-3 rounded-lg font-semibold text-white cursor-text outline-none"
                  style={{ backgroundColor: theme.primaryColor }}
                  contentEditable={!previewMode}
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit(block.id, "buttonText", e.currentTarget.textContent || "")}
                >
                  {c.buttonText}
                </span>
              )}
            </div>
          </div>
        );

      case "divider":
        if (c.style === "space") return inner(<div style={{ height: `${c.height || 40}px` }} />);
        if (c.style === "dots") return inner(<div className="text-center text-2xl tracking-[1em] opacity-40" style={{ padding: `${(c.height || 40) / 2}px 0` }}>...</div>);
        return inner(<div style={{ padding: `${(c.height || 40) / 2}px 32px` }}><hr className="border-white/10" /></div>);

      case "embed":
        return inner(
          <div className="py-8 px-8 max-w-4xl mx-auto">
            {c.code ? (
              <div dangerouslySetInnerHTML={{ __html: c.code }} className="[&>iframe]:w-full [&>iframe]:rounded-xl [&>iframe]:min-h-[300px]" />
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-40">
                <p className="text-lg">Embed block</p>
                <p className="text-sm mt-1">Add embed code in the properties panel</p>
              </div>
            )}
          </div>
        );

      default:
        return <div className="py-8 px-8 text-center opacity-50">Unknown block</div>;
    }
  };

  /* ================================================================ */
  /*  BLOCK EDITOR (Right Panel)                                       */
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
              <span className="text-xs text-[var(--muted)]">{Math.round((parseFloat(c.overlayOpacity) || 0.5) * 100)}%</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Alignment</label>
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => updateBlockContent(block.id, "alignment", a)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${c.alignment === a ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-white"}`}
                  >
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Min Height</label>
              <input
                type="range"
                min="300"
                max="900"
                step="50"
                value={c.minHeight || "500"}
                onChange={(e) => updateBlockContent(block.id, "minHeight", e.target.value)}
                className="w-full accent-[var(--primary)]"
              />
              <span className="text-xs text-[var(--muted)]">{c.minHeight || 500}px</span>
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
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm resize-y"
              />
              <p className="text-xs text-[var(--muted)] mt-1">Tip: You can also edit text directly in the preview</p>
            </div>
            <ImageField
              label="Side Image (optional)"
              value={c.image}
              onChoose={() => openMedia(block.id, "image")}
              onClear={() => updateBlockContent(block.id, "image", "")}
            />
            {c.image && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">Image Position</label>
                  <div className="flex gap-1">
                    {(["left", "right"] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => updateBlockContent(block.id, "imagePosition", pos)}
                        className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${c.imagePosition === pos ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-white"}`}
                      >
                        {pos.charAt(0).toUpperCase() + pos.slice(1)}
                      </button>
                    ))}
                  </div>
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
              <div className="flex gap-1">
                {["2", "3", "4"].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateBlockContent(block.id, "columns", n)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${c.columns === n ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-white"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
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
                className="w-full py-2 rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--muted)] hover:text-white hover:border-[var(--primary)] transition"
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
                className="w-full py-2 rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--muted)] hover:text-white hover:border-[var(--primary)] transition"
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
              <div key={day} className="flex items-center gap-2">
                <label className="w-20 text-xs font-medium text-[var(--muted)] capitalize">{day}</label>
                <input
                  value={c[day] || ""}
                  onChange={(e) => updateBlockContent(block.id, day, e.target.value)}
                  placeholder="e.g. 4pm - 12am or Closed"
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm"
                />
              </div>
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
              {c.mapEmbed && (
                <div className="mt-2 rounded-lg overflow-hidden border border-[var(--border)]">
                  <iframe src={c.mapEmbed} className="w-full h-32" loading="lazy" title="Map Preview" />
                </div>
              )}
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
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 text-sm resize-y"
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
                className="w-full py-2 rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--muted)] hover:text-white hover:border-[var(--primary)] transition"
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
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 text-sm resize-y"
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
                  className="w-full py-2 rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--muted)] hover:text-white hover:border-[var(--primary)] transition"
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
            <SocialField icon="\uD83D\uDCF7" label="Instagram" value={c.instagram} onChange={(v) => updateBlockContent(block.id, "instagram", v)} placeholder="https://instagram.com/..." />
            <SocialField icon="\uD83D\uDCD8" label="Facebook" value={c.facebook} onChange={(v) => updateBlockContent(block.id, "facebook", v)} placeholder="https://facebook.com/..." />
            <SocialField icon="\uD83D\uDC26" label="Twitter / X" value={c.twitter} onChange={(v) => updateBlockContent(block.id, "twitter", v)} placeholder="https://x.com/..." />
            <SocialField icon="\uD83C\uDFB5" label="TikTok" value={c.tiktok} onChange={(v) => updateBlockContent(block.id, "tiktok", v)} placeholder="https://tiktok.com/@..." />
            <SocialField icon="\u2B50" label="Yelp" value={c.yelp} onChange={(v) => updateBlockContent(block.id, "yelp", v)} placeholder="https://yelp.com/biz/..." />
            <SocialField icon="\uD83D\uDCCD" label="Google Business" value={c.google} onChange={(v) => updateBlockContent(block.id, "google", v)} placeholder="https://g.page/..." />
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
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm resize-y"
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
              <div className="flex gap-1">
                {(["line", "space", "dots"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateBlockContent(block.id, "style", s)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${c.style === s ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-white"}`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Height / Spacing</label>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={c.height || "40"}
                onChange={(e) => updateBlockContent(block.id, "height", e.target.value)}
                className="w-full accent-[var(--primary)]"
              />
              <span className="text-xs text-[var(--muted)]">{c.height || 40}px</span>
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
                rows={8}
                placeholder='<iframe src="..." />'
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm font-mono resize-y"
              />
              <p className="text-xs text-[var(--muted)] mt-1">Paste any embed code, iframe, or HTML snippet</p>
            </div>
            {c.code && (
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Preview</label>
                <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-white p-2">
                  <iframe
                    srcDoc={c.code}
                    sandbox="allow-scripts"
                    className="w-full h-40 border-0"
                    title="Embed Preview"
                  />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <p className="text-sm text-[var(--muted)]">No editor for this block type.</p>;
    }
  };

  /* ---- Style editor ---- */

  const renderStyleEditor = (block: WebsiteBlock) => {
    const s = block.style || {};
    const [linkedPadding, setLinkedPadding] = useState(true);

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={s.backgroundColor || "#000000"}
              onChange={(e) => updateBlockStyle(block.id, "backgroundColor", e.target.value)}
              className="w-8 h-8 rounded border-0 cursor-pointer"
            />
            <input
              value={s.backgroundColor || ""}
              onChange={(e) => updateBlockStyle(block.id, "backgroundColor", e.target.value)}
              placeholder="Inherit"
              className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-xs font-mono"
            />
            {s.backgroundColor && (
              <button onClick={() => updateBlockStyle(block.id, "backgroundColor", "")} className="text-xs text-red-400">&times;</button>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-[var(--muted)]">Padding</label>
            <button
              onClick={() => setLinkedPadding(!linkedPadding)}
              className={`text-xs px-2 py-0.5 rounded ${linkedPadding ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)] text-[var(--muted)]"}`}
            >
              {linkedPadding ? "Linked" : "Unlinked"}
            </button>
          </div>
          {linkedPadding ? (
            <input
              type="number"
              value={s.paddingTop || ""}
              onChange={(e) => {
                const v = e.target.value;
                updateBlockStyle(block.id, "paddingTop", v);
                updateBlockStyle(block.id, "paddingRight", v);
                updateBlockStyle(block.id, "paddingBottom", v);
                updateBlockStyle(block.id, "paddingLeft", v);
              }}
              placeholder="0"
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm"
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {(["Top", "Right", "Bottom", "Left"] as const).map((side) => (
                <div key={side}>
                  <label className="text-[10px] text-[var(--muted)]">{side}</label>
                  <input
                    type="number"
                    value={s[`padding${side}` as keyof BlockStyle] || ""}
                    onChange={(e) => updateBlockStyle(block.id, `padding${side}`, e.target.value)}
                    placeholder="0"
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">Text Alignment</label>
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                onClick={() => updateBlockStyle(block.id, "textAlign", a)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${s.textAlign === a ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-white"}`}
              >
                {a === "left" ? "\u2190" : a === "center" ? "\u2194" : "\u2192"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">Text Color Override</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={s.textColor || theme.textColor}
              onChange={(e) => updateBlockStyle(block.id, "textColor", e.target.value)}
              className="w-8 h-8 rounded border-0 cursor-pointer"
            />
            <input
              value={s.textColor || ""}
              onChange={(e) => updateBlockStyle(block.id, "textColor", e.target.value)}
              placeholder="Inherit from theme"
              className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-xs font-mono"
            />
            {s.textColor && (
              <button onClick={() => updateBlockStyle(block.id, "textColor", "")} className="text-xs text-red-400">&times;</button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">Max Width</label>
          <div className="flex gap-1">
            {(["full", "contained", "narrow"] as const).map((mw) => (
              <button
                key={mw}
                onClick={() => updateBlockStyle(block.id, "maxWidth", mw)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${s.maxWidth === mw ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-white"}`}
              >
                {mw.charAt(0).toUpperCase() + mw.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ---- Advanced editor ---- */

  const renderAdvancedEditor = (block: WebsiteBlock) => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">CSS Class</label>
          <input
            value={block.cssClass || ""}
            onChange={(e) => updateBlockMeta(block.id, "cssClass", e.target.value)}
            placeholder="custom-class"
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">Anchor ID</label>
          <input
            value={block.anchorId || ""}
            onChange={(e) => updateBlockMeta(block.id, "anchorId", e.target.value)}
            placeholder="section-name"
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm font-mono"
          />
          <p className="text-xs text-[var(--muted)] mt-1">Used for anchor links like #section-name</p>
        </div>
      </div>
    );
  };

  /* ---- Theme editor (shown when no block is selected) ---- */

  const renderThemeEditor = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold mb-3">Theme Settings</h3>
        <p className="text-xs text-[var(--muted)] mb-4">These styles apply to your entire website.</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Primary Color</label>
        <div className="flex items-center gap-2">
          <input type="color" value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" />
          <input value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-xs font-mono" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Background Color</label>
        <div className="flex items-center gap-2">
          <input type="color" value={theme.backgroundColor} onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" />
          <input value={theme.backgroundColor} onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })} className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-xs font-mono" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Text Color</label>
        <div className="flex items-center gap-2">
          <input type="color" value={theme.textColor} onChange={(e) => setTheme({ ...theme, textColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" />
          <input value={theme.textColor} onChange={(e) => setTheme({ ...theme, textColor: e.target.value })} className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-xs font-mono" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Font Family</label>
        <select value={theme.fontFamily} onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm">
          <option value="Inter">Inter</option>
          <option value="DM Sans">DM Sans</option>
          <option value="Playfair Display">Playfair Display</option>
          <option value="Roboto">Roboto</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Lora">Lora</option>
        </select>
      </div>

      <button onClick={saveTheme} className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition" style={{ backgroundColor: "var(--primary)" }} disabled={saving}>
        {saving ? "Saving..." : "Save Theme"}
      </button>
    </div>
  );

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
    <div className="h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
      {/* ===== TOP TOOLBAR ===== */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)] flex-shrink-0 gap-3">
        {/* Left group */}
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-tight whitespace-nowrap">Website Builder</h1>

          {/* Page selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPageDropdown(!showPageDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm hover:border-[var(--muted)] transition min-w-[140px]"
            >
              <span className="truncate">{activePage?.title || "Select page"}</span>
              <svg className="w-3 h-3 flex-shrink-0 opacity-50" viewBox="0 0 12 12" fill="none"><path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            {showPageDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowPageDropdown(false)} />
                <div className="absolute left-0 top-full mt-1 z-40 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden">
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => { setActivePage(page); setActiveBlockId(null); setShowPageDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition ${activePage?.id === page.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "hover:bg-[var(--surface-hover)]"}`}
                      >
                        <span className="flex-1 truncate">{page.title}</span>
                        {page.is_published && <span className="w-2 h-2 rounded-full bg-[var(--success)] flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[var(--border)] p-2">
                    <button
                      onClick={() => { setShowCreatePageModal(true); setShowPageDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--surface-hover)] rounded-lg transition"
                    >
                      + New Page
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center group - viewport modes */}
        <div className="flex items-center gap-1 bg-[var(--background)] rounded-lg p-0.5 border border-[var(--border)]">
          {([
            { mode: "desktop" as const, label: "Desktop", icon: "\uD83D\uDDA5\uFE0F" },
            { mode: "tablet" as const, label: "Tablet", icon: "\uD83D\uDCF1" },
            { mode: "mobile" as const, label: "Mobile", icon: "\uD83D\uDCF2" },
          ]).map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setViewportMode(mode)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${viewportMode === mode ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--muted)] hover:text-white"}`}
              title={label}
            >
              {icon}
            </button>
          ))}
          <div className="w-px h-4 bg-[var(--border)] mx-1" />
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${previewMode ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-white"}`}
            title="Preview Mode"
          >
            {previewMode ? "Editing" : "Preview"}
          </button>
        </div>

        {/* Right group */}
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className="p-1.5 rounded-md text-[var(--muted)] hover:text-white hover:bg-[var(--surface-hover)] disabled:opacity-25 transition"
              title="Undo (Cmd+Z)"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h8a3 3 0 010 6H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 5L3 8l2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-md text-[var(--muted)] hover:text-white hover:bg-[var(--surface-hover)] disabled:opacity-25 transition"
              title="Redo (Cmd+Shift+Z)"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M13 8H5a3 3 0 000 6h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M11 5l2 3-2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          <div className="w-px h-5 bg-[var(--border)]" />

          {/* Publish toggle */}
          {activePage && (
            <button
              onClick={togglePublish}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activePage.is_published ? "bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30" : "bg-[var(--surface-hover)] text-[var(--muted)] border border-[var(--border)]"}`}
            >
              {activePage.is_published ? "Published" : "Draft"}
            </button>
          )}

          {/* Save */}
          <button
            onClick={savePage}
            disabled={saving || !activePage}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-white transition disabled:opacity-50"
            style={{ backgroundColor: saved ? "var(--success)" : "var(--primary)" }}
          >
            {saved ? "\u2713 Saved" : saving ? "Saving..." : "Save"}
          </button>

          {/* View Live */}
          {venueSlug && activePage && (
            <a
              href={`/site/${venueSlug}/${activePage.slug === "home" ? "" : activePage.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-[var(--muted)] hover:text-white hover:bg-[var(--surface-hover)] transition"
              title="View Live"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M6 3h7v7M13 3L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          )}

          {/* Page settings */}
          {activePage && (
            <button
              onClick={deletePage}
              className="p-1.5 rounded-md text-[var(--muted)] hover:text-red-400 hover:bg-[var(--surface-hover)] transition"
              title="Delete Page"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M4 5h8M6 5V3h4v2M5 5l.5 8h5l.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* ===== MAIN THREE-PANEL LAYOUT ===== */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ===== LEFT SIDEBAR ===== */}
        <div className="w-64 flex-shrink-0 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col overflow-hidden transition-all duration-200">
          {/* Sidebar tabs */}
          <div className="flex border-b border-[var(--border)] flex-shrink-0">
            <button
              onClick={() => setLeftSidebarTab("blocks")}
              className={`flex-1 py-2.5 text-xs font-medium transition ${leftSidebarTab === "blocks" ? "text-white border-b-2 border-[var(--primary)]" : "text-[var(--muted)] hover:text-white"}`}
            >
              Add Blocks
            </button>
            <button
              onClick={() => setLeftSidebarTab("layers")}
              className={`flex-1 py-2.5 text-xs font-medium transition ${leftSidebarTab === "layers" ? "text-white border-b-2 border-[var(--primary)]" : "text-[var(--muted)] hover:text-white"}`}
            >
              Layers
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {leftSidebarTab === "blocks" ? (
              /* Block palette */
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(blockTemplates) as BlockType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{blockIcons[type]}</span>
                    <span className="text-[10px] font-medium text-[var(--muted)] group-hover:text-white text-center leading-tight">{blockLabels[type]}</span>
                  </button>
                ))}
              </div>
            ) : (
              /* Layer list */
              <div className="space-y-1">
                {activePage?.content.map((block, idx) => (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={() => handleLayerDragStart(idx)}
                    onDragOver={(e) => handleLayerDragOver(e, idx)}
                    onDragEnd={() => { setDraggedLayerIdx(null); setDragOverIdx(null); }}
                    onDrop={() => handleLayerDrop(idx)}
                    onClick={() => setActiveBlockId(block.id)}
                    className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer group transition
                      ${activeBlockId === block.id ? "bg-[var(--primary)]/10 border border-[var(--primary)]/40" : "hover:bg-[var(--surface-hover)] border border-transparent"}
                      ${dragOverIdx === idx ? "border-t-2 border-t-[var(--primary)]" : ""}
                      ${block.hidden ? "opacity-40" : ""}`}
                  >
                    {/* Drag handle */}
                    <span className="text-[var(--muted)] cursor-grab opacity-0 group-hover:opacity-100 transition flex-shrink-0 text-xs">&#x2630;</span>

                    <span className="text-sm flex-shrink-0">{blockIcons[block.type]}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium truncate block">{blockLabels[block.type]}</span>
                      <span className="text-[10px] text-[var(--muted)] truncate block">
                        {block.content.heading || block.content.style || ""}
                      </span>
                    </div>

                    {/* Layer actions */}
                    <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleBlockVisibility(block.id)}
                        className="p-1 rounded text-xs text-[var(--muted)] hover:text-white transition"
                        title={block.hidden ? "Show" : "Hide"}
                      >
                        {block.hidden ? "\uD83D\uDE48" : "\uD83D\uDC41\uFE0F"}
                      </button>
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="p-1 rounded text-xs text-red-400 hover:text-red-300 transition"
                        title="Delete"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}

                {(!activePage || activePage.content.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-xs text-[var(--muted)] mb-2">No blocks yet</p>
                    <button
                      onClick={() => setLeftSidebarTab("blocks")}
                      className="text-xs text-[var(--primary)] hover:underline"
                    >
                      Add your first block
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== CENTER - LIVE PREVIEW ===== */}
        <div className="flex-1 min-w-0 bg-[var(--background)] flex flex-col overflow-hidden">
          {activePage ? (
            <div className="flex-1 overflow-auto flex justify-center p-4" style={{ backgroundColor: "#1a1a20" }}>
              <div
                ref={previewRef}
                className="rounded-xl border border-[var(--border)] overflow-hidden shadow-2xl transition-all duration-300 flex-shrink-0 self-start"
                style={{
                  width: viewportWidth,
                  maxWidth: "100%",
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                  fontFamily: theme.fontFamily,
                }}
              >
                {/* Nav preview */}
                <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: theme.textColor + "15" }}>
                  <span className="text-lg font-bold">{venueName || "Your Venue"}</span>
                  <div className="flex gap-4 text-sm" style={{ color: theme.textColor + "80" }}>
                    {pages.filter((p) => p.is_published).map((p) => (
                      <span
                        key={p.id}
                        className={`cursor-default ${p.id === activePage.id ? "font-semibold" : ""}`}
                        style={p.id === activePage.id ? { color: theme.primaryColor } : undefined}
                      >
                        {p.title}
                      </span>
                    ))}
                  </div>
                </nav>

                {/* Blocks */}
                {activePage.content.length > 0 ? (
                  activePage.content.map((block, idx) => {
                    if (block.hidden && !previewMode) {
                      return (
                        <div
                          key={block.id}
                          className="px-4 py-2 opacity-30 border-y border-dashed border-[var(--border)] flex items-center gap-2 cursor-pointer"
                          onClick={() => setActiveBlockId(block.id)}
                        >
                          <span className="text-xs">{blockIcons[block.type]}</span>
                          <span className="text-xs text-[var(--muted)]">{blockLabels[block.type]} (hidden)</span>
                        </div>
                      );
                    }
                    if (block.hidden) return null;

                    return (
                      <div
                        key={block.id}
                        id={block.anchorId || undefined}
                        className={`relative group/block transition-all duration-150 ${block.cssClass || ""}`}
                        style={{
                          outline: activeBlockId === block.id ? `2px solid ${theme.primaryColor}` : hoveredBlockId === block.id ? `1px solid ${theme.primaryColor}50` : "none",
                          outlineOffset: "-1px",
                        }}
                        onClick={(e) => {
                          if (!(e.target as HTMLElement).isContentEditable) {
                            setActiveBlockId(block.id);
                          }
                        }}
                        onMouseEnter={() => !previewMode && setHoveredBlockId(block.id)}
                        onMouseLeave={() => setHoveredBlockId(null)}
                      >
                        {renderBlockPreview(block)}

                        {/* Floating controls for selected block */}
                        {activeBlockId === block.id && !previewMode && (
                          <div
                            className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl p-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => moveBlock(block.id, "up")}
                              disabled={idx === 0}
                              className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] disabled:opacity-25 transition text-xs"
                              title="Move Up"
                            >
                              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button
                              onClick={() => moveBlock(block.id, "down")}
                              disabled={idx === activePage.content.length - 1}
                              className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] disabled:opacity-25 transition text-xs"
                              title="Move Down"
                            >
                              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M6 10V2M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <div className="w-px h-4 bg-[var(--border)]" />
                            <button
                              onClick={() => duplicateBlock(block.id)}
                              className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] transition text-xs"
                              title="Duplicate"
                            >
                              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><rect x="1" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M4 3V2a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H9" stroke="currentColor" strokeWidth="1.2"/></svg>
                            </button>
                            <button
                              onClick={() => removeBlock(block.id)}
                              className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 transition text-xs"
                              title="Delete"
                            >
                              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M3 4h6M5 4V2.5h2V4M4 4l.3 6h3.4l.3-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>
                        )}

                        {/* Block type label on hover */}
                        {hoveredBlockId === block.id && activeBlockId !== block.id && !previewMode && (
                          <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-lg">
                            <span className="text-[10px] font-medium text-[var(--muted)]">{blockIcons[block.type]} {blockLabels[block.type]}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  /* Empty state */
                  <div className="py-32 flex flex-col items-center justify-center" style={{ color: theme.textColor + "40" }}>
                    <div
                      className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center mb-4 cursor-pointer hover:border-solid transition"
                      style={{ borderColor: theme.primaryColor + "60" }}
                      onClick={() => setLeftSidebarTab("blocks")}
                    >
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" style={{ color: theme.primaryColor }}>
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-1">Start building your page</p>
                    <p className="text-sm opacity-60">Add blocks from the left panel or click the button above</p>
                  </div>
                )}

                {/* Footer preview */}
                <footer className="border-t py-8 px-6 text-center text-sm" style={{ borderColor: theme.textColor + "15", color: theme.textColor + "60" }}>
                  <p>&copy; {new Date().getFullYear()} {venueName || "Your Venue"}. All rights reserved.</p>
                  <p className="mt-2 text-xs opacity-50">Powered by Juke Digital</p>
                </footer>
              </div>
            </div>
          ) : (
            /* No page selected */
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
                    : "Choose a page from the dropdown above to start editing."}
                </p>
                {pages.length === 0 && (
                  <button onClick={() => setShowCreatePageModal(true)} className="btn-primary">
                    + Create First Page
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== RIGHT SIDEBAR - PROPERTIES ===== */}
        <div className="w-72 flex-shrink-0 bg-[var(--surface)] border-l border-[var(--border)] flex flex-col overflow-hidden transition-all duration-200">
          {activeBlock ? (
            <>
              {/* Block header */}
              <div className="px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{blockIcons[activeBlock.type]}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{blockLabels[activeBlock.type]}</h3>
                  </div>
                  <button
                    onClick={() => setActiveBlockId(null)}
                    className="p-1 rounded-md text-[var(--muted)] hover:text-white hover:bg-[var(--surface-hover)] transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </div>

              {/* Section tabs */}
              <div className="flex border-b border-[var(--border)] flex-shrink-0">
                {(["content", "style", "advanced"] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setRightPanelSection(sec)}
                    className={`flex-1 py-2 text-xs font-medium transition ${rightPanelSection === sec ? "text-white border-b-2 border-[var(--primary)]" : "text-[var(--muted)] hover:text-white"}`}
                  >
                    {sec.charAt(0).toUpperCase() + sec.slice(1)}
                  </button>
                ))}
              </div>

              {/* Panel content */}
              <div className="flex-1 overflow-y-auto p-4">
                {rightPanelSection === "content" && renderBlockEditor(activeBlock)}
                {rightPanelSection === "style" && renderStyleEditor(activeBlock)}
                {rightPanelSection === "advanced" && renderAdvancedEditor(activeBlock)}
              </div>
            </>
          ) : (
            /* No block selected - show theme editor */
            <div className="flex-1 overflow-y-auto p-4">
              {renderThemeEditor()}
            </div>
          )}
        </div>
      </div>

      {/* ===== TOAST ===== */}
      {saved && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium shadow-xl z-50 transition-all duration-300"
          style={{ backgroundColor: "var(--success)", color: "white" }}
        >
          Saved successfully
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
        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm focus:border-[var(--primary)] focus:outline-none transition"
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
            <button onClick={onChoose} className="px-3 py-1 rounded-md bg-[var(--surface-hover)] text-xs font-medium text-[var(--muted)] hover:text-white transition">Change</button>
            <button onClick={onClear} className="text-xs text-red-400 hover:text-red-300">Remove</button>
          </div>
        </div>
      ) : (
        <button onClick={onChoose} className="w-full py-2 rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--muted)] hover:text-white hover:border-[var(--primary)] transition">
          Choose Image
        </button>
      )}
    </div>
  );
}

function SocialField({
  icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] mb-1">
        <span>{icon}</span> {label}
      </label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm focus:border-[var(--primary)] focus:outline-none transition"
      />
    </div>
  );
}

function SocialLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition"
    >
      {label}
    </a>
  );
}
