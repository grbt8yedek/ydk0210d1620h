import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

// Mock session
const mockSession = {
  user: {
    email: 'test@example.com',
    name: 'Test User',
    id: 'test-user-id',
  },
  expires: '2024-12-31',
}

// Custom render with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: any
}

export function renderWithProviders(
  ui: ReactElement,
  { session = mockSession, ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        {children}
      </SessionProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything
export * from '@testing-library/react'
export { renderWithProviders as render }

