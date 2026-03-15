import Link from 'next/link'
import HirrdNav from '@/components/HirrdNav'

export const metadata = { title: 'Terms of Service — Hirrd' }

export default function TermsPage() {
  return (
    <>
      <HirrdNav />
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '40px' }}>Last updated: March 2026 · South African law applies</p>

        {[
          { heading: '1. Agreement', body: 'By using Hirrd, you agree to these Terms. If you do not agree, do not use the platform. These Terms are governed by South African law and any dispute shall be subject to the jurisdiction of South African courts.' },
          { heading: '2. Platform purpose', body: 'Hirrd is a career intelligence platform that connects job seekers with employers and learning institutions in South Africa. We are not a recruitment agency and do not guarantee employment.' },
          { heading: '3. Candidate obligations', body: 'You must: provide accurate information on your profile; not upload false qualifications or fabricate work experience; not use Hirrd to harvest employer data; consent to us sharing your profile with employers you apply to or match with.' },
          { heading: '4. Employer obligations', body: 'Employers must: be a legitimately registered South African business with a valid CIPC registration; post only genuine job opportunities; never charge candidates any fees for applications, interviews, background checks, training, or placement (this is prohibited under BCEA s.66 and constitutes grounds for immediate removal and potential criminal reporting); accurately represent the role, salary, and company.' },
          { heading: '5. Prohibited conduct', body: 'The following are strictly prohibited: scam job listings; collecting candidate data for purposes other than recruitment; impersonating another company or individual; posting illegal content; attempting to circumvent our security or vetting systems; using the platform for money mule recruitment or advance fee fraud.' },
          { heading: '6. Verification', body: 'Hirrd verifies employers on a reasonable-efforts basis but does not guarantee the legitimacy of every employer. Candidates should exercise their own judgement and report suspicious listings using the "Report" button.' },
          { heading: '7. Content', body: 'You retain ownership of content you post. By posting, you grant Hirrd a licence to display that content to relevant users. We may remove content that violates these Terms at any time without notice.' },
          { heading: '8. Limitation of liability', body: 'Hirrd is not liable for: failure to obtain employment; actions of employers or candidates; losses arising from fraudulent listings not yet detected by our vetting system. Our aggregate liability shall not exceed the amount you paid us in the 12 months preceding the claim.' },
          { heading: '9. Termination', body: 'We may suspend or terminate accounts that violate these Terms, with or without notice. You may delete your account at any time via account settings.' },
          { heading: '10. Contact', body: 'For legal matters: legal@hirrd.com. For general support: support@hirrd.com.' },
        ].map(({ heading, body }) => (
          <section key={heading} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>{heading}</h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{body}</p>
          </section>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>← Back to Hirrd</Link>
          <Link href="/privacy" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>Privacy Policy →</Link>
        </div>
      </main>
    </>
  )
}
