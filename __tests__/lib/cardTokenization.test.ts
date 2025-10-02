import {
  tokenizeCard,
  getCardFromToken,
  getSecureCardInfo,
  invalidateToken,
  maskCardNumber,
  maskCvv,
  getTokenStats,
  CardData,
} from '@/lib/cardTokenization';

describe('Card Tokenization', () => {
  const mockCardData: CardData = {
    number: '4111111111111111',
    expiryMonth: '12',
    expiryYear: '25',
    cvv: '123',
    name: 'John Doe',
  };

  beforeEach(() => {
    // Clear tokens before each test
    jest.clearAllMocks();
  });

  describe('tokenizeCard', () => {
    it('should tokenize card and return a token', () => {
      const token = tokenizeCard(mockCardData);
      
      expect(token).toBeDefined();
      expect(token).toContain('card_');
      expect(typeof token).toBe('string');
    });

    it('should generate unique tokens for same card', () => {
      const token1 = tokenizeCard(mockCardData);
      const token2 = tokenizeCard(mockCardData);
      
      expect(token1).not.toBe(token2);
    });

    it('should detect Visa card', () => {
      const token = tokenizeCard({
        ...mockCardData,
        number: '4111111111111111',
      });
      
      const secureInfo = getSecureCardInfo(token);
      expect(secureInfo?.brand).toBe('Visa');
    });

    it('should detect MasterCard', () => {
      const token = tokenizeCard({
        ...mockCardData,
        number: '5555555555554444',
      });
      
      const secureInfo = getSecureCardInfo(token);
      expect(secureInfo?.brand).toBe('MasterCard');
    });

    it('should detect American Express', () => {
      const token = tokenizeCard({
        ...mockCardData,
        number: '378282246310005',
      });
      
      const secureInfo = getSecureCardInfo(token);
      expect(secureInfo?.brand).toBe('American Express');
    });

    it('should detect Discover', () => {
      const token = tokenizeCard({
        ...mockCardData,
        number: '6011111111111117',
      });
      
      const secureInfo = getSecureCardInfo(token);
      expect(secureInfo?.brand).toBe('Discover');
    });

    it('should store last four digits', () => {
      const token = tokenizeCard(mockCardData);
      const secureInfo = getSecureCardInfo(token);
      
      expect(secureInfo?.lastFour).toBe('1111');
    });

    it('should store expiry date', () => {
      const token = tokenizeCard(mockCardData);
      const secureInfo = getSecureCardInfo(token);
      
      expect(secureInfo?.expiryMonth).toBe('12');
      expect(secureInfo?.expiryYear).toBe('25');
    });

    it('should set expiration timestamp', () => {
      const before = Date.now();
      const token = tokenizeCard(mockCardData);
      const secureInfo = getSecureCardInfo(token);
      const after = Date.now();
      
      expect(secureInfo?.createdAt).toBeGreaterThanOrEqual(before);
      expect(secureInfo?.createdAt).toBeLessThanOrEqual(after);
      expect(secureInfo?.expiresAt).toBeGreaterThan(secureInfo!.createdAt);
    });
  });

  describe('getCardFromToken', () => {
    it('should return card data for valid token', () => {
      const token = tokenizeCard(mockCardData);
      const cardData = getCardFromToken(token);
      
      expect(cardData).toEqual(mockCardData);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'card_invalid_token_12345';
      const cardData = getCardFromToken(invalidToken);
      
      expect(cardData).toBeNull();
    });

    it('should return null for expired token', () => {
      const token = tokenizeCard(mockCardData);
      
      // Mock Date.now() to expire the token
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 2 * 60 * 60 * 1000); // 2 hours later
      
      const cardData = getCardFromToken(token);
      expect(cardData).toBeNull();
      
      Date.now = originalNow;
    });

    it('should remove expired token from storage', () => {
      const token = tokenizeCard(mockCardData);
      
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 2 * 60 * 60 * 1000);
      
      getCardFromToken(token);
      
      // Try again, should still be null
      const cardData = getCardFromToken(token);
      expect(cardData).toBeNull();
      
      Date.now = originalNow;
    });
  });

  describe('getSecureCardInfo', () => {
    it('should return secure info without full card number', () => {
      const token = tokenizeCard(mockCardData);
      const secureInfo = getSecureCardInfo(token);
      
      expect(secureInfo).toBeDefined();
      expect(secureInfo).not.toHaveProperty('token');
      expect(secureInfo?.lastFour).toBe('1111');
      expect(secureInfo?.brand).toBe('Visa');
    });

    it('should return null for invalid token', () => {
      const secureInfo = getSecureCardInfo('invalid_token');
      expect(secureInfo).toBeNull();
    });

    it('should return null for expired token', () => {
      const token = tokenizeCard(mockCardData);
      
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 2 * 60 * 60 * 1000);
      
      const secureInfo = getSecureCardInfo(token);
      expect(secureInfo).toBeNull();
      
      Date.now = originalNow;
    });

    it('should not expose sensitive data', () => {
      const token = tokenizeCard(mockCardData);
      const secureInfo = getSecureCardInfo(token);
      
      expect(secureInfo).not.toHaveProperty('cvv');
      expect(secureInfo).not.toHaveProperty('number');
      expect(secureInfo).not.toHaveProperty('name');
    });
  });

  describe('invalidateToken', () => {
    it('should invalidate token', () => {
      const token = tokenizeCard(mockCardData);
      
      let cardData = getCardFromToken(token);
      expect(cardData).toEqual(mockCardData);
      
      invalidateToken(token);
      
      cardData = getCardFromToken(token);
      expect(cardData).toBeNull();
    });

    it('should remove secure info after invalidation', () => {
      const token = tokenizeCard(mockCardData);
      
      invalidateToken(token);
      
      const secureInfo = getSecureCardInfo(token);
      expect(secureInfo).toBeNull();
    });
  });

  describe('maskCardNumber', () => {
    it('should mask middle digits', () => {
      const masked = maskCardNumber('4111111111111111');
      
      expect(masked).toContain('4111');
      expect(masked).toContain('1111');
      expect(masked).toContain('*');
      expect(masked).not.toContain('4111111111111111');
    });

    it('should handle card number with spaces', () => {
      const masked = maskCardNumber('4111 1111 1111 1111');
      
      expect(masked).toContain('4111');
      expect(masked).toContain('1111');
      expect(masked).toContain('*');
    });

    it('should return original for short numbers', () => {
      const shortNumber = '1234567';
      const masked = maskCardNumber(shortNumber);
      
      expect(masked).toBe(shortNumber);
    });

    it('should mask 16-digit Visa card correctly', () => {
      const masked = maskCardNumber('4111111111111111');
      const expectedPattern = /^4111 \*{8} 1111$/;
      
      expect(masked).toMatch(expectedPattern);
    });

    it('should mask 15-digit Amex card correctly', () => {
      const masked = maskCardNumber('378282246310005');
      expect(masked).toContain('3782');
      expect(masked).toContain('0005');
    });
  });

  describe('maskCvv', () => {
    it('should mask 3-digit CVV', () => {
      const masked = maskCvv('123');
      expect(masked).toBe('***');
    });

    it('should mask 4-digit CVV', () => {
      const masked = maskCvv('1234');
      expect(masked).toBe('****');
    });

    it('should return correct length', () => {
      expect(maskCvv('123')).toHaveLength(3);
      expect(maskCvv('1234')).toHaveLength(4);
    });

    it('should not expose original CVV', () => {
      const original = '123';
      const masked = maskCvv(original);
      
      expect(masked).not.toContain('1');
      expect(masked).not.toContain('2');
      expect(masked).not.toContain('3');
    });
  });

  describe('getTokenStats', () => {
    it('should return stats for empty store', () => {
      const stats = getTokenStats();
      
      expect(stats.activeTokens).toBeGreaterThanOrEqual(0);
      expect(stats.expiredTokens).toBeGreaterThanOrEqual(0);
      expect(stats.totalTokens).toBeGreaterThanOrEqual(0);
    });

    it('should count active tokens', () => {
      const token1 = tokenizeCard(mockCardData);
      const token2 = tokenizeCard({
        ...mockCardData,
        number: '5555555555554444',
      });
      
      const stats = getTokenStats();
      
      expect(stats.activeTokens).toBeGreaterThanOrEqual(2);
      expect(stats.totalTokens).toBeGreaterThanOrEqual(2);
    });

    it('should count expired tokens', () => {
      const token = tokenizeCard(mockCardData);
      
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 2 * 60 * 60 * 1000);
      
      const stats = getTokenStats();
      
      expect(stats.expiredTokens).toBeGreaterThanOrEqual(1);
      
      Date.now = originalNow;
    });

    it('should have totalTokens = activeTokens + expiredTokens', () => {
      tokenizeCard(mockCardData);
      tokenizeCard({ ...mockCardData, number: '5555555555554444' });
      
      const stats = getTokenStats();
      
      expect(stats.totalTokens).toBe(stats.activeTokens + stats.expiredTokens);
    });
  });

  describe('Token expiration', () => {
    it('should set token to expire in 1 hour', () => {
      const beforeToken = Date.now();
      const token = tokenizeCard(mockCardData);
      const secureInfo = getSecureCardInfo(token);
      
      const expectedExpiry = beforeToken + 60 * 60 * 1000;
      const tolerance = 1000; // 1 second tolerance
      
      expect(secureInfo?.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - tolerance);
      expect(secureInfo?.expiresAt).toBeLessThanOrEqual(expectedExpiry + tolerance);
    });
  });

  describe('Brand detection edge cases', () => {
    it('should return Unknown for invalid card number', () => {
      const token = tokenizeCard({
        ...mockCardData,
        number: '1234567890123456',
      });
      
      const secureInfo = getSecureCardInfo(token);
      expect(secureInfo?.brand).toBe('Unknown');
    });

    it('should detect MasterCard starting with 51', () => {
      const token = tokenizeCard({
        ...mockCardData,
        number: '5105105105105100',
      });
      
      const secureInfo = getSecureCardInfo(token);
      expect(secureInfo?.brand).toBe('MasterCard');
    });

    it('should detect MasterCard starting with 55', () => {
      const token = tokenizeCard({
        ...mockCardData,
        number: '5555555555554444',
      });
      
      const secureInfo = getSecureCardInfo(token);
      expect(secureInfo?.brand).toBe('MasterCard');
    });
  });
});
