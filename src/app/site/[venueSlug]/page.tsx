"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";

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

export default function VenueHomePage() {
  const params = useParams();
  const venueSlug = params.venueSlug as string;
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [activePage, setActivePage] = useState<PageData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      // Load venue by slug
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

      // Load all published pages for this venue
      const { data: pagesData } = await supabase
        .from("website_pages")
        .select("id, title, slug, content, is_published")
        .eq("venue_id", venueData.id)
        .eq("is_published", true)
        .order("sort_order");

      if (pagesData && pagesData.length > 0) {
        setPages(pagesData);
        setActivePage(pagesData[0]); // Show first page as homepage
      } else {
        setNotFound(true);
      }
    }
    load();
  }, [venueSlug, supabase]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f0f13", color: "#f0f0f5" }}>
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-3">404</h1>
          <p className="text-lg opacity-60 mb-6">This venue could not be found.</p>
          <a href="/" className="text-sm underline opacity-60 hover:opacity-100">Go home</a>
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

/* ------------------------------------------------------------------ */
/*  Shared components (exported for use by [pageSlug]/page.tsx)        */
/* ------------------------------------------------------------------ */

export function SiteNav({
  venue,
  pages,
  activePage,
  theme,
  venueSlug,
}: {
  venue: VenueData;
  pages: PageData[];
  activePage: PageData;
  theme: VenueData["website_theme"] & object;
  venueSlug: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = theme!;
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ borderColor: t.textColor + "15", backgroundColor: t.backgroundColor + "e6" }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href={`/site/${venueSlug}`} className="text-xl font-bold hover:opacity-80 transition">
          {venue.name}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {pages.map((p) => (
            <Link
              key={p.id}
              href={p.id === pages[0]?.id ? `/site/${venueSlug}` : `/site/${venueSlug}/${p.slug}`}
              className="text-sm font-medium transition"
              style={{ color: activePage.id === p.id ? t.primaryColor : t.textColor + "80" }}
            >
              {p.title}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <div className="space-y-1.5">
            <span className="block w-6 h-0.5" style={{ backgroundColor: t.textColor }} />
            <span className="block w-6 h-0.5" style={{ backgroundColor: t.textColor }} />
            <span className="block w-6 h-0.5" style={{ backgroundColor: t.textColor }} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-6 py-4 space-y-3" style={{ borderColor: t.textColor + "15" }}>
          {pages.map((p) => (
            <Link
              key={p.id}
              href={p.id === pages[0]?.id ? `/site/${venueSlug}` : `/site/${venueSlug}/${p.slug}`}
              className="block text-sm font-medium"
              style={{ color: activePage.id === p.id ? t.primaryColor : t.textColor + "80" }}
              onClick={() => setMenuOpen(false)}
            >
              {p.title}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export function SiteFooter({ venue, theme }: { venue: VenueData; theme: VenueData["website_theme"] & object }) {
  const t = theme!;
  return (
    <footer className="border-t py-12 px-6" style={{ borderColor: t.textColor + "15" }}>
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <p className="font-semibold text-lg">{venue.name}</p>
        {venue.address && <p className="text-sm" style={{ color: t.textColor + "80" }}>{venue.address}</p>}
        <div className="flex items-center justify-center gap-4 text-sm" style={{ color: t.textColor + "60" }}>
          {venue.phone && <span>{venue.phone}</span>}
          {venue.email && <a href={`mailto:${venue.email}`} className="hover:underline">{venue.email}</a>}
        </div>
        <p className="text-xs pt-4" style={{ color: t.textColor + "40" }}>
          &copy; {new Date().getFullYear()} {venue.name}. All rights reserved.
        </p>
        <p className="text-xs" style={{ color: t.textColor + "30" }}>
          Powered by <a href="/" className="hover:underline">Juke Digital</a>
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Block renderer                                                     */
/* ------------------------------------------------------------------ */

export function RenderBlock({
  block,
  theme,
  venueId,
}: {
  block: WebsiteBlock;
  theme: NonNullable<VenueData["website_theme"]>;
  venueId: string;
}) {
  const c = block.content;
  const t = theme;

  switch (block.type) {
    case "hero":
      return (
        <section
          className="relative flex items-center justify-center min-h-[70vh] px-8 text-center overflow-hidden"
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
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${t.primaryColor}25 0%, transparent 100%)` }} />
          )}
          <div className="relative z-10 max-w-3xl mx-auto py-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">{c.heading}</h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8" style={{ color: t.textColor + "b0" }}>{c.subheading}</p>
            {c.buttonText && (
              <a
                href={c.buttonLink || "#"}
                className="inline-block px-8 py-3.5 rounded-lg font-semibold text-white text-lg transition hover:opacity-90"
                style={{ backgroundColor: t.primaryColor }}
              >
                {c.buttonText}
              </a>
            )}
          </div>
        </section>
      );

    case "text":
      return (
        <section className="py-20 px-6 sm:px-8">
          {c.image ? (
            <div className={`max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-center ${c.imagePosition === "left" ? "md:flex-row-reverse" : ""}`}>
              <div className="flex-1">
                {c.heading && <h2 className="text-3xl sm:text-4xl font-bold mb-5">{c.heading}</h2>}
                <div className="text-lg leading-relaxed whitespace-pre-wrap" style={{ color: t.textColor + "c0" }}>{c.body}</div>
              </div>
              <div className="flex-1 max-w-lg">
                <img src={c.image} alt={c.imageCaption || ""} className="w-full rounded-2xl shadow-2xl" />
                {c.imageCaption && <p className="text-sm mt-3 text-center" style={{ color: t.textColor + "60" }}>{c.imageCaption}</p>}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {c.heading && <h2 className="text-3xl sm:text-4xl font-bold mb-5">{c.heading}</h2>}
              <div className="text-lg leading-relaxed whitespace-pre-wrap" style={{ color: t.textColor + "c0" }}>{c.body}</div>
            </div>
          )}
        </section>
      );

    case "gallery":
      return (
        <section className="py-20 px-6 sm:px-8">
          <div className="max-w-6xl mx-auto">
            {c.heading && <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center">{c.heading}</h2>}
            {(c.images || []).length > 0 ? (
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${c.columns || 3}, 1fr)` }}>
                {(c.images || []).map((img: string, i: number) => (
                  <img key={i} src={img} alt="" className="w-full h-64 object-cover rounded-xl hover:scale-[1.02] transition-transform duration-300" />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      );

    case "menu_section":
      return (
        <section className="py-20 px-6 sm:px-8" id="menu">
          <div className="max-w-3xl mx-auto">
            {c.heading && <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center">{c.heading}</h2>}
            <div className="space-y-3">
              {(c.items || []).map((item: { name: string; description: string; price: string; image: string }, i: number) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-xl transition hover:scale-[1.01]" style={{ backgroundColor: t.textColor + "08", border: `1px solid ${t.textColor}10` }}>
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="font-bold text-lg flex-shrink-0" style={{ color: t.primaryColor }}>{item.price}</span>
                    </div>
                    {item.description && <p className="text-sm mt-1" style={{ color: t.textColor + "80" }}>{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "hours":
      return (
        <section className="py-20 px-6 sm:px-8">
          <div className="max-w-lg mx-auto">
            {c.heading && <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">{c.heading}</h2>}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: t.textColor + "08", border: `1px solid ${t.textColor}10` }}>
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day, i) => (
                <div
                  key={day}
                  className="flex justify-between py-4 px-6"
                  style={{ borderBottom: i < 6 ? `1px solid ${t.textColor}10` : undefined }}
                >
                  <span className="capitalize font-medium">{day}</span>
                  <span style={{ color: t.textColor + "80" }}>{c[day] || "Closed"}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "contact":
      return (
        <section className="py-20 px-6 sm:px-8" id="contact">
          <div className="max-w-4xl mx-auto">
            {c.heading && <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center">{c.heading}</h2>}
            <div className={`grid ${c.mapEmbed ? "md:grid-cols-2" : ""} gap-10`}>
              <div className="space-y-6">
                {c.address && (
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: t.textColor + "60" }}>Address</p>
                    <p className="text-xl">{c.address}</p>
                  </div>
                )}
                {c.phone && (
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: t.textColor + "60" }}>Phone</p>
                    <a href={`tel:${c.phone}`} className="text-xl hover:underline">{c.phone}</a>
                  </div>
                )}
                {c.email && (
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: t.textColor + "60" }}>Email</p>
                    <a href={`mailto:${c.email}`} className="text-xl hover:underline">{c.email}</a>
                  </div>
                )}
              </div>
              {c.mapEmbed && (
                <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${t.textColor}10` }}>
                  <iframe src={c.mapEmbed} className="w-full h-72 md:h-full min-h-[280px]" loading="lazy" title="Map" />
                </div>
              )}
            </div>
          </div>
        </section>
      );

    case "testimonials":
      return (
        <section className="py-20 px-6 sm:px-8">
          <div className="max-w-5xl mx-auto">
            {c.heading && <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center">{c.heading}</h2>}
            <div className="grid md:grid-cols-2 gap-6">
              {(c.items || []).map((item: { quote: string; author: string; role: string }, i: number) => (
                <div key={i} className="p-8 rounded-2xl" style={{ backgroundColor: t.textColor + "08", border: `1px solid ${t.textColor}10` }}>
                  <p className="text-lg mb-6 leading-relaxed italic" style={{ color: t.textColor + "d0" }}>
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: t.primaryColor + "30", color: t.primaryColor }}>
                      {item.author?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-semibold">{item.author}</p>
                      {item.role && <p className="text-sm" style={{ color: t.textColor + "60" }}>{item.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "events":
      return (
        <section className="py-20 px-6 sm:px-8">
          <div className="max-w-4xl mx-auto">
            {c.heading && <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center">{c.heading}</h2>}
            {c.autoFeed ? (
              <EventsFeed venueId={venueId} theme={t} />
            ) : (
              <div className="space-y-4">
                {(c.items || []).map((item: { title: string; date: string; description: string; image: string }, i: number) => (
                  <div key={i} className="flex gap-6 items-start p-6 rounded-2xl" style={{ backgroundColor: t.textColor + "08", border: `1px solid ${t.textColor}10` }}>
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-28 h-28 rounded-xl object-cover flex-shrink-0 hidden sm:block" />
                    )}
                    <div>
                      <h3 className="font-semibold text-xl mb-1">{item.title}</h3>
                      <p className="text-sm font-medium mb-2" style={{ color: t.primaryColor }}>{item.date}</p>
                      {item.description && <p style={{ color: t.textColor + "80" }}>{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );

    case "social":
      return (
        <section className="py-12 px-6 sm:px-8">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {c.instagram && <SocialButton label="Instagram" url={c.instagram} theme={t} />}
            {c.facebook && <SocialButton label="Facebook" url={c.facebook} theme={t} />}
            {c.twitter && <SocialButton label="Twitter" url={c.twitter} theme={t} />}
            {c.tiktok && <SocialButton label="TikTok" url={c.tiktok} theme={t} />}
            {c.yelp && <SocialButton label="Yelp" url={c.yelp} theme={t} />}
            {c.google && <SocialButton label="Google" url={c.google} theme={t} />}
          </div>
        </section>
      );

    case "cta":
      return (
        <section
          className="relative py-24 px-8 text-center overflow-hidden"
          style={{
            backgroundImage: c.backgroundImage ? `url(${c.backgroundImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {c.backgroundImage && <div className="absolute inset-0 bg-black/60" />}
          {!c.backgroundImage && <div className="absolute inset-0" style={{ backgroundColor: t.primaryColor, opacity: 0.08 }} />}
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{c.heading}</h2>
            <p className="text-lg mb-8" style={{ color: t.textColor + "b0" }}>{c.body}</p>
            {c.buttonText && (
              <a
                href={c.buttonLink || "#"}
                className="inline-block px-8 py-3.5 rounded-lg font-semibold text-white text-lg transition hover:opacity-90"
                style={{ backgroundColor: t.primaryColor }}
              >
                {c.buttonText}
              </a>
            )}
          </div>
        </section>
      );

    case "divider":
      if (c.style === "space") return <div className="py-10" />;
      if (c.style === "dots") return <div className="py-10 text-center text-3xl tracking-[1em]" style={{ color: t.textColor + "30" }}>...</div>;
      return <hr className="my-10 mx-8 max-w-4xl md:mx-auto" style={{ borderColor: t.textColor + "15" }} />;

    case "embed":
      return (
        <section className="py-10 px-6 sm:px-8">
          {c.code ? (
            <div
              className="max-w-4xl mx-auto [&>iframe]:w-full [&>iframe]:rounded-2xl [&>iframe]:min-h-[300px]"
              dangerouslySetInnerHTML={{ __html: c.code }}
            />
          ) : null}
        </section>
      );

    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */

function EventsFeed({ venueId, theme }: { venueId: string; theme: NonNullable<VenueData["website_theme"]> }) {
  const [events, setEvents] = useState<{ id: string; title: string; date: string; description: string; image_url: string }[]>([]);
  const supabase = createClient();
  const t = theme;

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("events")
        .select("id, title, date, description, image_url")
        .eq("venue_id", venueId)
        .gte("date", new Date().toISOString())
        .order("date")
        .limit(6);
      if (data) setEvents(data);
    }
    load();
  }, [venueId, supabase]);

  if (events.length === 0) {
    return <p className="text-center" style={{ color: t.textColor + "60" }}>No upcoming events</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((e) => (
        <div key={e.id} className="flex gap-6 items-start p-6 rounded-2xl" style={{ backgroundColor: t.textColor + "08", border: `1px solid ${t.textColor}10` }}>
          {e.image_url && (
            <img src={e.image_url} alt={e.title} className="w-28 h-28 rounded-xl object-cover flex-shrink-0 hidden sm:block" />
          )}
          <div>
            <h3 className="font-semibold text-xl mb-1">{e.title}</h3>
            <p className="text-sm font-medium mb-2" style={{ color: t.primaryColor }}>
              {new Date(e.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
            {e.description && <p style={{ color: t.textColor + "80" }}>{e.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SocialButton({ label, url, theme }: { label: string; url: string; theme: NonNullable<VenueData["website_theme"]> }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="px-5 py-2.5 rounded-lg text-sm font-medium transition hover:scale-105"
      style={{ backgroundColor: theme.textColor + "0a", border: `1px solid ${theme.textColor}15`, color: theme.textColor }}
    >
      {label}
    </a>
  );
}
