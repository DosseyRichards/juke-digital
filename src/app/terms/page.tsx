import Link from "next/link";

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-[var(--muted)] mb-12">
          Effective date: March 30, 2026
        </p>

        <div className="space-y-10 text-[var(--muted)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Juke Digital (&quot;the Platform&quot;), you agree to be
              bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to
              these Terms, you may not use the Platform. These Terms constitute a
              legally binding agreement between you and Juke Digital, Inc.
              (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). If you are using the Platform on
              behalf of an organization, you represent that you have authority to
              bind that organization to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              2. Description of Service
            </h2>
            <p>
              Juke Digital is a software-as-a-service (SaaS) platform designed for
              bars, nightclubs, and nightlife venues. The Platform provides the
              following core features:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong className="text-[var(--foreground)]">Event Calendar &amp; Scheduling:</strong>{" "}
                Drag-and-drop calendar for managing events, shows, DJ sets, happy
                hours, and private bookings.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Website Builder:</strong>{" "}
                Tools to create and manage a public-facing venue website with
                custom themes, event listings, menus, and photo galleries.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">SMS Marketing:</strong>{" "}
                Send targeted text message campaigns, event reminders, and
                automated follow-ups to your customer list.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Team Management:</strong>{" "}
                Staff scheduling, role assignments, permissions, and internal
                communications.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Customer CRM:</strong>{" "}
                Track customer profiles, visit history, preferences, VIP status,
                and engagement.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Analytics &amp; Reporting:</strong>{" "}
                Dashboards and reports covering event performance, SMS metrics,
                customer engagement, and revenue insights.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              3. Account Registration and Responsibilities
            </h2>
            <p>
              To use the Platform, you must create an account by providing
              accurate, current, and complete information. You are responsible for
              maintaining the confidentiality of your login credentials and for all
              activity that occurs under your account. You must notify us
              immediately of any unauthorized use. You must be at least 18 years
              old to create an account. Each venue requires a separate workspace
              within the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              4. Subscription and Billing
            </h2>
            <p className="mb-4">
              Juke Digital offers the following subscription plans:
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <p className="font-semibold text-[var(--foreground)]">
                  Starter &mdash; $29/month
                </p>
                <p className="text-sm mt-1">
                  1 venue, event calendar, basic website builder, up to 500 SMS
                  per month, up to 5 team members.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <p className="font-semibold text-[var(--foreground)]">
                  Pro &mdash; $79/month
                </p>
                <p className="text-sm mt-1">
                  Up to 3 venues, full website builder with custom domains, up to
                  5,000 SMS per month, unlimited team members, CRM, and advanced
                  analytics.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <p className="font-semibold text-[var(--foreground)]">
                  Enterprise &mdash; $199/month
                </p>
                <p className="text-sm mt-1">
                  Unlimited venues, unlimited SMS, white-label website builder,
                  API access, dedicated account manager, priority support, and
                  custom integrations.
                </p>
              </div>
            </div>
            <p className="mt-4">
              All subscriptions are billed monthly unless you opt for annual
              billing (which provides a 20% discount). Payments are processed via
              Stripe. You may cancel your subscription at any time; cancellation
              takes effect at the end of the current billing period. Refunds are
              not provided for partial billing periods. We reserve the right to
              change pricing with 30 days&apos; written notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              5. Acceptable Use Policy
            </h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Platform for any unlawful purpose</li>
              <li>
                Send unsolicited SMS messages (spam) or messages without proper
                consent
              </li>
              <li>Upload malicious content, viruses, or harmful code</li>
              <li>
                Attempt to gain unauthorized access to other users&apos; accounts or
                our systems
              </li>
              <li>
                Scrape, crawl, or use automated tools to extract data from the
                Platform
              </li>
              <li>
                Impersonate another person or entity, or misrepresent your
                affiliation
              </li>
              <li>
                Use the Platform to promote illegal activity, including underage
                drinking
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of the
                Platform
              </li>
              <li>Resell or sublicense access to the Platform without our written consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              6. Intellectual Property
            </h2>
            <p>
              The Juke Digital platform, including all software, design, branding,
              logos, documentation, and related materials, is owned by Juke
              Digital, Inc. and protected by intellectual property laws. We grant
              you a limited, non-exclusive, non-transferable license to use the
              Platform in accordance with these Terms.
            </p>
            <p className="mt-4">
              You retain all ownership rights to the content you create and upload
              to the Platform, including venue information, event details, photos,
              menus, and customer data. By uploading content, you grant us a
              limited license to host, display, and transmit that content as
              necessary to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              7. User-Generated Content and Venue Websites
            </h2>
            <p>
              Websites you create using our website builder are hosted on Juke
              Digital infrastructure. You are solely responsible for the content
              published on your venue website, including compliance with local
              advertising and liquor laws. We reserve the right to remove content
              that violates these Terms or applicable law. Venue websites created
              on the Starter plan will display a &quot;Powered by Juke Digital&quot; badge.
              Pro and Enterprise plans may remove this branding.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              8. SMS Messaging Compliance
            </h2>
            <p>
              You are responsible for complying with all applicable SMS messaging
              laws, including the Telephone Consumer Protection Act (TCPA), CAN-SPAM
              Act, and any state or local regulations. Specifically, you must:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                Obtain prior express written consent from recipients before sending
                marketing SMS messages
              </li>
              <li>
                Provide clear opt-in mechanisms and honor opt-out requests
                immediately
              </li>
              <li>
                Include your venue name and opt-out instructions in every marketing
                message
              </li>
              <li>
                Maintain records of consent for each recipient
              </li>
              <li>
                Not send messages outside of appropriate hours (before 8 AM or
                after 9 PM in the recipient&apos;s time zone)
              </li>
            </ul>
            <p className="mt-4">
              Juke Digital provides tools to help you comply with these
              requirements, including built-in opt-in forms and automatic opt-out
              handling. However, compliance remains your responsibility. Violation
              of SMS regulations may result in immediate suspension of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              9. Third-Party Services
            </h2>
            <p>
              The Platform integrates with third-party services including Supabase
              (database and authentication), Stripe (payments), Twilio (SMS
              delivery), Google Calendar (calendar sync), and others. Your use of
              these integrations is subject to the respective third party&apos;s terms
              of service. We are not responsible for the availability, accuracy, or
              content of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              10. Limitation of Liability
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, JUKE DIGITAL SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA,
              USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE
              PLATFORM. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS
              OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE AMOUNT YOU PAID TO
              US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM. THE PLATFORM IS
              PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              11. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless Juke Digital, its
              officers, directors, employees, and agents from any claims, damages,
              losses, liabilities, and expenses (including reasonable attorneys&apos;
              fees) arising from: (a) your use of the Platform; (b) your violation
              of these Terms; (c) your violation of any third-party rights,
              including SMS messaging regulations; or (d) content you publish
              through the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              12. Termination
            </h2>
            <p>
              Either party may terminate this agreement at any time. You may cancel
              your account through the Platform settings or by contacting support.
              We may suspend or terminate your account if you violate these Terms,
              fail to pay subscription fees, or engage in activity that harms other
              users or the Platform. Upon termination, your right to access the
              Platform ceases immediately. We will retain your data for 90 days
              post-termination, during which you may request an export. After 90
              days, all data is permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              13. Dispute Resolution
            </h2>
            <p>
              Any dispute arising from or relating to these Terms or the Platform
              shall be resolved through binding arbitration administered by the
              American Arbitration Association (AAA) under its Commercial
              Arbitration Rules. Arbitration shall take place in Wilmington,
              Delaware. Each party shall bear its own costs. You agree to waive any
              right to a jury trial or to participate in a class action. Either
              party may seek injunctive relief in a court of competent jurisdiction
              for matters relating to intellectual property or data security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              14. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the
              laws of the State of Delaware, without regard to its conflict of law
              principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              15. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Material
              changes will be communicated via email or a prominent notice on the
              Platform at least 30 days before they take effect. Your continued use
              of the Platform after changes become effective constitutes acceptance
              of the revised Terms. If you do not agree with the changes, you must
              stop using the Platform and cancel your subscription.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              16. Contact
            </h2>
            <p>
              If you have questions about these Terms, please contact us:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <p className="text-[var(--foreground)] font-medium">
                Juke Digital, Inc.
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:legal@jukedigital.com"
                  className="text-[var(--primary)] hover:underline"
                >
                  legal@jukedigital.com
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
