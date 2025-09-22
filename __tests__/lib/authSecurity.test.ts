import {
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  validateToken,
  checkBruteForce,
  recordFailedAttempt,
  resetFailedAttempts,
  isPasswordCompromised,
  generateSessionToken,
  validateSessionToken
} from '../../src/lib/authSecurity';

describe('AuthSecurity', () => {
  describe('validatePasswordStrength', () => {
    it('should accept strong passwords', () => {
      const strongPasswords = [
        'StrongPass123!',
        'MySecure@Pass2024',
        'Complex#Password1',
        'VeryStrong$Pass99'
      ];

      strongPasswords.forEach(password => {
        const result = validatePasswordStrength(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        { password: 'short', expectedError: 'Şifre en az 8 karakter olmalıdır' },
        { password: 'nouppercase123!', expectedError: 'Şifre en az bir büyük harf içermelidir' },
        { password: 'NOLOWERCASE123!', expectedError: 'Şifre en az bir küçük harf içermelidir' },
        { password: 'NoNumbers!', expectedError: 'Şifre en az bir rakam içermelidir' },
        { password: 'NoSpecialChars123', expectedError: 'Şifre en az bir özel karakter içermelidir' },
        { password: '12345678', expectedError: 'Şifre en az bir büyük harf içermelidir' }
      ];

      weakPasswords.forEach(({ password, expectedError }) => {
        const result = validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(expectedError);
      });
    });

    it('should handle empty password', () => {
      const result = validatePasswordStrength('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Şifre en az 8 karakter olmalıdır');
    });

    it('should return multiple errors for very weak passwords', () => {
      const result = validatePasswordStrength('abc');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hash length
    });

    it('should produce different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    it('should handle invalid hash', async () => {
      const password = 'TestPassword123!';
      const invalidHash = 'invalid.hash.here';
      
      await expect(verifyPassword(password, invalidHash)).rejects.toThrow();
    });
  });

  describe('generateSecureToken', () => {
    it('should generate secure token', () => {
      const token = generateSecureToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('validateToken', () => {
    it('should validate correct token format', () => {
      const token = generateSecureToken();
      const isValid = validateToken(token);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid token format', () => {
      const invalidTokens = [
        'short',
        '123456789012345678901234567890123456789012345678901234567890123456789', // too long
        'invalid-token-format',
        '',
        null as any,
        undefined as any
      ];

      invalidTokens.forEach(token => {
        const isValid = validateToken(token);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Brute Force Protection', () => {
    beforeEach(() => {
      // Reset any existing attempts
      resetFailedAttempts('test-ip');
    });

    it('should allow normal login attempts', () => {
      const result = checkBruteForce('test-ip');
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBeGreaterThan(0);
    });

    it('should block after max attempts', () => {
      const ip = 'test-brute-force-ip';
      
      // Record max attempts
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(ip);
      }
      
      const result = checkBruteForce(ip);
      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
      expect(result.lockoutDuration).toBeGreaterThan(0);
    });

    it('should reset failed attempts', () => {
      const ip = 'test-reset-ip';
      
      // Record some attempts
      recordFailedAttempt(ip);
      recordFailedAttempt(ip);
      
      // Reset
      resetFailedAttempts(ip);
      
      const result = checkBruteForce(ip);
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(5);
    });

    it('should handle different IPs independently', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';
      
      // Block first IP
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(ip1);
      }
      
      // Second IP should still be allowed
      const result1 = checkBruteForce(ip1);
      const result2 = checkBruteForce(ip2);
      
      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('isPasswordCompromised', () => {
    it('should detect common weak passwords', () => {
      const weakPasswords = [
        'password',
        '123456',
        'password123',
        'admin',
        'qwerty'
      ];

      weakPasswords.forEach(password => {
        const isCompromised = isPasswordCompromised(password);
        expect(isCompromised).toBe(true);
      });
    });

    it('should allow strong unique passwords', () => {
      const strongPasswords = [
        'MyUniqueStrongPassword123!@#',
        'VerySecurePass2024$%^',
        'ComplexPasswordWithNumbers123!'
      ];

      strongPasswords.forEach(password => {
        const isCompromised = isPasswordCompromised(password);
        expect(isCompromised).toBe(false);
      });
    });

    it('should handle empty password', () => {
      const isCompromised = isPasswordCompromised('');
      expect(isCompromised).toBe(true);
    });
  });

  describe('Session Token Management', () => {
    it('should generate valid session token', () => {
      const userId = 'user123';
      const token = generateSessionToken(userId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(50);
    });

    it('should validate correct session token', () => {
      const userId = 'user123';
      const token = generateSessionToken(userId);
      const validation = validateSessionToken(token);
      
      expect(validation.isValid).toBe(true);
      expect(validation.userId).toBe(userId);
    });

    it('should reject invalid session token', () => {
      const invalidToken = 'invalid.session.token';
      const validation = validateSessionToken(invalidToken);
      
      expect(validation.isValid).toBe(false);
      expect(validation.userId).toBeNull();
    });

    it('should reject expired session token', () => {
      const userId = 'user123';
      const token = generateSessionToken(userId, -1); // Expired token
      const validation = validateSessionToken(token);
      
      expect(validation.isValid).toBe(false);
      expect(validation.userId).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(() => validatePasswordStrength(null as any)).not.toThrow();
      expect(() => validatePasswordStrength(undefined as any)).not.toThrow();
      expect(() => checkBruteForce(null as any)).not.toThrow();
      expect(() => checkBruteForce(undefined as any)).not.toThrow();
    });

    it('should handle very long passwords', () => {
      const longPassword = 'A'.repeat(1000) + '1!';
      const result = validatePasswordStrength(longPassword);
      expect(result.isValid).toBe(true);
    });

    it('should handle special characters in passwords', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const password = `TestPass123${specialChars}`;
      const result = validatePasswordStrength(password);
      expect(result.isValid).toBe(true);
    });

    it('should handle unicode characters', () => {
      const unicodePassword = 'TestPass123!çğıöşüÇĞIÖŞÜ';
      const result = validatePasswordStrength(unicodePassword);
      expect(result.isValid).toBe(true);
    });
  });
});
