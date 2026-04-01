import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/juke-digital-logo.png"
              alt="Juke Digital"
              className="w-12 h-12 rounded-lg object-contain"
            />
            <span className="font-bold text-lg">Juke Digital</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition"
          >
            &larr; Back to home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Built by bar owners,{" "}
            <span className="text-[var(--primary)]">for bar owners</span>
          </h1>
          <p className="text-xl text-[var(--muted)] leading-relaxed">
            We spent years running venues before building the software we wished
            existed. Juke Digital is the all-in-one platform that replaces the
            spreadsheets, group texts, and scattered tools that hold nightlife
            businesses back.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 px-6 bg-[var(--surface)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">What We Do</h2>
          <p className="text-[var(--muted)] leading-relaxed mb-6">
            Juke Digital is a bar and nightlife venue management platform that
            brings your entire operation into one place. From event scheduling
            and website building to SMS marketing, team management, customer CRM,
            and real-time analytics, we give venue operators the tools they need
            to fill rooms, retain customers, and grow revenue.
          </p>
          <p className="text-[var(--muted)] leading-relaxed">
            Whether you run a neighborhood cocktail bar, a high-volume nightclub,
            or a multi-venue entertainment group, Juke Digital scales with you.
            Our platform is designed for the fast pace and unique demands of
            nightlife, not retrofitted from generic business software.
          </p>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-10">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <h3 className="text-xl font-semibold mb-3">Venue-First Thinking</h3>
              <p className="text-[var(--muted)]">
                Every feature we build starts with a real problem faced by a real
                venue operator. We do not build in a vacuum. Our product roadmap is
                shaped by conversations with bartenders, managers, and owners on the
                ground.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <h3 className="text-xl font-semibold mb-3">Radical Simplicity</h3>
              <p className="text-[var(--muted)]">
                Nightlife moves fast. Our tools should never slow you down. We
                obsess over reducing clicks, eliminating complexity, and making
                powerful features feel effortless, even at 1 AM on a Saturday night.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <h3 className="text-xl font-semibold mb-3">Data You Can Trust</h3>
              <p className="text-[var(--muted)]">
                We take the security and privacy of your venue data and your
                customers&apos; data seriously. We use enterprise-grade encryption,
                strict access controls, and transparent data practices. Your data
                belongs to you, always.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <h3 className="text-xl font-semibold mb-3">Community Over Competition</h3>
              <p className="text-[var(--muted)]">
                We believe a rising tide lifts all boats. We actively support the
                nightlife industry through educational content, operator meetups, and
                partnerships with hospitality organizations. When venues thrive,
                everyone wins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6 bg-[var(--surface)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-10">The Team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)]">
              <div className="w-16 h-16 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-xl font-bold mb-4">
                MR
              </div>
              <h3 className="text-lg font-semibold">Marcus Reyes</h3>
              <p className="text-sm text-[var(--primary)] mb-3">
                Co-Founder &amp; CEO
              </p>
              <p className="text-sm text-[var(--muted)]">
                Former nightclub owner who managed three venues in Austin, TX for
                over a decade. Marcus experienced firsthand the chaos of running
                events on spreadsheets and knew there had to be a better way.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)]">
              <div className="w-16 h-16 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-xl font-bold mb-4">
                JC
              </div>
              <h3 className="text-lg font-semibold">Jordan Chen</h3>
              <p className="text-sm text-[var(--primary)] mb-3">
                Co-Founder &amp; CTO
              </p>
              <p className="text-sm text-[var(--muted)]">
                Full-stack engineer with 12 years in SaaS. Previously led
                engineering at a hospitality tech startup. Jordan designed the
                architecture that lets Juke Digital scale from a single bar to an
                enterprise venue group.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)]">
              <div className="w-16 h-16 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-xl font-bold mb-4">
                SP
              </div>
              <h3 className="text-lg font-semibold">Sofia Patel</h3>
              <p className="text-sm text-[var(--primary)] mb-3">
                Head of Product
              </p>
              <p className="text-sm text-[var(--muted)]">
                Product leader with deep expertise in marketplace and SMB
                platforms. Sofia spent three years bartending in college, which gave
                her a unique perspective on the daily friction venue staff face with
                existing tools.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)]">
              <div className="w-16 h-16 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-xl font-bold mb-4">
                DW
              </div>
              <h3 className="text-lg font-semibold">Derek Washington</h3>
              <p className="text-sm text-[var(--primary)] mb-3">
                Head of Growth
              </p>
              <p className="text-sm text-[var(--muted)]">
                Former marketing director for a national bar franchise. Derek
                brings 8 years of experience in hospitality marketing and
                customer acquisition. He leads our go-to-market strategy and
                partner programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Juke Digital by the Numbers
          </h2>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-[var(--primary)]">500+</p>
              <p className="text-[var(--muted)] mt-2">Venues powered</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[var(--primary)]">50k+</p>
              <p className="text-[var(--muted)] mt-2">SMS messages sent</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[var(--primary)]">10k+</p>
              <p className="text-[var(--muted)] mt-2">Events managed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[var(--surface)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to modernize your venue?
          </h2>
          <p className="text-[var(--muted)] mb-8 text-lg">
            Join hundreds of bars and nightclubs already using Juke Digital to
            streamline operations and grow their business.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 rounded-lg bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-[var(--muted)]">
          &copy; {new Date().getFullYear()} Juke Digital. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
