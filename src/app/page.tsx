"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ───────────────────────── Intersection Observer Hook ───────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── Data ───────────────────────── */
const features = [
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "Calendar & Scheduling",
    desc: "Drag-and-drop event calendar for shows, DJ sets, happy hours, and private bookings. Sync with Google Calendar.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.466.732-3.558" />
      </svg>
    ),
    title: "Website Builder",
    desc: "Launch a stunning venue website in minutes. Custom themes, event listings, menus, and photo galleries — zero coding.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    title: "SMS Marketing",
    desc: "Send targeted campaigns, event reminders, and automated follow-ups. Grow your list with built-in opt-in tools.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Team Management",
    desc: "Assign roles, manage shifts, set permissions, and keep your staff aligned with built-in scheduling tools.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: "Customer CRM",
    desc: "Track regulars, VIPs, and new visitors. Store preferences, visit history, and automate personalized outreach.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Analytics & Insights",
    desc: "Real-time dashboards for revenue, foot traffic, campaign ROI, and staff performance. Data-driven decisions made easy.",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: 29,
    desc: "Perfect for single-location bars getting started.",
    features: [
      "1 venue",
      "Basic website builder",
      "500 SMS / month",
      "Up to 5 team members",
      "Email support",
      "Basic analytics",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: 79,
    desc: "For growing bar groups that need more power.",
    features: [
      "Up to 3 venues",
      "Advanced website builder",
      "2,000 SMS / month",
      "Unlimited team members",
      "Priority support",
      "Advanced analytics & reports",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 199,
    desc: "For large operations and nightlife brands.",
    features: [
      "Unlimited venues",
      "Custom domain & branding",
      "Unlimited SMS",
      "Full API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const testimonials = [
  {
    quote:
      "Juke Digital completely transformed how we run our bar. Our event bookings are up 40% and the SMS campaigns practically run themselves.",
    name: "Marcus Rivera",
    role: "Owner",
    venue: "The Velvet Lounge",
  },
  {
    quote:
      "We used to juggle five different tools. Now everything lives in one place. The website builder alone saved us thousands in dev costs.",
    name: "Sarah Chen",
    role: "General Manager",
    venue: "Neon Nights",
  },
  {
    quote:
      "The team management features are a game-changer. Scheduling shifts, tracking hours, managing permissions — it just works.",
    name: "Darnell Washington",
    role: "Operations Director",
    venue: "Copper & Oak",
  },
];

const faqs = [
  {
    q: "How long is the free trial?",
    a: "Every plan comes with a 14-day free trial. No credit card required. You get full access to all features in your chosen tier so you can test everything before committing.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time from your account settings. Changes take effect at the start of your next billing cycle, and we prorate any differences.",
  },
  {
    q: "Do I need technical skills to build a website?",
    a: "Not at all. Our website builder is fully drag-and-drop with pre-built templates designed specifically for bars and nightlife venues. If you can use a smartphone, you can build a website.",
  },
  {
    q: "How does SMS pricing work?",
    a: "Each plan includes a monthly SMS allowance. Messages are standard rate within the US and Canada. If you need more, you can purchase additional credits at $0.02 per message.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use bank-level encryption (AES-256), and all data is hosted on SOC 2 compliant infrastructure. We never sell your data, and you can export or delete it at any time.",
  },
];

const venueLogos = [
  "The Velvet Room",
  "Neon Nights",
  "Copper & Oak",
  "Luna Rooftop",
  "District 9",
  "The Basement",
];

/* ───────────────────────── Page ───────────────────────── */
export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* smooth-scroll helper for nav links */
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
      {/* ────────── Animated gradient background (hero) ────────── */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-gradient {
          background: linear-gradient(
            135deg,
            rgba(99,102,241,0.15) 0%,
            rgba(139,92,246,0.10) 25%,
            rgba(245,158,11,0.08) 50%,
            rgba(99,102,241,0.15) 75%,
            rgba(59,130,246,0.12) 100%
          );
          background-size: 400% 400%;
          animation: gradientShift 12s ease infinite;
        }
        .glass {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>

      {/* ────────── Nav ────────── */}
      <nav className="sticky top-0 z-50 glass bg-[var(--background)]/80 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <img
              src="/juke-digital-logo.png"
              alt="Juke Digital"
              className="w-20 h-20 rounded-xl object-contain"
            />
            <div className="hidden md:flex items-center gap-6 text-sm text-[var(--muted)]">
              <button onClick={() => scrollTo("features")} className="hover:text-white transition">
                Features
              </button>
              <button onClick={() => scrollTo("how-it-works")} className="hover:text-white transition">
                How It Works
              </button>
              <button onClick={() => scrollTo("pricing")} className="hover:text-white transition">
                Pricing
              </button>
              <button onClick={() => scrollTo("faq")} className="hover:text-white transition">
                FAQ
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[var(--muted)] hover:text-white transition text-sm"
            >
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary inline-block text-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ────────── 1. Hero ────────── */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/90 via-[var(--background)]/80 to-[var(--background)]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
          <FadeIn>
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 mb-8">
              The #1 Bar Management Platform
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
              Run your bar
              <br />
              <span className="bg-gradient-to-r from-[var(--primary)] to-[#a78bfa] bg-clip-text text-transparent">
                like a business
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Calendar scheduling, website builder, SMS marketing, and team
              management — all in one platform built for bars and nightlife
              venues.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="btn-primary text-lg px-8 py-3.5 inline-block rounded-lg font-semibold shadow-lg shadow-[var(--primary)]/25"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="btn-secondary text-lg px-8 py-3.5 inline-block rounded-lg font-semibold"
              >
                Sign In
              </Link>
            </div>
            <p className="text-xs text-[var(--muted)] mt-4">
              14-day free trial &middot; No credit card required
            </p>
          </FadeIn>

          {/* Dashboard mockup */}
          <FadeIn delay={0.45}>
            <div className="mt-16 mx-auto max-w-4xl rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl shadow-[var(--primary)]/10">
              <div className="bg-[var(--surface)] px-4 py-2.5 flex items-center gap-2 border-b border-[var(--border)]">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span className="ml-4 text-xs text-[var(--muted)]">
                  app.jukedigital.com/dashboard
                </span>
              </div>
              <div
                className="h-[340px] sm:h-[420px]"
                style={{
                  background:
                    "linear-gradient(145deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a24 100%)",
                }}
              >
                {/* Fake dashboard elements */}
                <div className="p-6 grid grid-cols-4 gap-4">
                  {["Revenue", "Visitors", "Events", "SMS Sent"].map(
                    (label, i) => (
                      <div
                        key={label}
                        className="rounded-lg p-3"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div className="text-[10px] text-[var(--muted)] mb-1">
                          {label}
                        </div>
                        <div className="text-sm font-bold text-white/80">
                          {["$12,482", "1,847", "24", "3,291"][i]}
                        </div>
                        <div className="mt-2 h-8 rounded bg-gradient-to-r from-[var(--primary)]/30 to-transparent" />
                      </div>
                    )
                  )}
                </div>
                <div className="px-6 grid grid-cols-3 gap-4">
                  <div
                    className="col-span-2 rounded-lg p-4"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="text-xs text-[var(--muted)] mb-3">
                      Weekly Revenue
                    </div>
                    <div className="flex items-end gap-2 h-24">
                      {[40, 65, 55, 80, 70, 90, 75].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${h}%`,
                            background: `linear-gradient(to top, var(--primary), rgba(99,102,241,0.3))`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div
                    className="rounded-lg p-4"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="text-xs text-[var(--muted)] mb-3">
                      Upcoming Events
                    </div>
                    {["DJ Night", "Happy Hour", "Trivia"].map((e) => (
                      <div
                        key={e}
                        className="text-[11px] text-white/60 py-1.5 border-b border-white/5 last:border-0"
                      >
                        {e}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ────────── 2. Social proof bar ────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)]/50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <FadeIn>
            <p className="text-center text-sm text-[var(--muted)] mb-8 tracking-wide uppercase font-medium">
              Trusted by 500+ bars and nightlife venues
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {venueLogos.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-center w-28 h-28 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs font-bold text-[var(--muted)] text-center leading-tight px-2"
                >
                  {name}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ────────── 3. Features deep-dive ────────── */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything you need to manage your venue
              </h2>
              <p className="text-[var(--muted)] max-w-xl mx-auto">
                Six powerful tools, one simple dashboard. Built exclusively for
                bars, clubs, and nightlife venues.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className="group p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all duration-300 h-full">
                  <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-4 group-hover:bg-[var(--primary)]/20 transition">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── 4. How it works ────────── */}
      <section
        id="how-it-works"
        className="py-24 bg-[var(--surface)]/40 border-y border-[var(--border)]"
      >
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Up and running in minutes
              </h2>
              <p className="text-[var(--muted)] max-w-lg mx-auto">
                Three simple steps to transform how you run your bar.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-[2px] bg-gradient-to-r from-[var(--primary)]/40 via-[var(--primary)] to-[var(--primary)]/40" />

            {[
              {
                step: 1,
                title: "Create your venue",
                desc: "Sign up and add your bar's details — name, location, hours, and branding. Takes under 2 minutes.",
                icon: (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.994 2.994 0 00.705-1.317L5.39 3.232A1.5 1.5 0 016.826 2.25h10.348a1.5 1.5 0 011.436.982l1.685 4.8A2.993 2.993 0 0021 9.349" />
                  </svg>
                ),
              },
              {
                step: 2,
                title: "Customize & build",
                desc: "Set up your website, configure SMS campaigns, invite your team, and load your event calendar.",
                icon: (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  </svg>
                ),
              },
              {
                step: 3,
                title: "Launch & grow",
                desc: "Go live, engage your customers, track results, and watch your venue thrive with real-time insights.",
                icon: (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                ),
              },
            ].map((s, i) => (
              <FadeIn key={s.step} delay={i * 0.15}>
                <div className="text-center relative z-10">
                  <div className="w-14 h-14 rounded-full bg-[var(--primary)] text-white flex items-center justify-center mx-auto mb-5 text-lg font-bold shadow-lg shadow-[var(--primary)]/30">
                    {s.step}
                  </div>
                  <div className="w-12 h-12 mx-auto mb-4 text-[var(--primary)]">
                    {s.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-[var(--muted)] max-w-xs mx-auto leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── Photo break ────────── */}
      <section className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920&q=80"
          alt="Bar atmosphere"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)] via-transparent to-[var(--background)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-[var(--background)]" />
      </section>

      {/* ────────── 5. Feature showcase (alternating) ────────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-32">
          {/* Website Builder */}
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 mb-4">
                  Website Builder
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  A stunning website in minutes, not months
                </h3>
                <p className="text-[var(--muted)] leading-relaxed mb-6">
                  Choose from templates designed for nightlife. Add your events,
                  menus, photo gallery, and contact info. Publish with one click
                  — no developer needed.
                </p>
                <ul className="space-y-2 text-sm text-[var(--muted)]">
                  {[
                    "Drag-and-drop editor",
                    "Mobile-optimized templates",
                    "Built-in event listings",
                    "Custom domain support",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-[var(--success)]">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Website mockup with real photo */}
              <div className="rounded-xl border border-[var(--border)] overflow-hidden shadow-2xl">
                <div className="bg-[var(--surface)] px-3 py-2 flex items-center gap-1.5 border-b border-[var(--border)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                  <div className="flex-1 mx-4">
                    <div className="bg-[var(--background)] rounded-md px-3 py-1 text-[10px] text-[var(--muted)] text-center">mybar.jukedigital.com</div>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"
                    alt="Bar website preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-white font-bold text-lg">The Midnight Lounge</div>
                    <div className="text-white/60 text-xs mt-1">Craft cocktails & live music</div>
                  </div>
                </div>
                <div className="p-4 bg-[#1a1a2e]">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {["https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&q=80",
                      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=200&q=80",
                      "https://images.unsplash.com/photo-1575444758702-4a6b9222c016?w=200&q=80"
                    ].map((src, n) => (
                      <img key={n} src={src} alt="" className="aspect-square rounded-lg object-cover" />
                    ))}
                  </div>
                  <div className="h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center text-xs text-white font-medium">
                    Reserve a Table
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* SMS Marketing */}
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Phone mockup */}
              <div className="order-2 md:order-1 flex justify-center">
                <div className="w-64 rounded-[2rem] border-4 border-[var(--border)] bg-[var(--background)] overflow-hidden shadow-xl">
                  <div className="bg-[var(--surface)] h-6 flex items-center justify-center">
                    <div className="w-16 h-3 rounded-full bg-[var(--border)]" />
                  </div>
                  <div className="p-4 space-y-3 min-h-[360px]">
                    <div className="text-center text-[10px] text-[var(--muted)] mb-4">
                      Messages
                    </div>
                    {/* Incoming */}
                    <div className="flex justify-start">
                      <div className="bg-[var(--surface)] rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%] text-xs text-[var(--foreground)]">
                        Hey! DJ Night is TONIGHT at The Velvet Room. Show this
                        text for free entry before 11pm 🎶
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[var(--primary)] rounded-2xl rounded-br-sm px-3 py-2 max-w-[85%] text-xs text-white">
                        Count me in! 🙌
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-[var(--surface)] rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%] text-xs text-[var(--foreground)]">
                        Awesome! You&apos;re on the list. See you tonight!
                      </div>
                    </div>
                    <div className="flex justify-start mt-6">
                      <div className="bg-[var(--surface)] rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%] text-xs text-[var(--foreground)]">
                        🔥 Happy Hour special: 2-for-1 cocktails every Friday
                        5-8pm. Reply YES to get weekly deals.
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[var(--primary)] rounded-2xl rounded-br-sm px-3 py-2 max-w-[85%] text-xs text-white">
                        YES
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mb-4">
                  SMS Marketing
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Fill your bar with one text message
                </h3>
                <p className="text-[var(--muted)] leading-relaxed mb-6">
                  Send event promos, flash deals, and VIP invites directly to
                  your customers&apos; phones. Automated campaigns run while you
                  focus on your bar.
                </p>
                <ul className="space-y-2 text-sm text-[var(--muted)]">
                  {[
                    "Scheduled campaigns",
                    "Automated event reminders",
                    "Audience segmentation",
                    "Opt-in list builder",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-[var(--success)]">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

          {/* Team Management */}
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20 mb-4">
                  Team Management
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Your entire staff, organized and aligned
                </h3>
                <p className="text-[var(--muted)] leading-relaxed mb-6">
                  Invite your team, assign roles, manage schedules, and keep
                  everyone in sync. No more group text chaos.
                </p>
                <ul className="space-y-2 text-sm text-[var(--muted)]">
                  {[
                    "Role-based permissions",
                    "Shift scheduling",
                    "Team announcements",
                    "Performance tracking",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-[var(--success)]">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Team roster mockup */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-xl">
                <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
                  <span className="text-sm font-semibold">Team Roster</span>
                  <span className="text-xs text-[var(--muted)]">
                    8 members
                  </span>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {[
                    { name: "Alex Johnson", role: "Manager", status: "online" },
                    {
                      name: "Jamie Lee",
                      role: "Bartender",
                      status: "online",
                    },
                    {
                      name: "Morgan Smith",
                      role: "Bartender",
                      status: "offline",
                    },
                    {
                      name: "Taylor Brown",
                      role: "Security",
                      status: "online",
                    },
                    { name: "Casey Davis", role: "DJ", status: "offline" },
                  ].map((m) => (
                    <div
                      key={m.name}
                      className="px-5 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--primary)]">
                          {m.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{m.name}</div>
                          <div className="text-xs text-[var(--muted)]">
                            {m.role}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`w-2 h-2 rounded-full ${m.status === "online" ? "bg-[var(--success)]" : "bg-[var(--muted)]/40"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ────────── 6. Pricing ────────── */}
      <section
        id="pricing"
        className="py-24 bg-[var(--surface)]/40 border-y border-[var(--border)]"
      >
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-[var(--muted)] max-w-lg mx-auto">
                Start free for 14 days. No credit card required. Cancel
                anytime.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.1}>
                <div
                  className={`relative rounded-2xl p-8 h-full flex flex-col ${
                    tier.popular
                      ? "bg-[var(--surface)] border-2 border-[var(--primary)] shadow-xl shadow-[var(--primary)]/10"
                      : "bg-[var(--surface)] border border-[var(--border)]"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-[var(--primary)] text-white tracking-wide uppercase">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                    <p className="text-sm text-[var(--muted)]">{tier.desc}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold">
                      ${tier.price}
                    </span>
                    <span className="text-[var(--muted)] text-sm">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-[var(--muted)]"
                      >
                        <span className="text-[var(--success)] mt-0.5">
                          &#10003;
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`block text-center py-3 rounded-lg font-semibold transition ${
                      tier.popular
                        ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-lg shadow-[var(--primary)]/25"
                        : "bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--primary)]/50"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── 7. Testimonials ────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--background)]/90" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Loved by bar owners everywhere
              </h2>
              <p className="text-[var(--muted)]">
                See what venue operators are saying about Juke Digital.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg
                        key={j}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="var(--accent)"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--foreground)]/80 mb-6 flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-sm font-bold text-[var(--primary)]">
                      {t.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-[var(--muted)]">
                        {t.role}, {t.venue}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── 8. FAQ ────────── */}
      <section
        id="faq"
        className="py-24 bg-[var(--surface)]/40 border-y border-[var(--border)]"
      >
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently asked questions
              </h2>
              <p className="text-[var(--muted)]">
                Got questions? We&apos;ve got answers.
              </p>
            </div>
          </FadeIn>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[var(--surface-hover)] transition"
                  >
                    <span className="font-medium text-sm pr-4">{faq.q}</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className={`flex-shrink-0 text-[var(--muted)] transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: openFaq === i ? "200px" : "0px",
                      opacity: openFaq === i ? 1 : 0,
                    }}
                  >
                    <p className="px-6 pb-4 text-sm text-[var(--muted)] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── 9. Final CTA ────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div
              className="rounded-2xl p-12 md:p-16 text-center relative overflow-hidden"
            >
              {/* Background image with gradient overlay */}
              <img
                src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&q=80"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.85) 0%, rgba(124,58,237,0.85) 50%, rgba(167,139,250,0.80) 100%)",
                }}
              />
              {/* Subtle overlay pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                }}
              />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to run your bar like a business?
                </h2>
                <p className="text-white/70 max-w-lg mx-auto mb-8 text-lg">
                  Join 500+ venues already using Juke Digital to book more
                  events, fill more seats, and grow their brand.
                </p>
                <Link
                  href="/signup"
                  className="inline-block bg-white text-[var(--primary)] px-8 py-3.5 rounded-lg font-bold text-lg hover:bg-white/90 transition shadow-xl"
                >
                  Start Your Free Trial
                </Link>
                <p className="text-white/50 text-xs mt-4">
                  14-day free trial &middot; No credit card required
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ────────── 10. Footer ────────── */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]/30">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <img
                src="/juke-digital-logo.png"
                alt="Juke Digital"
                className="w-16 h-16 rounded-xl object-contain mb-4"
              />
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                The all-in-one platform for bars and nightlife venues.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                {[
                  "Calendar",
                  "Website Builder",
                  "SMS Marketing",
                  "Team Management",
                  "CRM",
                  "Analytics",
                ].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollTo("features")}
                      className="hover:text-white transition"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                {["About", "Blog", "Careers", "Contact", "Partners"].map(
                  (item) => (
                    <li key={item}>
                      <a href="#" className="hover:text-white transition">
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Cookie Policy",
                  "GDPR",
                ].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--muted)]">
              &copy; {new Date().getFullYear()} Juke Digital. All rights
              reserved.
            </p>
            <div className="flex items-center gap-5">
              {/* Twitter / X */}
              <a
                href="#"
                className="text-[var(--muted)] hover:text-white transition"
                aria-label="Twitter"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                className="text-[var(--muted)] hover:text-white transition"
                aria-label="Instagram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="#"
                className="text-[var(--muted)] hover:text-white transition"
                aria-label="LinkedIn"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
