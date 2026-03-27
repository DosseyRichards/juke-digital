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
      // Load venue
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

      // Load all published pages
      const { data: pagesData } = await supabase
        .from("website_pages")
        .select("id, title, slug, content, is_published")
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

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f0f13", color: "#f0f0f5" }}>
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-3">404</h1>
          <p className="text-lg opacity-60 mb-6">This page could not be found.</p>
          <a href={`/site/${venueSlug}`} className="text-sm underline opacity-60 hover:opacity-100">Back to homepage</a>
        </div>
      </div>
    );
  }

  if (!venue || !activePage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f0f13", color: "#f0f0f5" }}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="opacity-60">Loading...</span>
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
    <div className="min-h-screen" style={{ backgroundColor: t.backgroundColor, color: t.textColor, fontFamily: t.fontFamily }}>
      {/* Navigation */}
      <SiteNav venue={venue} pages={pages} activePage={activePage} theme={t} venueSlug={venueSlug} />

      {/* Blocks */}
      {activePage.content.map((block) => (
        <div key={block.id}>
          <RenderBlock block={block} theme={t} venueId={venue.id} />
        </div>
      ))}

      {/* Footer */}
      <SiteFooter venue={venue} theme={t} />
    </div>
  );
}
