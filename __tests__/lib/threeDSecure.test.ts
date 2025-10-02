import { initiate3DSecure, complete3DSecure, get3DSecureSession } from '@/lib/threeDSecure';

describe('3D Secure System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiate3DSecure', () => {
    it('should initiate 3D Secure successfully', () => {
      const result = initiate3DSecure({
        cardToken: 'valid-token',
        amount: 100,
        currency: 'EUR'
      });
      
      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.acsUrl).toBeDefined();
    });

    it('should reject invalid card token', () => {
      const result = initiate3DSecure({
        cardToken: 'invalid-token',
        amount: 100,
        currency: 'EUR'
      });
      
      expect(result.success).toBe(false);
    });

    it('should validate amount', () => {
      const result = initiate3DSecure({
        cardToken: 'valid-token',
        amount: -100,
        currency: 'EUR'
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('complete3DSecure', () => {
    it('should complete 3D Secure successfully', () => {
      // First initiate
      const initResult = initiate3DSecure({
        cardToken: 'valid-token',
        amount: 100,
        currency: 'EUR'
      });
      
      const result = complete3DSecure(initResult.sessionId, 'valid-pares');
      
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
    });

    it('should reject invalid session', () => {
      const result = complete3DSecure('invalid-session', 'pares');
      
      expect(result.success).toBe(false);
    });
  });

  describe('get3DSecureSession', () => {
    it('should return valid session', () => {
      const initResult = initiate3DSecure({
        cardToken: 'valid-token',
        amount: 100,
        currency: 'EUR'
      });
      
      const session = get3DSecureSession(initResult.sessionId);
      
      expect(session).toBeDefined();
      expect(session.amount).toBe(100);
    });

    it('should return null for invalid session', () => {
      const session = get3DSecureSession('invalid-session');
      expect(session).toBeNull();
    });
  });
});
