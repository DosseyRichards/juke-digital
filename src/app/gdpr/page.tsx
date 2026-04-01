import Link from "next/link";

export default function GDPRPage() {
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
        <h1 className="text-4xl font-bold mb-2">GDPR Compliance</h1>
        <p className="text-[var(--muted)] mb-12">
          Last updated: March 30, 2026
        </p>

        <div className="space-y-10 text-[var(--muted)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              1. Our Commitment to GDPR
            </h2>
            <p>
              Juke Digital is committed to protecting the privacy and rights of
              individuals in the European Economic Area (EEA) and the United
              Kingdom (UK) in accordance with the General Data Protection
              Regulation (GDPR). This page outlines how we comply with GDPR
              requirements and how you can exercise your data protection rights.
              We believe that strong data protection practices benefit all of our
              users, regardless of location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              2. Data Controller Information
            </h2>
            <p>
              For the purposes of the GDPR, the data controller is:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <p className="text-[var(--foreground)] font-medium">
                Juke Digital, Inc.
              </p>
              <p>Registered in Delaware, United States</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:dpo@jukedigital.com"
                  className="text-[var(--primary)] hover:underline"
                >
                  dpo@jukedigital.com
                </a>
              </p>
            </div>
            <p className="mt-4">
              When you use Juke Digital to store and manage your venue&apos;s customer
              data, you act as the data controller for that customer data, and Juke
              Digital acts as the data processor. We process your customers&apos; data
              only according to your instructions and as necessary to provide the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              3. Legal Basis for Processing
            </h2>
            <p className="mb-4">
              We process personal data under the following legal bases:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong className="text-[var(--foreground)]">
                  Performance of a Contract (Article 6(1)(b)):
                </strong>{" "}
                We process your account and payment data as necessary to provide
                the Juke Digital platform and fulfill our contractual obligations
                to you.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">
                  Legitimate Interests (Article 6(1)(f)):
                </strong>{" "}
                We process usage analytics and platform interaction data to improve
                our service, ensure security, and prevent fraud. We have conducted
                a legitimate interest assessment for these activities.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">
                  Consent (Article 6(1)(a)):
                </strong>{" "}
                Where required, we obtain your explicit consent before processing
                data, such as for marketing communications. You may withdraw
                consent at any time.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">
                  Legal Obligation (Article 6(1)(c)):
                </strong>{" "}
                We may process data to comply with legal requirements, such as tax
                and financial reporting obligations.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              4. Your Rights Under GDPR
            </h2>
            <p className="mb-4">
              As an individual in the EEA or UK, you have the following rights
              regarding your personal data:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <h3 className="font-semibold text-[var(--foreground)] mb-1">
                  Right of Access (Article 15)
                </h3>
                <p>
                  You have the right to request a copy of the personal data we hold
                  about you, along with information about how it is processed. We
                  will provide this within 30 days of your request.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <h3 className="font-semibold text-[var(--foreground)] mb-1">
                  Right to Rectification (Article 16)
                </h3>
                <p>
                  You have the right to request that we correct any inaccurate or
                  incomplete personal data. You can also update most information
                  directly through your account settings.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <h3 className="font-semibold text-[var(--foreground)] mb-1">
                  Right to Erasure (Article 17)
                </h3>
                <p>
                  You have the right to request deletion of your personal data when
                  it is no longer necessary for the purpose it was collected, you
                  withdraw consent, or the data has been unlawfully processed.
                  Certain data may be retained if required by law.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <h3 className="font-semibold text-[var(--foreground)] mb-1">
                  Right to Data Portability (Article 20)
                </h3>
                <p>
                  You have the right to receive your personal data in a structured,
                  commonly used, machine-readable format (JSON or CSV). You may
                  also request that we transmit this data directly to another
                  controller where technically feasible.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <h3 className="font-semibold text-[var(--foreground)] mb-1">
                  Right to Restriction of Processing (Article 18)
                </h3>
                <p>
                  You have the right to request that we restrict the processing of
                  your personal data in certain circumstances, such as when you
                  contest the accuracy of the data or object to processing.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <h3 className="font-semibold text-[var(--foreground)] mb-1">
                  Right to Object (Article 21)
                </h3>
                <p>
                  You have the right to object to the processing of your personal
                  data based on legitimate interests or for direct marketing
                  purposes. We will cease processing unless we demonstrate
                  compelling legitimate grounds that override your interests.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              5. Data Protection Officer
            </h2>
            <p>
              Juke Digital has appointed a Data Protection Officer (DPO) to oversee
              our data protection practices and ensure GDPR compliance. You can
              contact our DPO for any questions or concerns regarding how we handle
              your personal data:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <p className="text-[var(--foreground)] font-medium">
                Data Protection Officer
              </p>
              <p>Juke Digital, Inc.</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:dpo@jukedigital.com"
                  className="text-[var(--primary)] hover:underline"
                >
                  dpo@jukedigital.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              6. Cross-Border Data Transfers
            </h2>
            <p>
              Juke Digital is based in the United States. When we transfer personal
              data from the EEA or UK to the US, we ensure appropriate safeguards
              are in place, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong className="text-[var(--foreground)]">
                  Standard Contractual Clauses (SCCs):
                </strong>{" "}
                We use EU-approved Standard Contractual Clauses with our
                sub-processors to ensure data transferred outside the EEA receives
                equivalent protection.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">
                  Data Processing Agreements:
                </strong>{" "}
                We maintain Data Processing Agreements (DPAs) with all
                sub-processors, including Supabase, Stripe, and our SMS delivery
                providers.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">
                  Technical Safeguards:
                </strong>{" "}
                All data is encrypted in transit and at rest. We implement
                access controls, regular security audits, and data minimization
                practices.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              7. Data Breach Notification
            </h2>
            <p>
              In the event of a personal data breach that is likely to result in a
              risk to the rights and freedoms of individuals, we will:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                Notify the relevant supervisory authority within 72 hours of
                becoming aware of the breach, as required by Article 33 of the GDPR
              </li>
              <li>
                Notify affected individuals without undue delay if the breach is
                likely to result in a high risk to their rights and freedoms, as
                required by Article 34
              </li>
              <li>
                Document the breach, its effects, and the remedial actions taken
              </li>
              <li>
                If you are a venue operator using Juke Digital and a breach affects
                your customers&apos; data, we will notify you promptly so you can
                fulfill your own notification obligations as the data controller
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              8. How to Exercise Your Rights
            </h2>
            <p>
              To exercise any of your GDPR rights, please contact our Data
              Protection Officer:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                Email:{" "}
                <a
                  href="mailto:dpo@jukedigital.com"
                  className="text-[var(--primary)] hover:underline"
                >
                  dpo@jukedigital.com
                </a>{" "}
                with the subject line &quot;GDPR Request&quot;
              </li>
              <li>
                Include your full name and the email address associated with your
                account
              </li>
              <li>Specify which right(s) you wish to exercise</li>
              <li>
                We may need to verify your identity before processing your request
              </li>
            </ul>
            <p className="mt-4">
              We will respond to your request within 30 days. In complex cases, we
              may extend this period by an additional 60 days, in which case we
              will inform you of the extension and the reasons for the delay.
            </p>
            <p className="mt-4">
              If you are not satisfied with our response, you have the right to
              lodge a complaint with your local data protection supervisory
              authority.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              9. Contact
            </h2>
            <p>
              For any questions regarding our GDPR compliance, please reach out:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <p className="text-[var(--foreground)] font-medium">
                Data Protection Officer
              </p>
              <p>Juke Digital, Inc.</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:dpo@jukedigital.com"
                  className="text-[var(--primary)] hover:underline"
                >
                  dpo@jukedigital.com
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
