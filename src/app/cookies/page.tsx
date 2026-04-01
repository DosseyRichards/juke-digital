import Link from "next/link";

export default function CookiesPage() {
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
        <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-[var(--muted)] mb-12">
          Last updated: March 30, 2026
        </p>

        <div className="space-y-10 text-[var(--muted)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              1. What Are Cookies
            </h2>
            <p>
              Cookies are small text files that are placed on your device when you
              visit a website. They are widely used to make websites work more
              efficiently, provide a better user experience, and supply information
              to the site owners. Cookies can be &quot;persistent&quot; (remaining on your
              device until they expire or you delete them) or &quot;session&quot; cookies
              (deleted when you close your browser).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              2. Types of Cookies We Use
            </h2>

            <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">
              Essential Cookies
            </h3>
            <p className="mb-4">
              These cookies are strictly necessary for the Platform to function.
              Without them, you cannot log in, navigate, or use core features.
              These cookies cannot be disabled.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[var(--border)] rounded-lg">
                <thead>
                  <tr className="bg-[var(--surface)]">
                    <th className="text-left p-3 border-b border-[var(--border)] text-[var(--foreground)]">Cookie</th>
                    <th className="text-left p-3 border-b border-[var(--border)] text-[var(--foreground)]">Purpose</th>
                    <th className="text-left p-3 border-b border-[var(--border)] text-[var(--foreground)]">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-[var(--border)] font-mono text-xs">sb-access-token</td>
                    <td className="p-3 border-b border-[var(--border)]">Supabase authentication access token</td>
                    <td className="p-3 border-b border-[var(--border)]">1 hour</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-[var(--border)] font-mono text-xs">sb-refresh-token</td>
                    <td className="p-3 border-b border-[var(--border)]">Supabase authentication refresh token</td>
                    <td className="p-3 border-b border-[var(--border)]">7 days</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-[var(--border)] font-mono text-xs">sb-auth-token</td>
                    <td className="p-3 border-b border-[var(--border)]">Stores the current session information</td>
                    <td className="p-3 border-b border-[var(--border)]">Session</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">csrf-token</td>
                    <td className="p-3">Cross-site request forgery protection</td>
                    <td className="p-3">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-[var(--foreground)] mt-8 mb-3">
              Functional Cookies
            </h3>
            <p className="mb-4">
              These cookies remember your preferences and settings to provide a
              more personalized experience.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[var(--border)] rounded-lg">
                <thead>
                  <tr className="bg-[var(--surface)]">
                    <th className="text-left p-3 border-b border-[var(--border)] text-[var(--foreground)]">Cookie</th>
                    <th className="text-left p-3 border-b border-[var(--border)] text-[var(--foreground)]">Purpose</th>
                    <th className="text-left p-3 border-b border-[var(--border)] text-[var(--foreground)]">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-[var(--border)] font-mono text-xs">theme-preference</td>
                    <td className="p-3 border-b border-[var(--border)]">Stores your dark/light theme preference</td>
                    <td className="p-3 border-b border-[var(--border)]">1 year</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-[var(--border)] font-mono text-xs">sidebar-state</td>
                    <td className="p-3 border-b border-[var(--border)]">Remembers if the dashboard sidebar is collapsed</td>
                    <td className="p-3 border-b border-[var(--border)]">1 year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">locale</td>
                    <td className="p-3">Stores your language/region preference</td>
                    <td className="p-3">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-[var(--foreground)] mt-8 mb-3">
              Analytics Cookies
            </h3>
            <p className="mb-4">
              These cookies help us understand how users interact with the Platform
              so we can improve it.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[var(--border)] rounded-lg">
                <thead>
                  <tr className="bg-[var(--surface)]">
                    <th className="text-left p-3 border-b border-[var(--border)] text-[var(--foreground)]">Cookie</th>
                    <th className="text-left p-3 border-b border-[var(--border)] text-[var(--foreground)]">Purpose</th>
                    <th className="text-left p-3 border-b border-[var(--border)] text-[var(--foreground)]">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-[var(--border)] font-mono text-xs">_jd_analytics</td>
                    <td className="p-3 border-b border-[var(--border)]">Juke Digital internal analytics identifier</td>
                    <td className="p-3 border-b border-[var(--border)]">1 year</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-[var(--border)] font-mono text-xs">_jd_session</td>
                    <td className="p-3 border-b border-[var(--border)]">Tracks session activity for analytics</td>
                    <td className="p-3 border-b border-[var(--border)]">30 minutes</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">_jd_referrer</td>
                    <td className="p-3">Records how you arrived at the Platform</td>
                    <td className="p-3">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-[var(--foreground)] mt-8 mb-3">
              Marketing Cookies
            </h3>
            <p>
              We may use marketing cookies to deliver relevant advertisements and
              track campaign performance. These are only used on our public
              marketing website, not within the authenticated Platform. Currently,
              we do not place marketing cookies, but we reserve the right to do so
              with appropriate notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              3. How to Manage Cookies
            </h2>
            <p className="mb-4">
              Most web browsers allow you to manage cookies through their settings.
              You can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>View which cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
            <p className="mt-4">
              Please note that blocking essential cookies will prevent you from
              logging in and using the Juke Digital platform. Here are links to
              cookie management instructions for common browsers:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong className="text-[var(--foreground)]">Chrome:</strong>{" "}
                Settings &gt; Privacy and Security &gt; Cookies
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Firefox:</strong>{" "}
                Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Safari:</strong>{" "}
                Preferences &gt; Privacy &gt; Manage Website Data
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Edge:</strong>{" "}
                Settings &gt; Cookies and Site Permissions
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              4. Third-Party Cookies
            </h2>
            <p>
              Some cookies on our Platform are set by third-party services we
              integrate with. These include Supabase (for authentication), and
              potentially analytics providers. These third parties have their own
              cookie and privacy policies, which we encourage you to review.
              We do not control the cookies set by third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              5. Changes to This Cookie Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes
              in our practices or for legal, operational, or regulatory reasons. We
              will post any changes on this page with an updated &quot;Last updated&quot;
              date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              6. Contact Us
            </h2>
            <p>
              If you have questions about our use of cookies, please contact us:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <p className="text-[var(--foreground)] font-medium">Juke Digital</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:privacy@jukedigital.com"
                  className="text-[var(--primary)] hover:underline"
                >
                  privacy@jukedigital.com
                </a>
              </p>
            </div>
          </section>
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
