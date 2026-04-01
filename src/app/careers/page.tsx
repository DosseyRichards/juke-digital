import Link from "next/link";

const positions = [
  {
    title: "Full Stack Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "Build and ship features across our Next.js frontend and Supabase backend. You will work on the event calendar, website builder, SMS engine, and analytics dashboards used by hundreds of venues daily.",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description:
      "Own the end-to-end design of our bar management platform. From user research with venue operators to high-fidelity prototypes, you will shape how nightlife businesses interact with Juke Digital every day.",
  },
  {
    title: "Growth Marketer",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description:
      "Drive user acquisition and revenue growth through paid channels, content marketing, partnerships, and lifecycle campaigns targeting bar owners and nightlife operators across the US.",
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote",
    type: "Full-time",
    description:
      "Be the primary point of contact for our venue clients. You will onboard new customers, drive adoption, reduce churn, and gather feedback that shapes our product roadmap. Nightlife industry experience is a plus.",
  },
];

const benefits = [
  {
    title: "Remote-First",
    description:
      "Work from anywhere. Our team is distributed across the US with optional co-working stipends.",
  },
  {
    title: "Unlimited PTO",
    description:
      "We trust you to manage your time. Take the vacation you need to stay sharp and creative.",
  },
  {
    title: "Equity for Everyone",
    description:
      "Every full-time employee receives stock options. We grow together.",
  },
  {
    title: "Health & Wellness",
    description:
      "Comprehensive medical, dental, and vision insurance plus a monthly wellness stipend.",
  },
  {
    title: "Learning Budget",
    description:
      "$1,500/year for courses, conferences, books, or anything that helps you grow professionally.",
  },
  {
    title: "Latest Equipment",
    description:
      "MacBook Pro, monitor, and any peripherals you need to do your best work, shipped to your door.",
  },
];

export default function CareersPage() {
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
          <h1 className="text-5xl font-bold mb-6">Join Our Team</h1>
          <p className="text-xl text-[var(--muted)] leading-relaxed">
            We are building the operating system for nightlife. If you are
            passionate about great software and want to help bars and venues
            thrive, we want to hear from you.
          </p>
        </div>
      </section>

      {/* Culture */}
      <section className="py-16 px-6 bg-[var(--surface)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">How We Work</h2>
          <p className="text-[var(--muted)] leading-relaxed mb-4">
            Juke Digital is a remote-first team of builders who care deeply about
            craft. We ship fast, iterate based on real feedback from venue
            operators, and hold ourselves to a high bar on quality. We keep
            meetings lean, documentation strong, and trust high.
          </p>
          <p className="text-[var(--muted)] leading-relaxed">
            Our culture is rooted in the nightlife industry we serve:
            high-energy, collaborative, and never boring. We celebrate wins
            together, support each other through challenges, and make space for
            the creative thinking that produces great products.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-10">Benefits &amp; Perks</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
              >
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-[var(--muted)]">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-6 bg-[var(--surface)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-10">Open Positions</h2>
          <div className="space-y-6">
            {positions.map((position) => (
              <div
                key={position.title}
                className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <h3 className="text-xl font-semibold">{position.title}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--primary)]/20 text-[var(--primary)]">
                      {position.department}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]">
                      {position.location}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]">
                      {position.type}
                    </span>
                  </div>
                </div>
                <p className="text-[var(--muted)] text-sm mb-4 leading-relaxed">
                  {position.description}
                </p>
                <a
                  href={`mailto:careers@jukedigital.com?subject=Application: ${position.title}`}
                  className="inline-block px-5 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-xl bg-[var(--background)] border border-[var(--border)] text-center">
            <h3 className="text-lg font-semibold mb-2">
              Do not see the right role?
            </h3>
            <p className="text-[var(--muted)] mb-4">
              We are always looking for talented people who are passionate about
              nightlife and technology. Send us your resume and tell us how you
              would contribute.
            </p>
            <a
              href="mailto:careers@jukedigital.com?subject=General Application"
              className="text-[var(--primary)] font-medium hover:underline"
            >
              careers@jukedigital.com
            </a>
          </div>
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
