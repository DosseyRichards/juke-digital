import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-[var(--muted)] mb-12">
          Last updated: March 30, 2026
        </p>

        <div className="space-y-10 text-[var(--muted)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              1. Introduction
            </h2>
            <p>
              Juke Digital (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the Juke Digital
              bar and venue management platform. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you
              use our platform, website, and related services. By using Juke
              Digital, you agree to the collection and use of information in
              accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-2">
              Account Information
            </h3>
            <p>
              When you create an account, we collect your name, email address,
              phone number, business name, and payment information. If you sign up
              on behalf of a venue, we also collect venue details such as address,
              operating hours, and liquor license information where applicable.
            </p>

            <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-2">
              Venue Data
            </h3>
            <p>
              We collect data you input into the platform including event
              schedules, staff rosters, menus, pricing, promotional content,
              website content built with our website builder, and photos or media
              you upload.
            </p>

            <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-2">
              Customer Data
            </h3>
            <p>
              Through our CRM and SMS marketing features, you may store
              information about your venue&apos;s customers, including names, phone
              numbers, email addresses, visit history, preferences, and VIP
              status. You are the data controller for this customer data, and we
              process it on your behalf.
            </p>

            <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-2">
              Usage Analytics
            </h3>
            <p>
              We automatically collect information about how you interact with our
              platform, including pages visited, features used, session duration,
              device information, IP address, browser type, and referring URLs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              3. How We Use Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain, and improve the Juke Digital platform</li>
              <li>To process transactions and send billing-related communications</li>
              <li>To send SMS campaigns and messages on your behalf to your customers</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To send platform updates, security alerts, and administrative messages</li>
              <li>To analyze usage patterns and improve user experience</li>
              <li>To detect, prevent, and address technical issues and fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              4. Data Sharing and Third Parties
            </h2>
            <p className="mb-4">
              We do not sell your personal information. We may share data with the
              following categories of third parties:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[var(--foreground)]">Supabase:</strong> Our
                database and authentication infrastructure is hosted on Supabase.
                Your data is stored securely on their servers.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">SMS Providers:</strong> We
                use third-party SMS delivery services (such as Twilio) to send text
                messages on your behalf to your customers.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Payment Processors:</strong>{" "}
                We use Stripe to process subscription payments. We do not store
                your full credit card information on our servers.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Analytics Providers:</strong>{" "}
                We use analytics tools to understand platform usage and improve our
                services.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Legal Requirements:</strong>{" "}
                We may disclose information if required by law, subpoena, or
                government request, or to protect our rights and safety.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              5. Data Retention
            </h2>
            <p>
              We retain your account data for as long as your account is active or
              as needed to provide services. If you cancel your subscription, we
              retain your data for 90 days in case you wish to reactivate, after
              which it is permanently deleted. Certain data may be retained longer
              if required by law (e.g., billing records for tax purposes). Customer
              data stored in your CRM is deleted when your account is deleted, or
              upon your request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              6. Your Rights
            </h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[var(--foreground)]">Access:</strong> Request a
                copy of the personal data we hold about you.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Correction:</strong> Request
                that we correct inaccurate or incomplete data.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Deletion:</strong> Request
                that we delete your personal data, subject to legal retention
                requirements.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Data Portability:</strong>{" "}
                Request an export of your data in a machine-readable format (CSV or
                JSON).
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Opt-Out:</strong> Unsubscribe
                from marketing communications at any time.
              </li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:privacy@jukedigital.com"
                className="text-[var(--primary)] hover:underline"
              >
                privacy@jukedigital.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              7. Cookies and Tracking
            </h2>
            <p>
              We use cookies and similar tracking technologies to maintain your
              session, remember your preferences, and analyze platform usage.
              Essential cookies are required for the platform to function (e.g.,
              authentication tokens). You can manage your cookie preferences through
              your browser settings, though disabling essential cookies may prevent
              you from using the platform. For more details, see our{" "}
              <Link
                href="/cookies"
                className="text-[var(--primary)] hover:underline"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              8. Children&apos;s Privacy
            </h2>
            <p>
              Juke Digital is designed for use by adults aged 18 and older who
              operate or manage bars, nightclubs, and similar nightlife venues. We
              do not knowingly collect personal information from anyone under the
              age of 18. If we learn that we have collected information from a
              person under 18, we will delete it immediately. If you believe a
              minor has provided us with personal data, please contact us at{" "}
              <a
                href="mailto:privacy@jukedigital.com"
                className="text-[var(--primary)] hover:underline"
              >
                privacy@jukedigital.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              9. California Privacy Rights (CCPA)
            </h2>
            <p className="mb-4">
              If you are a California resident, you have additional rights under
              the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The right to know what personal information we collect, use,
                disclose, and sell.
              </li>
              <li>The right to request deletion of your personal information.</li>
              <li>
                The right to opt out of the sale of your personal information. We
                do not sell personal information.
              </li>
              <li>
                The right to non-discrimination for exercising your privacy rights.
              </li>
            </ul>
            <p className="mt-4">
              To exercise your CCPA rights, email us at{" "}
              <a
                href="mailto:privacy@jukedigital.com"
                className="text-[var(--primary)] hover:underline"
              >
                privacy@jukedigital.com
              </a>{" "}
              with the subject line &quot;CCPA Request.&quot;
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              10. International Data Transfers
            </h2>
            <p>
              Juke Digital is based in the United States. If you access our
              platform from outside the US, your information may be transferred to
              and processed in the United States. We take appropriate safeguards to
              ensure your data is protected in accordance with this Privacy Policy,
              including Standard Contractual Clauses where required. For users in
              the European Economic Area, please see our{" "}
              <Link
                href="/gdpr"
                className="text-[var(--primary)] hover:underline"
              >
                GDPR Compliance
              </Link>{" "}
              page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              11. Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              data, including encryption in transit (TLS) and at rest, regular
              security audits, role-based access controls, and secure
              authentication via Supabase Auth. However, no method of transmission
              or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              12. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify
              you of material changes by posting a notice on our platform or
              sending an email. Your continued use of Juke Digital after changes
              are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              13. Contact Us
            </h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our
              data practices, please contact us:
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
