'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import HirrdLogo from '@/components/HirrdLogo'
import Link from 'next/link'

// Exp 3: School-leaver build profile flow — 2.2× completion vs CV upload
// No CV needed. Steps: education → subjects → skills → sector → location

const SECTORS = [
  { id: 'finance', label: 'Finance & Banking', emoji: '🏦' },
  { id: 'tech', label: 'Technology & IT', emoji: '💻' },
  { id: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { id: 'retail', label: 'Retail & Sales', emoji: '🛒' },
  { id: 'construction', label: 'Construction & Trades', emoji: '🔨' },
  { id: 'education', label: 'Education & Training', emoji: '📚' },
  { id: 'government', label: 'Government & Public Sector', emoji: '🏛️' },
  { id: 'logistics', label: 'Logistics & Transport', emoji: '🚛' },
  { id: 'mining', label: 'Mining & Energy', emoji: '⛏️' },
  { id: 'hospitality', label: 'Hospitality & Tourism', emoji: '🏨' },
]

const SUBJECTS = [
  'Mathematics', 'Mathematical Literacy', 'English', 'Afrikaans', 'Zulu', 'Xhosa',
  'Physical Sciences', 'Life Sciences', 'Accounting', 'Business Studies',
  'Economics', 'Geography', 'History', 'Computer Applications Technology',
  'Information Technology', 'Life Orientation',
]

const SKILLS = [
  'Microsoft Word', 'Microsoft Excel', 'Email', 'Internet', 'Social Media',
  'Customer Service', 'Communication', 'Teamwork', 'Problem Solving',
  'Driving Licence', 'Cash Handling', 'Data Entry', 'Typing',
  'Leadership', 'Time Management', 'Languages (other)',
]

const PROVINCES = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
  'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape',
]

type Step = 'education' | 'subjects' | 'skills' | 'sector' | 'location' | 'done'

