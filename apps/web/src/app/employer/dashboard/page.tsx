export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HirrdNav from '@/components/HirrdNav'
import Link from 'next/link'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; description: string }> = {
  new: {
    label: 'Under review',
    color: 'var(--warning)',
    bg: 'var(--warning-light)',
    description: 'Your application is being reviewed by our team. This typically takes 1–2 business days.',
  },
  contacted: {
    label: 'In progress',
    color: 'var(--primary)',
    bg: 'rgba(124,88,232,0.08)',
    description: 'Our team has reviewed your application and may be in touch with additional questions.',
  },
  converted: {
    label: '✓ Verified',
    color: 'var(--success)',
    bg: 'var(--success-light)',
    description: 'Your employer account is verified. You can now post jobs and access SA candidates.',
  },
  rejected: {
    label: 'Not approved',
    color: 'var(--error)',
    bg: 'var(--error-light)',
    description: 'Your application was not approved at this time. Please contact employers@hirrd.com for more information.',
  },
}

export default async function EmployerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/employer/dashboard')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Look up employer lead by email
  const { data: lead } = await supabase
    .from('employer_leads')
    .select('*')
    .eq('work_email', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const statusKey = lead?.status || 'new'
  const statusInfo = STATUS_CONFIG[statusKey] || STATUS_CONFIG.new

  const sectionLabel: React.CSSProperties = {
    fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)',
    letterSpacing: '0.1em', marginBottom: '12px',
  }

  return (
    <>
      <HirrdNav user={user} profile={profile} />
      <main id="main-content" style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Employer Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {lead?.company_name || 'Your company'} · {user.email}
          </p>
        </div>

        {/* Status card */}
        <div style={{
          background: statusInfo.bg,
          border: `1px solid ${statusInfo.color}30`,
          borderLeft: `4px solid ${statusInfo.color}`,
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: statusInfo.color, marginBottom: '8px' }}>
            ACCOUNT STATUS
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: statusInfo.color, marginBottom: '8px' }}>
            {statusInfo.label}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {statusInfo.description}
          </p>
        </div>

        {/* Application details */}
        {lead && (
          <div style={{
            background: 'var(--glass-2)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '24px', marginBottom: '24px',
          }}>
            <div style={sectionLabel}>APPLICATION DETAILS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Company', value: lead.company_name },
                { label: 'Industry', value: lead.industry || 'Not specified' },
                { label: 'Company size', value: lead.company_size || 'Not specified' },
                { label: 'CIPC number', value: lead.cipc_number || 'Not provided' },
                { label: 'Website', value: lead.website || 'Not provided' },
                { label: 'Applied', value: new Date(lead.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next steps */}
        <div style={{
          background: 'var(--glass-2)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '24px', marginBottom: '24px',
        }}>
          <div style={sectionLabel}>NEXT STEPS</div>
          {statusKey === 'converted' ? (
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                Your account is fully verified. Job posting is coming soon — you'll receive an email when it launches.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/" style={{
                  padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  background: 'var(--gradient-primary)', color: 'white', textDecoration: 'none',
                }}>Browse the platform →</Link>
              </div>
            </div>
          ) : statusKey === 'rejected' ? (
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Please email <a href="mailto:employers@hirrd.com" style={{ color: 'var(--primary)' }}>employers@hirrd.com</a> for more information or to submit additional documentation.
            </p>
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.6 }}>
                While your application is being reviewed:
              </p>
              <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 2 }}>
                <li>Ensure your CIPC registration is valid and up to date</li>
                <li>Have your company domain email ready (company.co.za)</li>
                <li>Prepare a description of the roles you plan to advertise</li>
              </ul>
            </div>
          )}
        </div>

        {!lead && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>No application found</div>
            <p style={{ marginBottom: '20px' }}>Register your company to start posting jobs on Hirrd.</p>
            <Link href="/employers" style={{
              padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
              background: 'var(--gradient-primary)', color: 'white', textDecoration: 'none',
            }}>Register as employer →</Link>
          </div>
        )}

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '32px' }}>
          Questions? Email <a href="mailto:employers@hirrd.com" style={{ color: 'var(--primary)' }}>employers@hirrd.com</a>
        </p>
      </main>
    </>
  )
}
