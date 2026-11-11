import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BuildProfilePage from '@/app/build-profile/page'

const replace = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace, back: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
  usePathname: () => '/',
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  }),
}))

describe('BuildProfilePage', () => {
  it('renders without throwing when useEffect is imported', async () => {
    replace.mockClear()
    render(<BuildProfilePage />)
    expect(await screen.findByRole('heading', { name: 'No CV? No problem.' })).toBeInTheDocument()
    expect(replace).toHaveBeenCalledWith('/auth/login')
  })
})
