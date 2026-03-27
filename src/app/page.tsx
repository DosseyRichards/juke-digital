import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center font-bold text-white text-sm">
            J
          </div>
          <span className="text-xl font-bold">Juke Digital</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[var(--muted)] hover:text-white transition">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary inline-block">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 mb-6">
          Bar Management Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Run your bar
          <br />
          <span className="text-[var(--primary)]">like a business</span>
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-10">
          Calendar scheduling, website builder, SMS marketing, and team management — all in one platform built for bars and nightlife venues.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="btn-primary text-lg px-8 py-3 inline-block">
            Start Free Trial
          </Link>
          <Link href="/login" className="btn-secondary text-lg px-8 py-3 inline-block">
            Sign In
          </Link>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24 text-left">
          {[
            {
              title: "Calendar",
              desc: "Schedule events, shifts, and promotions with a drag-and-drop calendar.",
              icon: "📅",
            },
            {
              title: "Website Builder",
              desc: "Create a beautiful website for your venue in minutes, no code required.",
              icon: "🌐",
            },
            {
              title: "SMS Marketing",
              desc: "Reach your customers with targeted SMS campaigns and automations.",
              icon: "💬",
            },
            {
              title: "Team Management",
              desc: "Manage roles, schedules, and permissions for your entire staff.",
              icon: "👥",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--muted)]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-6 text-center text-sm text-[var(--muted)]">
        &copy; {new Date().getFullYear()} Juke Digital. All rights reserved.
      </footer>
    </div>
  );
}
