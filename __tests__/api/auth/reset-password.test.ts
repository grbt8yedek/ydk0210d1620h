import { POST } from '@/app/api/auth/reset-password/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { validatePasswordStrength } from '@/lib/authSecurity'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn()
    }
  }
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn()
}))

jest.mock('@/lib/authSecurity', () => ({
  validatePasswordStrength: jest.fn()
}))

// Mock console methods
const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('Başarılı Şifre Sıfırlama', () => {
    it('should reset password successfully with valid token', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        resetToken: 'valid-token',
        resetTokenExpiry: new Date(Date.now() + 3600000) // 1 hour from now
      }

      const requestBody = {
        token: 'valid-token',
        password: 'NewPassword123!'
      }

      // Mock password validation
      ;(validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      })

      // Mock user lookup
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser)

      // Mock password hashing
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password')

      // Mock user update
      ;(prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: 'hashed-new-password',
        resetToken: null,
        resetTokenExpiry: null
      })

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.message).toBe('Şifreniz başarıyla güncellendi')

      // Verify password validation was called
      expect(validatePasswordStrength).toHaveBeenCalledWith('NewPassword123!')

      // Verify user lookup
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          resetToken: 'valid-token',
          resetTokenExpiry: {
            gt: expect.any(Date)
          }
        }
      })

      // Verify password hashing
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 12)

      // Verify user update
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: {
          password: 'hashed-new-password',
          resetToken: null,
          resetTokenExpiry: null,
          updatedAt: expect.any(Date)
        }
      })

      // Verify success log
      expect(consoleSpy).toHaveBeenCalledWith('Şifre başarıyla güncellendi:', {
        userId: 'user123',
        email: 'test@example.com'
      })
    })

    it('should use bcrypt with 12 salt rounds', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        resetToken: 'valid-token',
        resetTokenExpiry: new Date(Date.now() + 3600000)
      }

      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password')
      ;(prisma.user.update as jest.Mock).mockResolvedValue(mockUser)

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token',
          password: 'StrongPass123!'
        })
      } as any

      await POST(request)

      expect(bcrypt.hash).toHaveBeenCalledWith('StrongPass123!', 12)
    })

    it('should clear reset token and expiry after successful reset', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        resetToken: 'valid-token',
        resetTokenExpiry: new Date(Date.now() + 3600000)
      }

      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password')
      ;(prisma.user.update as jest.Mock).mockResolvedValue(mockUser)

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token',
          password: 'StrongPass123!'
        })
      } as any

      await POST(request)

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: {
          password: 'hashed-password',
          resetToken: null,
          resetTokenExpiry: null,
          updatedAt: expect.any(Date)
        }
      })
    })
  })

  describe('Validasyon Hataları', () => {
    it('should reject request without token', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({
          password: 'StrongPass123!'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Token ve şifre gereklidir')
    })

    it('should reject request without password', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Token ve şifre gereklidir')
    })

    it('should reject request with empty token', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({
          token: '',
          password: 'StrongPass123!'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Token ve şifre gereklidir')
    })

    it('should reject request with empty password', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token',
          password: ''
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Token ve şifre gereklidir')
    })
  })

  describe('Şifre Güvenlik Kontrolleri', () => {
    it('should reject weak password', async () => {
      ;(validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Şifre en az 8 karakter olmalıdır', 'Şifre en az bir büyük harf içermelidir']
      })

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token',
          password: 'weak'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Şifre güvenlik gereksinimlerini karşılamıyor: Şifre en az 8 karakter olmalıdır, Şifre en az bir büyük harf içermelidir')

      expect(validatePasswordStrength).toHaveBeenCalledWith('weak')
    })

    it('should reject password without uppercase', async () => {
      ;(validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Şifre en az bir büyük harf içermelidir']
      })

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token',
          password: 'password123!'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Şifre en az bir büyük harf içermelidir')
    })

    it('should reject password without special character', async () => {
      ;(validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Şifre en az bir özel karakter içermelidir']
      })

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token',
          password: 'Password123'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Şifre en az bir özel karakter içermelidir')
    })
  })

  describe('Token Doğrulama', () => {
    it('should reject invalid token', async () => {
      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'invalid-token',
          password: 'StrongPass123!'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Geçersiz veya süresi dolmuş token')

      expect(consoleSpy).toHaveBeenCalledWith('Geçersiz veya süresi dolmuş token:', 'invalid-token')
    })

    it('should reject expired token', async () => {
      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null) // Expired token returns null

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'expired-token',
          password: 'StrongPass123!'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Geçersiz veya süresi dolmuş token')

      // Verify query was made with expiry check
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          resetToken: 'expired-token',
          resetTokenExpiry: {
            gt: expect.any(Date)
          }
        }
      })
    })

    it('should verify token expiry time is checked correctly', async () => {
      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'test-token',
          password: 'StrongPass123!'
        })
      } as any

      const beforeTime = new Date()
      await POST(request)
      const afterTime = new Date()

      const call = (prisma.user.findFirst as jest.Mock).mock.calls[0][0]
      const queryTime = call.where.resetTokenExpiry.gt

      expect(queryTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(queryTime.getTime()).toBeLessThanOrEqual(afterTime.getTime())
    })
  })

  describe('Database Hata Durumları', () => {
    it('should handle database error during user lookup', async () => {
      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockRejectedValue(new Error('Database connection failed'))

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token',
          password: 'StrongPass123!'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Şifre güncellenirken hata oluştu')

      expect(consoleErrorSpy).toHaveBeenCalledWith('Reset password error:', expect.any(Error))
    })

    it('should handle database error during password update', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        resetToken: 'valid-token',
        resetTokenExpiry: new Date(Date.now() + 3600000)
      }

      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password')
      ;(prisma.user.update as jest.Mock).mockRejectedValue(new Error('Update failed'))

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token',
          password: 'StrongPass123!'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Şifre güncellenirken hata oluştu')

      expect(consoleErrorSpy).toHaveBeenCalledWith('Reset password error:', expect.any(Error))
    })

    it('should handle bcrypt hashing error', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        resetToken: 'valid-token',
        resetTokenExpiry: new Date(Date.now() + 3600000)
      }

      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing failed'))

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token',
          password: 'StrongPass123!'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Şifre güncellenirken hata oluştu')
    })

    it('should handle JSON parsing error', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Şifre güncellenirken hata oluştu')

      expect(consoleErrorSpy).toHaveBeenCalledWith('Reset password error:', expect.any(Error))
    })
  })

  describe('Güvenlik Kontrolleri', () => {
    it('should not expose user details in error response', async () => {
      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'invalid-token',
          password: 'StrongPass123!'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      // Should not expose whether user exists or not
      expect(responseData.error).toBe('Geçersiz veya süresi dolmuş token')
      expect(JSON.stringify(responseData)).not.toContain('user')
      expect(JSON.stringify(responseData)).not.toContain('email')
      expect(JSON.stringify(responseData)).not.toContain('id')
    })

    it('should log token for security monitoring', async () => {
      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'suspicious-token',
          password: 'StrongPass123!'
        })
      } as any

      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith('Geçersiz veya süresi dolmuş token:', 'suspicious-token')
    })

    it('should log successful password reset for audit', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        resetToken: 'valid-token',
        resetTokenExpiry: new Date(Date.now() + 3600000)
      }

      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password')
      ;(prisma.user.update as jest.Mock).mockResolvedValue(mockUser)

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token',
          password: 'StrongPass123!'
        })
      } as any

      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith('Şifre başarıyla güncellendi:', {
        userId: 'user123',
        email: 'test@example.com'
      })
    })

    it('should log reset request for monitoring', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'test-token',
          password: 'StrongPass123!'
        })
      } as any

      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)

      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith('Şifre sıfırlama isteği:', { token: 'var' })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null token in request body', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({
          token: null,
          password: 'StrongPass123!'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Token ve şifre gereklidir')
    })

    it('should handle null password in request body', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token',
          password: null
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Token ve şifre gereklidir')
    })

    it('should handle undefined values in request body', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({
          token: undefined,
          password: undefined
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Token ve şifre gereklidir')
    })

    it('should handle very long password', async () => {
      const longPassword = 'A'.repeat(1000) + '1!'
      
      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })

      const request = {
        json: jest.fn().mockResolvedValue({
          token: 'valid-token',
          password: longPassword
        })
      } as any

      await POST(request)

      expect(validatePasswordStrength).toHaveBeenCalledWith(longPassword)
    })

    it('should handle very long token', async () => {
      const longToken = 'x'.repeat(1000)
      
      ;(validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] })
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)

      const request = {
        json: jest.fn().mockResolvedValue({
          token: longToken,
          password: 'StrongPass123!'
        })
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Geçersiz veya süresi dolmuş token')

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          resetToken: longToken,
          resetTokenExpiry: {
            gt: expect.any(Date)
          }
        }
      })
    })
  })
})