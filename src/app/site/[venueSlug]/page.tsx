"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

type Theme = NonNullable<VenueData["website_theme"]>;

/* ------------------------------------------------------------------ */
/*  Intersection Observer hook for fade-in animations                  */
/* ------------------------------------------------------------------ */

function useFadeIn(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Social SVG Icons                                                   */
/* ------------------------------------------------------------------ */

function SocialIcon({ platform }: { platform: string }) {
  const size = 20;
  switch (platform.toLowerCase()) {
    case "instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "facebook":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      );
    case "twitter":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.15V11.7a4.83 4.83 0 01-3.77-1.24V6.69h3.77z" />
        </svg>
      );
    case "yelp":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.16 12.73l-4.27-.93a.5.5 0 00-.58.66l1.62 4.07a.5.5 0 00.84.13l2.79-3.17a.5.5 0 00-.4-.76zm-5.17 5.35l-1.57-4.1a.5.5 0 00-.88-.1l-2.83 3.14a.5.5 0 00.36.82l4.44.97a.5.5 0 00.48-.73zM11 2v9.47a.5.5 0 01-.33.47L6.4 13.53a.5.5 0 01-.66-.59l2.07-8.83A.5.5 0 018.3 3.7L11 2zm-3.6 12.9l-4.27.93a.5.5 0 00-.24.84l2.79 3.17a.5.5 0 00.84-.13l1.62-4.07a.5.5 0 00-.58-.66l-.16-.08zm6.6.53l4.27.93a.5.5 0 01.24.84l-2.79 3.17a.5.5 0 01-.84-.13l-1.62-4.07a.5.5 0 01.58-.66l.16-.08z" />
        </svg>
      );
    case "google":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
      );
  }
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

      if (pagesData && pagesData.length > 0) {
        setPages(pagesData);
        setActivePage(pagesData[0]);
      } else {
        setNotFound(true);
      }
    }
    load();
  }, [venueSlug, supabase]);

  /* Meta tags */
  useEffect(() => {
    if (venue && activePage) {
      document.title = `${activePage.title} | ${venue.name}`;
      const metaDesc = document.querySelector('meta[name="description"]');
      const desc = (activePage as PageData & { meta_description?: string }).meta_description || venue.description || "";
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
          <p className="text-xl opacity-60 mb-8">This venue could not be found.</p>
          <a href="/" className="inline-block px-6 py-3 rounded-lg text-sm font-medium border border-white/20 hover:bg-white/10 transition">Go home</a>
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

  const t: Theme = venue.website_theme || {
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

/* ------------------------------------------------------------------ */
/*  Scroll to Top button                                               */
/* ------------------------------------------------------------------ */

function ScrollToTop({ theme }: { theme: Theme }) {
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
/*  SiteNav                                                            */
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
  theme: Theme;
  venueSlug: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = theme;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? t.backgroundColor + "f0" : t.backgroundColor + "00",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? `1px solid ${t.textColor}10` : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href={`/site/${venueSlug}`}
            className="text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
          >
            {venue.name}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {pages.map((p) => {
              const isActive = activePage.id === p.id;
              return (
                <Link
                  key={p.id}
                  href={p.id === pages[0]?.id ? `/site/${venueSlug}` : `/site/${venueSlug}/${p.slug}`}
                  className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive ? t.primaryColor : t.textColor + "90",
                    backgroundColor: isActive ? t.primaryColor + "12" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = t.textColor + "08";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {p.title}
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{ backgroundColor: menuOpen ? t.textColor + "10" : "transparent" }}
          >
            <div className="flex flex-col items-center justify-center gap-[5px]">
              <span
                className="block w-5 h-[2px] rounded-full transition-all duration-300"
                style={{
                  backgroundColor: t.textColor,
                  transform: menuOpen ? "rotate(45deg) translate(2.5px, 2.5px)" : "none",
                }}
              />
              <span
                className="block w-5 h-[2px] rounded-full transition-all duration-300"
                style={{
                  backgroundColor: t.textColor,
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                className="block w-5 h-[2px] rounded-full transition-all duration-300"
                style={{
                  backgroundColor: t.textColor,
                  transform: menuOpen ? "rotate(-45deg) translate(2.5px, -2.5px)" : "none",
                }}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile slide-in panel */}
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-opacity duration-300"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        onClick={() => setMenuOpen(false)}
      />
      {/* Panel */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-72 md:hidden transition-transform duration-300 ease-out"
        style={{
          backgroundColor: t.backgroundColor,
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          borderLeft: `1px solid ${t.textColor}10`,
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: t.textColor + "10" }}>
            <span className="font-bold text-lg">{venue.name}</span>
            <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: t.textColor + "10" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {pages.map((p) => {
              const isActive = activePage.id === p.id;
              return (
                <Link
                  key={p.id}
                  href={p.id === pages[0]?.id ? `/site/${venueSlug}` : `/site/${venueSlug}/${p.slug}`}
                  className="block px-4 py-3 rounded-lg text-base font-medium transition-colors"
                  style={{
                    color: isActive ? t.primaryColor : t.textColor + "90",
                    backgroundColor: isActive ? t.primaryColor + "12" : "transparent",
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  {p.title}
                </Link>
              );
            })}
          </div>
          <div className="px-6 py-5 border-t text-xs" style={{ borderColor: t.textColor + "10", color: t.textColor + "40" }}>
            {venue.phone && <p>{venue.phone}</p>}
            {venue.email && <p>{venue.email}</p>}
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  SiteFooter                                                         */
/* ------------------------------------------------------------------ */

export function SiteFooter({ venue, theme }: { venue: VenueData; theme: Theme }) {
  const t = theme;
  return (
    <footer className="border-t" style={{ borderColor: t.textColor + "10" }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <p className="font-bold text-xl mb-3">{venue.name}</p>
            {venue.description && (
              <p className="text-sm leading-relaxed" style={{ color: t.textColor + "60" }}>
                {venue.description}
              </p>
            )}
          </div>

          {/* Contact */}
          <div>
            <p className="font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: t.textColor + "50" }}>Contact</p>
            <div className="space-y-2 text-sm" style={{ color: t.textColor + "80" }}>
              {venue.address && <p>{venue.address}</p>}
              {venue.phone && (
                <p>
                  <a href={`tel:${venue.phone}`} className="hover:underline transition">{venue.phone}</a>
                </p>
              )}
              {venue.email && (
                <p>
                  <a href={`mailto:${venue.email}`} className="hover:underline transition">{venue.email}</a>
                </p>
              )}
            </div>
          </div>

          {/* Branding */}
          <div className="md:text-right">
            <p className="font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: t.textColor + "50" }}>Powered by</p>
            <a
              href="https://jukedigital.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-medium px-4 py-2 rounded-lg transition hover:opacity-80"
              style={{ backgroundColor: t.textColor + "08", color: t.textColor + "60" }}
            >
              Juke Digital
            </a>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: t.textColor + "10" }}>
          <p className="text-xs" style={{ color: t.textColor + "40" }}>
            &copy; {new Date().getFullYear()} {venue.name}. All rights reserved.
          </p>
        </div>
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
  blockIndex = 0,
}: {
  block: WebsiteBlock;
  theme: Theme;
  venueId: string;
  blockIndex?: number;
}) {
  const c = block.content;
  const t = theme;

  switch (block.type) {
    case "hero":
      return <HeroBlock content={c} theme={t} />;

    case "text":
      return (
        <FadeIn>
          <section className="py-20 lg:py-24 px-6 sm:px-8">
            {c.image ? (
              <div className={`max-w-6xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-16 items-center ${c.imagePosition === "left" ? "md:flex-row-reverse" : ""}`}>
                <div className="flex-1">
                  {c.heading && <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">{c.heading}</h2>}
                  <div className="text-lg leading-[1.8] whitespace-pre-wrap" style={{ color: t.textColor + "c0" }}>{c.body}</div>
                </div>
                <div className="flex-1 max-w-lg w-full">
                  <div className="relative group">
                    <img
                      src={c.image}
                      alt={c.imageCaption || ""}
                      className="w-full rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                  </div>
                  {c.imageCaption && <p className="text-sm mt-4 text-center" style={{ color: t.textColor + "50" }}>{c.imageCaption}</p>}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                {c.heading && <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">{c.heading}</h2>}
                <div className="text-lg leading-[1.8] whitespace-pre-wrap" style={{ color: t.textColor + "c0", maxWidth: "65ch" }}>{c.body}</div>
              </div>
            )}
          </section>
        </FadeIn>
      );

    case "gallery":
      return (
        <FadeIn>
          <section className="py-20 lg:py-24 px-6 sm:px-8">
            <div className="max-w-6xl mx-auto">
              {c.heading && <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-12 text-center">{c.heading}</h2>}
              {(c.images || []).length > 0 ? (
                <div className="grid gap-4 sm:gap-5" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${c.columns && c.columns <= 2 ? "300px" : "240px"}, 1fr))` }}>
                  {(c.images || []).map((img: string, i: number) => (
                    <FadeIn key={i} delay={i * 80}>
                      <div className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer">
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)" }}
                        />
                        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
                      </div>
                    </FadeIn>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        </FadeIn>
      );

    case "menu_section":
      return (
        <FadeIn>
          <section className="py-20 lg:py-24 px-6 sm:px-8" id="menu">
            <div className="max-w-3xl mx-auto">
              {c.heading && (
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">{c.heading}</h2>
                  <div className="mx-auto mt-4 flex items-center justify-center gap-3">
                    <span className="block w-12 h-[2px] rounded-full" style={{ backgroundColor: t.primaryColor + "60" }} />
                    <span className="block w-2 h-2 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                    <span className="block w-12 h-[2px] rounded-full" style={{ backgroundColor: t.primaryColor + "60" }} />
                  </div>
                </div>
              )}
              <div className="space-y-1">
                {(c.items || []).map((item: { name: string; description: string; price: string; image: string }, i: number) => (
                  <FadeIn key={i} delay={i * 60}>
                    <div
                      className="group flex items-start gap-4 py-5 transition-colors rounded-xl px-4 -mx-4"
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = t.textColor + "06"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <span className="flex-1 border-b border-dotted mx-1 mb-1" style={{ borderColor: t.textColor + "20" }} />
                          <span className="font-bold text-lg flex-shrink-0 tabular-nums" style={{ color: t.primaryColor }}>{item.price}</span>
                        </div>
                        {item.description && (
                          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: t.textColor + "60" }}>{item.description}</p>
                        )}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>
      );

    case "hours":
      return <HoursBlock content={c} theme={t} />;

    case "contact":
      return (
        <FadeIn>
          <section className="py-20 lg:py-24 px-6 sm:px-8" id="contact">
            <div className="max-w-5xl mx-auto">
              {c.heading && <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-12 text-center">{c.heading}</h2>}
              <div className={`grid ${c.mapEmbed ? "md:grid-cols-2" : ""} gap-10 lg:gap-14`}>
                <div className="space-y-8">
                  {c.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: t.primaryColor + "15" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: t.textColor + "50" }}>Address</p>
                        <p className="text-lg">{c.address}</p>
                      </div>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: t.primaryColor + "15" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: t.textColor + "50" }}>Phone</p>
                        <a href={`tel:${c.phone}`} className="text-lg hover:underline transition" style={{ color: t.primaryColor }}>{c.phone}</a>
                      </div>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: t.primaryColor + "15" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: t.textColor + "50" }}>Email</p>
                        <a href={`mailto:${c.email}`} className="text-lg hover:underline transition" style={{ color: t.primaryColor }}>{c.email}</a>
                      </div>
                    </div>
                  )}
                </div>
                {c.mapEmbed && (
                  <div className="rounded-2xl overflow-hidden shadow-lg" style={{ border: `1px solid ${t.textColor}10` }}>
                    <iframe src={c.mapEmbed} className="w-full h-72 md:h-full min-h-[320px]" loading="lazy" title="Map" />
                  </div>
                )}
              </div>
            </div>
          </section>
        </FadeIn>
      );

    case "testimonials":
      return (
        <FadeIn>
          <section className="py-20 lg:py-24 px-6 sm:px-8">
            <div className="max-w-5xl mx-auto">
              {c.heading && <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-12 text-center">{c.heading}</h2>}
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {(c.items || []).map((item: { quote: string; author: string; role: string }, i: number) => (
                  <FadeIn key={i} delay={i * 100}>
                    <div
                      className="relative p-8 lg:p-10 rounded-2xl overflow-hidden h-full"
                      style={{ backgroundColor: t.textColor + "06", border: `1px solid ${t.textColor}0a` }}
                    >
                      {/* Large quote mark */}
                      <div className="absolute top-4 left-6 text-7xl font-serif leading-none select-none" style={{ color: t.primaryColor + "20" }}>
                        &ldquo;
                      </div>
                      <div className="relative">
                        <p className="text-lg leading-relaxed italic mb-8 pt-8" style={{ color: t.textColor + "d0" }}>
                          {item.quote}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-10 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                          <div>
                            <p className="font-semibold">{item.author}</p>
                            {item.role && <p className="text-sm" style={{ color: t.textColor + "50" }}>{item.role}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>
      );

    case "events":
      return (
        <FadeIn>
          <section className="py-20 lg:py-24 px-6 sm:px-8">
            <div className="max-w-4xl mx-auto">
              {c.heading && <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-12 text-center">{c.heading}</h2>}
              {c.autoFeed ? (
                <EventsFeed venueId={venueId} theme={t} />
              ) : (
                <div className="space-y-5">
                  {(c.items || []).map((item: { title: string; date: string; description: string; image: string }, i: number) => (
                    <FadeIn key={i} delay={i * 80}>
                      <EventCard item={item} theme={t} />
                    </FadeIn>
                  ))}
                </div>
              )}
            </div>
          </section>
        </FadeIn>
      );

    case "social":
      return (
        <FadeIn>
          <section className="py-16 px-6 sm:px-8">
            {c.heading && <h2 className="text-2xl font-bold mb-8 text-center">{c.heading}</h2>}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {c.instagram && <SocialButton platform="Instagram" url={c.instagram} theme={t} />}
              {c.facebook && <SocialButton platform="Facebook" url={c.facebook} theme={t} />}
              {c.twitter && <SocialButton platform="Twitter" url={c.twitter} theme={t} />}
              {c.tiktok && <SocialButton platform="TikTok" url={c.tiktok} theme={t} />}
              {c.yelp && <SocialButton platform="Yelp" url={c.yelp} theme={t} />}
              {c.google && <SocialButton platform="Google" url={c.google} theme={t} />}
            </div>
          </section>
        </FadeIn>
      );

    case "cta":
      return (
        <FadeIn>
          <section className="relative py-24 lg:py-32 px-8 text-center overflow-hidden">
            {c.backgroundImage ? (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${c.backgroundImage})` }}
                />
                <div className="absolute inset-0 bg-black/60" />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${t.primaryColor}20 0%, ${t.primaryColor}08 50%, ${t.primaryColor}15 100%)`,
                }}
              />
            )}
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">{c.heading}</h2>
              {c.body && <p className="text-lg sm:text-xl mb-10 leading-relaxed" style={{ color: t.textColor + "b0" }}>{c.body}</p>}
              {c.buttonText && (
                <a
                  href={c.buttonLink || "#"}
                  className="inline-block px-10 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
                  style={{
                    backgroundColor: t.primaryColor,
                    boxShadow: `0 4px 24px ${t.primaryColor}40`,
                  }}
                >
                  {c.buttonText}
                </a>
              )}
            </div>
          </section>
        </FadeIn>
      );

    case "divider":
      if (c.style === "space") return <div className="py-12" />;
      if (c.style === "dots")
        return (
          <div className="py-12 flex items-center justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <span key={i} className="block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.textColor + "25" }} />
            ))}
          </div>
        );
      return (
        <div className="py-12 max-w-4xl mx-auto px-8">
          <hr className="border-0 h-px" style={{ backgroundColor: t.textColor + "12" }} />
        </div>
      );

    case "embed":
      return (
        <FadeIn>
          <section className="py-16 lg:py-20 px-6 sm:px-8">
            {c.code ? (
              <div
                className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg [&>iframe]:w-full [&>iframe]:min-h-[300px] [&>iframe]:block"
                style={{ border: `1px solid ${t.textColor}10` }}
                dangerouslySetInnerHTML={{ __html: c.code }}
              />
            ) : null}
          </section>
        </FadeIn>
      );

    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Hero Block (separate component for animation state)                */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HeroBlock({ content: c, theme: t }: { content: Record<string, any>; theme: Theme }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative flex items-center justify-center min-h-[100vh] px-8 text-center overflow-hidden">
      {/* Background image with parallax feel */}
      {c.backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed transition-transform duration-[1.5s]"
          style={{
            backgroundImage: `url(${c.backgroundImage})`,
            transform: loaded ? "scale(1)" : "scale(1.05)",
          }}
        />
      ) : null}

      {/* Overlay */}
      {c.backgroundImage ? (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,${(c.overlayOpacity as number) || 0.5}) 0%, rgba(0,0,0,${((c.overlayOpacity as number) || 0.5) * 1.2}) 100%)`,
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center top, ${t.primaryColor}30 0%, transparent 60%), linear-gradient(180deg, ${t.primaryColor}15 0%, ${t.backgroundColor} 100%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto py-20">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s",
          }}
        >
          {c.heading as string}
        </h1>
        <p
          className="text-lg sm:text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{
            color: t.textColor + "b0",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s",
          }}
        >
          {c.subheading as string}
        </p>
        {c.buttonText && (
          <div
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s",
            }}
          >
            <a
              href={(c.buttonLink as string) || "#"}
              className="inline-block px-10 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{
                backgroundColor: t.primaryColor,
                boxShadow: `0 4px 30px ${t.primaryColor}50`,
              }}
            >
              {c.buttonText as string}
            </a>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{
          opacity: loaded ? 0.4 : 0,
          transition: "opacity 1s ease 1s",
        }}
      >
        <div className="w-6 h-10 rounded-full border-2 flex items-start justify-center p-1.5" style={{ borderColor: t.textColor + "40" }}>
          <div
            className="w-1 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: t.textColor + "60" }}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Hours Block (needs day-of-week logic)                              */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HoursBlock({ content: c, theme: t }: { content: Record<string, any>; theme: Theme }) {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayIndex = new Date().getDay(); // 0 = Sunday

  return (
    <FadeIn>
      <section className="py-20 lg:py-24 px-6 sm:px-8">
        <div className="max-w-lg mx-auto">
          {c.heading && <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-10 text-center">{c.heading as string}</h2>}
          <div className="rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: t.textColor + "05", border: `1px solid ${t.textColor}0a` }}>
            {days.map((day, i) => {
              const isToday = i === todayIndex;
              return (
                <div
                  key={day}
                  className="flex justify-between items-center py-4 px-6 transition-colors"
                  style={{
                    borderBottom: i < 6 ? `1px solid ${t.textColor}08` : undefined,
                    backgroundColor: isToday ? t.primaryColor + "10" : "transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {isToday && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.primaryColor }} />
                    )}
                    <span className={`font-medium ${isToday ? "" : ""}`} style={{ color: isToday ? t.primaryColor : t.textColor }}>
                      {dayLabels[i]}
                    </span>
                  </div>
                  <span
                    className="text-sm tabular-nums"
                    style={{ color: isToday ? t.primaryColor : t.textColor + "70" }}
                  >
                    {(c[day] as string) || "Closed"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

/* ------------------------------------------------------------------ */
/*  Event Card                                                         */
/* ------------------------------------------------------------------ */

function EventCard({ item, theme: t }: { item: { title: string; date: string; description: string; image: string }; theme: Theme }) {
  const dateObj = item.date ? new Date(item.date) : null;
  const monthStr = dateObj ? dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase() : "";
  const dayStr = dateObj ? dateObj.getDate().toString() : "";

  return (
    <div
      className="flex gap-5 lg:gap-6 items-start p-6 rounded-2xl transition-all duration-200 group"
      style={{ backgroundColor: t.textColor + "05", border: `1px solid ${t.textColor}08` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.primaryColor + "30"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.textColor + "08"; }}
    >
      {/* Date badge */}
      {dateObj && (
        <div
          className="flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center"
          style={{ backgroundColor: t.primaryColor + "15" }}
        >
          <span className="text-[10px] font-bold tracking-wider" style={{ color: t.primaryColor }}>{monthStr}</span>
          <span className="text-xl font-bold leading-none" style={{ color: t.primaryColor }}>{dayStr}</span>
        </div>
      )}
      {item.image && (
        <img src={item.image} alt={item.title} className="w-24 h-24 rounded-xl object-cover flex-shrink-0 hidden sm:block" />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-xl mb-1.5">{item.title}</h3>
        {item.date && (
          <p className="text-sm font-medium mb-2" style={{ color: t.primaryColor }}>
            {new Date(item.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}
        {item.description && <p className="leading-relaxed" style={{ color: t.textColor + "70" }}>{item.description}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Events Feed (auto-loaded from DB)                                  */
/* ------------------------------------------------------------------ */

function EventsFeed({ venueId, theme }: { venueId: string; theme: Theme }) {
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
    return (
      <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: t.textColor + "05" }}>
        <p className="text-lg" style={{ color: t.textColor + "40" }}>No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {events.map((e, i) => (
        <FadeIn key={e.id} delay={i * 80}>
          <EventCard
            item={{ title: e.title, date: e.date, description: e.description, image: e.image_url }}
            theme={t}
          />
        </FadeIn>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Social Button with SVG icon                                        */
/* ------------------------------------------------------------------ */

function SocialButton({ platform, url, theme }: { platform: string; url: string; theme: Theme }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
      style={{
        backgroundColor: theme.textColor + "08",
        border: `1px solid ${theme.textColor}10`,
        color: theme.textColor + "90",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.primaryColor + "15";
        e.currentTarget.style.borderColor = theme.primaryColor + "30";
        e.currentTarget.style.color = theme.primaryColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.textColor + "08";
        e.currentTarget.style.borderColor = theme.textColor + "10";
        e.currentTarget.style.color = theme.textColor + "90";
      }}
    >
      <SocialIcon platform={platform} />
      {platform}
    </a>
  );
}
