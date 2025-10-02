import { userSchema, reservationSchema, paymentSchema, validate } from '@/lib/schemas';

describe('Validation Schemas', () => {
  describe('userSchema.register', () => {
    it('should validate correct user data', async () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };
      
      const result = await validate(userSchema.register, validUser);
      expect(result.name).toBe('John Doe');
    });

    it('should reject invalid email', async () => {
      const invalidUser = {
        name: 'John',
        email: 'invalid-email',
        password: 'Password123',
        confirmPassword: 'Password123'
      };
      
      await expect(validate(userSchema.register, invalidUser)).rejects.toThrow();
    });

    it('should reject weak password', async () => {
      const invalidUser = {
        name: 'John',
        email: 'john@example.com',
        password: 'weak',
        confirmPassword: 'weak'
      };
      
      await expect(validate(userSchema.register, invalidUser)).rejects.toThrow();
    });

    it('should reject mismatched passwords', async () => {
      const invalidUser = {
        name: 'John',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Different123'
      };
      
      await expect(validate(userSchema.register, invalidUser)).rejects.toThrow();
    });
  });

  describe('reservationSchema.create', () => {
    it('should validate reservation data', async () => {
      const validReservation = {
        type: 'flight',
        amount: 150,
        currency: 'EUR',
        details: {
          passengers: [{
            name: 'John',
            surname: 'Doe',
            birthDate: '1990-01-01',
            idNumber: '12345678901'
          }]
        }
      };
      
      const result = await validate(reservationSchema.create, validReservation);
      expect(result.type).toBe('flight');
    });

    it('should reject negative amount', async () => {
      const invalidReservation = {
        type: 'flight',
        amount: -100,
        currency: 'EUR',
        details: {}
      };
      
      await expect(validate(reservationSchema.create, invalidReservation)).rejects.toThrow();
    });
  });

  describe('paymentSchema.create', () => {
    it('should validate payment data', async () => {
      const validPayment = {
        reservationId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100,
        currency: 'EUR',
        provider: 'stripe',
        paymentMethod: {
          type: 'card',
          details: {}
        }
      };
      
      const result = await validate(paymentSchema.create, validPayment);
      expect(result.provider).toBe('stripe');
    });
  });
});
