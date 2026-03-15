import Link from 'next/link'
import HirrdNav from '@/components/HirrdNav'

export const metadata = { title: 'Privacy Policy — Hirrd' }

export default function PrivacyPage() {
  return (
    <>
      <HirrdNav />
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '40px' }}>Last updated: March 2026 · Applies to South Africa</p>

        {[
          { heading: '1. Who we are', body: 'Hirrd is operated by Hirrd (Pty) Ltd, a South African company. We provide an AI-powered career intelligence platform connecting candidates with employers. For privacy queries, contact us at privacy@hirrd.com.' },
          { heading: '2. What law applies', body: 'Your personal information is processed in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA). We are committed to being a responsible party as defined in that Act.' },
          { heading: '3. Information we collect', body: 'For candidates: name, email, phone, location, CV content, work history, skills, and qualifications. For employers: company name, CIPC registration number, contact person details, and job posting content. For all users: device data, IP address, and usage logs for security and fraud prevention.' },
          { heading: '4. Why we collect it', body: 'We collect this information to: create and manage your account (performance of contract); match candidates with relevant opportunities (performance of contract); verify employer legitimacy and protect candidates from fraud (legitimate interest); send you service communications (performance of contract); send you marketing updates only with your explicit consent.' },
          { heading: '5. How long we keep it', body: 'Active account data: retained for the duration of your account plus 5 years. Employer vetting records: 5 years after account closure. Fraud and rejection records: 7 years. Marketing consent records: 3 years from withdrawal. You may request deletion at any time (see Section 7).' },
          { heading: '6. Who we share it with', body: 'We do not sell your data. We share data only with: Supabase (database hosting, processed in US with adequate safeguards), Anthropic (CV text sent for AI analysis — no PII shared beyond what you provide in your CV), payment processors (if applicable), and law enforcement when required by SA law.' },
          { heading: '7. Your rights under POPIA', body: 'You have the right to: access your personal information; correct inaccurate information; request deletion (subject to legal retention obligations); object to processing based on legitimate interest; withdraw marketing consent at any time. To exercise any right, email privacy@hirrd.com. We will respond within 30 days.' },
          { heading: '8. Complaints', body: 'If you believe we have violated POPIA, you may lodge a complaint with the Information Regulator of South Africa at www.inforegulator.org.za or complaints.IR@justice.gov.za.' },
          { heading: '9. Security', body: 'We implement industry-standard security including TLS encryption, Row Level Security in our database, and regular access reviews. No system is perfectly secure — if you discover a vulnerability, contact security@hirrd.com.' },
          { heading: '10. Changes to this policy', body: 'We will notify registered users by email of material changes to this policy at least 14 days before they take effect.' },
        ].map(({ heading, body }) => (
          <section key={heading} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>{heading}</h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{body}</p>
          </section>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>← Back to Hirrd</Link>
          <Link href="/terms" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>Terms of Service →</Link>
        </div>
      </main>
    </>
  )
}
