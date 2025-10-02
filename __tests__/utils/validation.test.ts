import { userSchema, reservationSchema, paymentSchema, validate } from '@/utils/validation'

describe('User Schema Validation', () => {
  describe('✅ Register Schema', () => {
    it('should validate correct registration data', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }

      const result = await validate(userSchema.register, validData)
      expect(result).toEqual(validData)
    })

    it('should reject short name', async () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }

      await expect(validate(userSchema.register, invalidData)).rejects.toThrow()
    })

    it('should reject invalid email', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123',
        confirmPassword: 'Password123',
      }

      await expect(validate(userSchema.register, invalidData)).rejects.toThrow()
    })

    it('should reject short password', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Pass1',
        confirmPassword: 'Pass1',
      }

      await expect(validate(userSchema.register, invalidData)).rejects.toThrow(/8 karakter/)
    })

    it('should reject password without uppercase letter', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      }

      await expect(validate(userSchema.register, invalidData)).rejects.toThrow(/büyük harf/)
    })

    it('should reject password without lowercase letter', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'PASSWORD123',
        confirmPassword: 'PASSWORD123',
      }

      await expect(validate(userSchema.register, invalidData)).rejects.toThrow(/küçük harf/)
    })

    it('should reject password without number', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password',
        confirmPassword: 'Password',
      }

      await expect(validate(userSchema.register, invalidData)).rejects.toThrow(/rakam/)
    })

    it('should reject mismatched passwords', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      }

      await expect(validate(userSchema.register, invalidData)).rejects.toThrow(/eşleşmiyor/)
    })
  })

  describe('✅ Login Schema', () => {
    it('should validate correct login data', async () => {
      const validData = {
        email: 'john@example.com',
        password: 'anypassword',
      }

      const result = await validate(userSchema.login, validData)
      expect(result).toEqual(validData)
    })

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password',
      }

      await expect(validate(userSchema.login, invalidData)).rejects.toThrow()
    })

    it('should reject empty password', async () => {
      const invalidData = {
        email: 'john@example.com',
        password: '',
      }

      await expect(validate(userSchema.login, invalidData)).rejects.toThrow()
    })
  })

  describe('✅ Update Schema', () => {
    it('should validate optional fields', async () => {
      const validData = {
        name: 'John Updated',
      }

      const result = await validate(userSchema.update, validData)
      expect(result.name).toBe('John Updated')
    })

    it('should validate password change', async () => {
      const validData = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123',
      }

      const result = await validate(userSchema.update, validData)
      expect(result).toEqual(validData)
    })

    it('should reject mismatched new passwords', async () => {
      const invalidData = {
        newPassword: 'NewPassword123',
        confirmNewPassword: 'DifferentPassword123',
      }

      await expect(validate(userSchema.update, invalidData)).rejects.toThrow()
    })
  })
})

describe('Reservation Schema Validation', () => {
  describe('✅ Create Reservation', () => {
    it('should validate flight reservation', async () => {
      const validData = {
        type: 'flight' as const,
        amount: 1000,
        currency: 'TRY',
        details: {
          passengers: [
            {
              name: 'John',
              surname: 'Doe',
              birthDate: '1990-01-01',
              idNumber: '12345678901',
            },
          ],
          dates: {
            start: '2024-06-01',
            end: '2024-06-10',
          },
          location: {
            from: 'IST',
            to: 'AMS',
          },
        },
      }

      const result = await validate(reservationSchema.create, validData)
      expect(result.type).toBe('flight')
    })

    it('should reject invalid reservation type', async () => {
      const invalidData = {
        type: 'invalid-type',
        amount: 1000,
        currency: 'TRY',
        details: {},
      }

      await expect(validate(reservationSchema.create, invalidData)).rejects.toThrow()
    })

    it('should reject negative amount', async () => {
      const invalidData = {
        type: 'flight',
        amount: -100,
        currency: 'TRY',
        details: {},
      }

      await expect(validate(reservationSchema.create, invalidData)).rejects.toThrow(/pozitif/)
    })

    it('should reject invalid currency code', async () => {
      const invalidData = {
        type: 'flight',
        amount: 1000,
        currency: 'INVALID',
        details: {},
      }

      await expect(validate(reservationSchema.create, invalidData)).rejects.toThrow()
    })

    it('should validate different reservation types', async () => {
      const types = ['flight', 'hotel', 'car', 'esim'] as const

      for (const type of types) {
        const validData = {
          type,
          amount: 500,
          currency: 'USD',
          details: {},
        }

        const result = await validate(reservationSchema.create, validData)
        expect(result.type).toBe(type)
      }
    })
  })

  describe('✅ Update Reservation', () => {
    it('should validate status update', async () => {
      const validData = {
        status: 'confirmed' as const,
      }

      const result = await validate(reservationSchema.update, validData)
      expect(result.status).toBe('confirmed')
    })

    it('should validate all status types', async () => {
      const statuses = ['pending', 'confirmed', 'cancelled'] as const

      for (const status of statuses) {
        const validData = { status }
        const result = await validate(reservationSchema.update, validData)
        expect(result.status).toBe(status)
      }
    })
  })
})

describe('Payment Schema Validation', () => {
  describe('✅ Create Payment', () => {
    it('should validate card payment', async () => {
      const validData = {
        reservationId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 1000,
        currency: 'TRY',
        provider: 'stripe' as const,
        paymentMethod: {
          type: 'card' as const,
          details: {
            cardNumber: '4242424242424242',
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '123',
            holderName: 'JOHN DOE',
          },
        },
      }

      const result = await validate(paymentSchema.create, validData)
      expect(result.provider).toBe('stripe')
    })

    it('should reject invalid UUID for reservation ID', async () => {
      const invalidData = {
        reservationId: 'not-a-uuid',
        amount: 1000,
        currency: 'TRY',
        provider: 'stripe',
        paymentMethod: {
          type: 'card',
        },
      }

      await expect(validate(paymentSchema.create, invalidData)).rejects.toThrow()
    })

    it('should validate both payment providers', async () => {
      const providers = ['stripe', 'paypal'] as const

      for (const provider of providers) {
        const validData = {
          reservationId: '123e4567-e89b-12d3-a456-426614174000',
          amount: 500,
          currency: 'USD',
          provider,
          paymentMethod: {
            type: 'card' as const,
          },
        }

        const result = await validate(paymentSchema.create, validData)
        expect(result.provider).toBe(provider)
      }
    })

    it('should validate bank transfer payment method', async () => {
      const validData = {
        reservationId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 1000,
        currency: 'TRY',
        provider: 'stripe' as const,
        paymentMethod: {
          type: 'bank_transfer' as const,
        },
      }

      const result = await validate(paymentSchema.create, validData)
      expect(result.paymentMethod.type).toBe('bank_transfer')
    })
  })
})

describe('Validate Function', () => {
  it('should return validated data on success', async () => {
    const schema = userSchema.login
    const validData = {
      email: 'test@example.com',
      password: 'password',
    }

    const result = await validate(schema, validData)
    expect(result).toEqual(validData)
  })

  it('should throw on validation error', async () => {
    const schema = userSchema.login
    const invalidData = {
      email: 'invalid-email',
      password: '',
    }

    await expect(validate(schema, invalidData)).rejects.toThrow()
  })
})

