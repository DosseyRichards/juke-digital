import Link from "next/link";

const posts = [
  {
    title: "How We Redesigned the Event Calendar to Save You 5 Hours a Week",
    date: "March 25, 2026",
    category: "Product Updates",
    excerpt:
      "Our new drag-and-drop calendar with recurring event templates, conflict detection, and Google Calendar sync is now live. Here is what changed and why it matters for your weekly planning workflow.",
  },
  {
    title: "7 SMS Campaigns Every Bar Should Run This Summer",
    date: "March 18, 2026",
    category: "Industry Tips",
    excerpt:
      "Summer is peak season for nightlife. We break down seven proven SMS campaign strategies, from happy hour flash deals to VIP bottle service pre-sales, that top-performing venues use to pack the house.",
  },
  {
    title: "Case Study: How The Velvet Room Increased Repeat Visits by 40%",
    date: "March 10, 2026",
    category: "Case Studies",
    excerpt:
      "The Velvet Room in Nashville used Juke Digital's CRM and automated SMS follow-ups to turn first-time visitors into loyal regulars. Their GM shares the exact workflows and results after six months on the platform.",
  },
  {
    title: "The Complete Guide to TCPA Compliance for Bar SMS Marketing",
    date: "February 28, 2026",
    category: "Industry Tips",
    excerpt:
      "Sending texts to your customers without proper compliance can lead to serious fines. This guide covers opt-in requirements, quiet hours, opt-out handling, and how Juke Digital keeps you compliant automatically.",
  },
  {
    title: "New Feature: Multi-Venue Dashboard and Cross-Location Analytics",
    date: "February 15, 2026",
    category: "Product Updates",
    excerpt:
      "Managing multiple venues just got easier. Our new multi-venue dashboard lets you compare event performance, SMS engagement, and customer metrics across all your locations from a single screen.",
  },
];

const categoryColors: Record<string, string> = {
  "Product Updates": "bg-blue-500/20 text-blue-400",
  "Industry Tips": "bg-amber-500/20 text-amber-400",
  "Case Studies": "bg-green-500/20 text-green-400",
};

export default function BlogPage() {
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

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-[var(--muted)] mb-12 text-lg">
          Product updates, industry insights, and stories from the venues using
          Juke Digital to run better nights.
        </p>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.title}
              className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    categoryColors[post.category] || "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {post.category}
                </span>
                <span className="text-xs text-[var(--muted)]">{post.date}</span>
              </div>
              <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
              <p className="text-[var(--muted)] mb-4 leading-relaxed">
                {post.excerpt}
              </p>
              <a
                href="#"
                className="text-[var(--primary)] text-sm font-medium hover:underline"
              >
                Read more &rarr;
              </a>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-[var(--muted)]">
          &copy; {new Date().getFullYear()} Juke Digital. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
