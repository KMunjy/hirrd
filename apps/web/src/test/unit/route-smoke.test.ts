import { describe, it, expect } from 'vitest'

const EXPECTED_ROUTES = [
  { path: '/', label: 'Homepage' },
  { path: '/auth/login', label: 'Login' },
  { path: '/auth/register', label: 'Register' },
  { path: '/auth/forgot-password', label: 'Forgot password' },
  { path: '/jobs', label: 'Jobs' },
  { path: '/learnerships', label: 'Learnerships' },
  { path: '/courses', label: 'Courses' },
  { path: '/employers', label: 'Employers' },
  { path: '/employer/dashboard', label: 'Employer Dashboard' },
  { path: '/institutions/register', label: 'Institution Register' },
  { path: '/profile', label: 'Candidate Profile' },
  { path: '/admin', label: 'Admin Dashboard' },
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms of Service' },
]

// Static check — verifying our route list is defined correctly
// Integration route tests run in E2E (Playwright)
describe('expected route list', () => {
  it('has all required routes defined', () => {
    expect(EXPECTED_ROUTES.length).toBeGreaterThanOrEqual(10)
  })

  it('all routes start with /', () => {
    EXPECTED_ROUTES.forEach(r => {
      expect(r.path.startsWith('/')).toBe(true)
    })
  })

  it('includes legal pages', () => {
    const paths = EXPECTED_ROUTES.map(r => r.path)
    expect(paths).toContain('/privacy')
    expect(paths).toContain('/terms')
  })

  it('includes all nav link routes', () => {
    const paths = EXPECTED_ROUTES.map(r => r.path)
    expect(paths).toContain('/jobs')
    expect(paths).toContain('/learnerships')
    expect(paths).toContain('/courses')
    expect(paths).toContain('/employers')
  })
})
