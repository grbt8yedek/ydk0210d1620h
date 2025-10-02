import { authOptions } from '@/lib/auth';

describe('NextAuth Configuration', () => {
  it('should have correct providers', () => {
    expect(authOptions.providers).toBeDefined();
    expect(authOptions.providers.length).toBeGreaterThan(0);
  });

  it('should have JWT configuration', () => {
    expect(authOptions.jwt).toBeDefined();
  });

  it('should have session configuration', () => {
    expect(authOptions.session).toBeDefined();
    expect(authOptions.session.strategy).toBe('jwt');
  });

  it('should have callbacks defined', () => {
    expect(authOptions.callbacks).toBeDefined();
    expect(authOptions.callbacks.jwt).toBeDefined();
    expect(authOptions.callbacks.session).toBeDefined();
  });

  it('should handle JWT callback', async () => {
    const mockToken = { sub: '1', email: 'test@test.com' };
    const mockUser = { id: '1', email: 'test@test.com', isAdmin: false };
    
    if (authOptions.callbacks?.jwt) {
      const result = await authOptions.callbacks.jwt({
        token: mockToken,
        user: mockUser
      });
      
      expect(result).toBeDefined();
    }
  });

  it('should handle session callback', async () => {
    const mockSession = { user: {} };
    const mockToken = { sub: '1', email: 'test@test.com', isAdmin: false };
    
    if (authOptions.callbacks?.session) {
      const result = await authOptions.callbacks.session({
        session: mockSession,
        token: mockToken
      });
      
      expect(result).toBeDefined();
    }
  });
});