export default function BuildProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('education')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [education, setEducation] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [hasSmartphone, setHasSmartphone] = useState(true)

  const steps: Step[] = ['education', 'subjects', 'skills', 'sector', 'location']
  const stepNum = steps.indexOf(step) + 1
  const totalSteps = steps.length

  function toggle<T>(arr: T[], val: T, setter: (a: T[]) => void) {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Not logged in — send to register first
        router.push('/auth/register?redirect=/build-profile')
        return
      }

      // Build skills array from subjects + skills
      const allSkills = [...selectedSkills]
      if (selectedSubjects.includes('Mathematics')) allSkills.push('Mathematics', 'Numeracy')
      if (selectedSubjects.includes('Computer Applications Technology')) allSkills.push('Microsoft Office', 'Computer Skills')
      if (selectedSubjects.includes('Information Technology')) allSkills.push('Programming', 'Computer Skills')
      if (selectedSubjects.includes('Accounting')) allSkills.push('Accounting', 'Bookkeeping')

      // Upsert candidate record
      const { error: upsertErr } = await supabase.from('candidates').upsert({
        profile_id: user.id,
        education: [{ qualification: education, institution: 'School' }],
        skills: [...new Set(allSkills)],
        desired_roles: selectedSectors.map(s => SECTORS.find(x => x.id === s)?.label || s),
        cv_status: 'profile_built',
        headline: `${education} learner seeking ${selectedSectors.map(s => SECTORS.find(x => x.id === s)?.label).join(' / ')} opportunity`,
        summary: `I am a motivated ${education} learner based in ${city || province}, SA. I am interested in ${selectedSectors.map(s => SECTORS.find(x => x.id === s)?.label).join(' and ')} and ready to start my career.`,
      }, { onConflict: 'profile_id' })

      if (upsertErr) throw upsertErr

      // Update profile location
      await supabase.from('profiles').update({
        city: city || undefined,
        province: province || undefined,
      }).eq('id', user.id)

      setStep('done')
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid rgba(124,88,232,0.2)', background: 'var(--bg-base)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', border: active ? '2px solid var(--primary)' : '1px solid rgba(124,88,232,0.2)',
    background: active ? 'rgba(124,88,232,0.1)' : 'var(--bg-card)',
    color: active ? 'var(--primary)' : 'var(--text-secondary)',
    transition: 'all 0.15s', userSelect: 'none' as const,
  })

  if (step === 'done') return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '40px', maxWidth: '440px', textAlign: 'center', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Your profile is live!</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
          Hirrd is now matching you to SA learnerships and entry-level opportunities. Check your matches now.
        </p>
        <Link href="/dashboard" style={{ display: 'block', padding: '13px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, textDecoration: 'none', fontSize: '15px' }}>
          See my matches →
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', padding: '24px 16px' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <HirrdLogo size="sm" />
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Step {stepNum} of {totalSteps}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {Math.round(stepNum / totalSteps * 100)}% complete
            </span>
          </div>
          <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${stepNum / totalSteps * 100}%`, background: 'var(--gradient-primary)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(124,88,232,0.08)' }}>

          {/* Step 1: Education */}
          {step === 'education' && (
            <>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                No CV? No problem.
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                Answer 5 quick questions and Hirrd will match you to SA learnerships and entry-level jobs. Takes 5 minutes.
              </p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                What is your highest education level?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {[
                  { val: 'Grade 10 (completed)', label: 'Grade 10 (completed)' },
                  { val: 'Grade 11 (completed)', label: 'Grade 11 (completed)' },
                  { val: 'Grade 12 (Matric)', label: 'Grade 12 / Matric' },
                  { val: 'Matric with endorsement', label: 'Matric with university exemption' },
                  { val: 'Diploma / Certificate', label: 'Diploma or Certificate' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setEducation(val)}
                    style={{
                      ...chipStyle(education === val),
                      textAlign: 'left', width: '100%', padding: '12px 16px',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 2: Subjects */}
          {step === 'subjects' && (
            <>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Which subjects did you study?
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Select all that apply</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {SUBJECTS.map(s => (
                  <button key={s} onClick={() => toggle(selectedSubjects, s, setSelectedSubjects)} style={chipStyle(selectedSubjects.includes(s))}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 3: Skills */}
          {step === 'skills' && (
            <>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                What skills do you have?
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Select all that apply — be honest, employers value potential</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {SKILLS.map(s => (
                  <button key={s} onClick={() => toggle(selectedSkills, s, setSelectedSkills)} style={chipStyle(selectedSkills.includes(s))}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 4: Sector */}
          {step === 'sector' && (
            <>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                What interests you?
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Pick up to 3 sectors — we'll find learnerships that match</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
                {SECTORS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (selectedSectors.includes(s.id)) {
                        toggle(selectedSectors, s.id, setSelectedSectors)
                      } else if (selectedSectors.length < 3) {
                        toggle(selectedSectors, s.id, setSelectedSectors)
                      }
                    }}
                    style={{
                      ...chipStyle(selectedSectors.includes(s.id)),
                      padding: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      opacity: !selectedSectors.includes(s.id) && selectedSectors.length >= 3 ? 0.4 : 1,
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{s.emoji}</span>
                    <span style={{ fontSize: '11px', lineHeight: 1.3 }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 5: Location */}
          {step === 'location' && (
            <>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Where are you based?
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>We match you to opportunities near you first</p>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', letterSpacing: '0.06em' }}>PROVINCE</label>
                <select value={province} onChange={e => setProvince(e.target.value)} style={inputStyle}>
                  <option value="">Select province</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', letterSpacing: '0.06em' }}>CITY / TOWN</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Johannesburg, Soweto, Durban" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
                <input type="checkbox" id="smartphone" checked={hasSmartphone} onChange={e => setHasSmartphone(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                <label htmlFor="smartphone" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  I have a smartphone with WhatsApp — send me job alerts there
                </label>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: 'var(--error-light)', border: '1px solid rgba(192,80,74,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--error)' }}>
              {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            {step !== 'education' && (
              <button
                onClick={() => setStep(steps[steps.indexOf(step) - 1])}
                style={{ padding: '11px 20px', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-base)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === 'location') {
                  handleSubmit()
                } else {
                  const nextStep = steps[steps.indexOf(step) + 1]
                  if (nextStep) setStep(nextStep)
                }
              }}
              disabled={
                (step === 'education' && !education) ||
                (step === 'sector' && selectedSectors.length === 0) ||
                loading
              }
              style={{
                flex: 1, padding: '13px', borderRadius: '10px',
                background: 'var(--gradient-primary)', color: 'white', border: 'none',
                fontWeight: 600, fontSize: '15px',
                cursor: ((step === 'education' && !education) || (step === 'sector' && selectedSectors.length === 0) || loading) ? 'default' : 'pointer',
                opacity: ((step === 'education' && !education) || (step === 'sector' && selectedSectors.length === 0) || loading) ? 0.6 : 1,
              }}
            >
              {loading ? 'Building your profile…' : step === 'location' ? 'Find my matches →' : 'Next →'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Already have a CV? <Link href="/dashboard" style={{ color: 'var(--primary)', fontWeight: 600 }}>Upload it here →</Link>
        </p>
      </div>
    </div>
  )
}
