"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { SiteNav, SiteFooter, RenderBlock } from "../page";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WebsiteBlock {
  id: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any>;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: WebsiteBlock[];
  is_published: boolean;
  meta_description?: string;
}

interface VenueData {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  slug: string;
  website_theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    heroStyle: string;
  } | null;
}

/* ------------------------------------------------------------------ */
/*  Scroll to Top (local to this file since it's not exported)         */
/* ------------------------------------------------------------------ */

function ScrollToTop({ theme }: { theme: NonNullable<VenueData["website_theme"]> }) {
  const [show, setShow] = useState(false);
  const t = theme;

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
      style={{
        backgroundColor: t.primaryColor,
        color: "#fff",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(20px)",
      }}
      aria-label="Scroll to top"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function VenueSubPage() {
  const params = useParams();
  const venueSlug = params.venueSlug as string;
  const pageSlug = params.pageSlug as string;
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [activePage, setActivePage] = useState<PageData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: venueData } = await supabase
        .from("venues")
        .select("id, name, phone, email, address, description, slug, website_theme")
        .eq("slug", venueSlug)
        .single();

      if (!venueData) {
        setNotFound(true);
        return;
      }

      setVenue(venueData);

      const { data: pagesData } = await supabase
        .from("website_pages")
        .select("id, title, slug, content, is_published, meta_description")
        .eq("venue_id", venueData.id)
        .eq("is_published", true)
        .order("sort_order");

      if (pagesData) {
        setPages(pagesData);
        const found = pagesData.find((p) => p.slug === pageSlug);
        if (found) {
          setActivePage(found);
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
    }
    load();
  }, [venueSlug, pageSlug, supabase]);

  /* Meta tags */
  useEffect(() => {
    if (venue && activePage) {
      document.title = `${activePage.title} | ${venue.name}`;
      const metaDesc = document.querySelector('meta[name="description"]');
      const desc = activePage.meta_description || venue.description || "";
      if (metaDesc) {
        metaDesc.setAttribute("content", desc);
      } else if (desc) {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = desc;
        document.head.appendChild(meta);
      }
    }
  }, [venue, activePage]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f0f13", color: "#f0f0f5" }}>
        <div className="text-center">
          <h1 className="text-7xl font-bold mb-4 opacity-20">404</h1>
          <p className="text-xl opacity-60 mb-8">This page could not be found.</p>
          <a
            href={`/site/${venueSlug}`}
            className="inline-block px-6 py-3 rounded-lg text-sm font-medium border border-white/20 hover:bg-white/10 transition"
          >
            Back to homepage
          </a>
        </div>
      </div>
    );
  }

  if (!venue || !activePage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f0f13", color: "#f0f0f5" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin opacity-40" />
          <span className="text-sm opacity-40 tracking-wide">Loading...</span>
        </div>
      </div>
    );
  }

  const t = venue.website_theme || {
    primaryColor: "#6366f1",
    backgroundColor: "#0f0f13",
    textColor: "#f0f0f5",
    fontFamily: "Inter",
    heroStyle: "gradient",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: t.backgroundColor, color: t.textColor, fontFamily: t.fontFamily, scrollBehavior: "smooth" }}>
      <style>{`html { scroll-behavior: smooth; }`}</style>

      <SiteNav venue={venue} pages={pages} activePage={activePage} theme={t} venueSlug={venueSlug} />

      {activePage.content.map((block, idx) => (
        <RenderBlock key={block.id} block={block} theme={t} venueId={venue.id} blockIndex={idx} />
      ))}

      <SiteFooter venue={venue} theme={t} />
      <ScrollToTop theme={t} />
    </div>
  );
}
