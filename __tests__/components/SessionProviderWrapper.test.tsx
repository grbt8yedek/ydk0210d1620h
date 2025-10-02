import { render, screen } from '@testing-library/react';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="session-provider">{children}</div>
}));

describe('SessionProviderWrapper', () => {
  it('should render children inside SessionProvider', () => {
    render(
      <SessionProviderWrapper>
        <div>Test Child</div>
      </SessionProviderWrapper>
    );
    
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should pass through multiple children', () => {
    render(
      <SessionProviderWrapper>
        <div>Child 1</div>
        <div>Child 2</div>
      </SessionProviderWrapper>
    );
    
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});

