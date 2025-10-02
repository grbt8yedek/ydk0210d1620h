import { POST } from '@/app/api/auth/login/route'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { createBruteForceProtection, resetLoginAttempts } from '@/lib/authSecurity'
import { isValidCSRFToken } from '@/lib/csrfProtection'
import { createMockUser } from '@/__tests__/helpers/mockData'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))
jest.mock('@/lib/authSecurity')
jest.mock('@/lib/csrfProtection')
jest.mock('bcryptjs')

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockIsValidCSRFToken = isValidCSRFToken as jest.MockedFunction<typeof isValidCSRFToken>
const mockCreateBruteForceProtection = createBruteForceProtection as jest.MockedFunction<typeof createBruteForceProtection>
const mockResetLoginAttempts = resetLoginAttempts as jest.MockedFunction<typeof resetLoginAttempts>

describe('POST /api/auth/login', () => {
  const validCSRFToken = 'valid-csrf-token'
  const mockUser = createMockUser()

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mocks
    mockIsValidCSRFToken.mockResolvedValue(true)
    mockCreateBruteForceProtection.mockReturnValue(
      jest.fn().mockResolvedValue({ status: 200 })
    )
  })

  describe('✅ Başarılı Giriş', () => {
    it('should login successfully with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-csrf-token': validCSRFToken,
        },
        body: JSON.stringify({
          email: mockUser.email,
          password: 'password123',
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(mockUser.email)
      expect(data.user.id).toBe(mockUser.id)
      expect(mockResetLoginAttempts).toHaveBeenCalled()
    })

    it('should return user details on successful login', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-csrf-token': validCSRFToken,
        },
        body: JSON.stringify({
          email: mockUser.email,
          password: 'password123',
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(data.user.firstName).toBe(mockUser.firstName)
      expect(data.user.lastName).toBe(mockUser.lastName)
      expect(data.user.phone).toBe(mockUser.phone)
      expect(data.user.password).toBeUndefined() // Şifre dönmemeli!
    })

    it('should reset brute force counter on successful login', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-csrf-token': validCSRFToken,
        },
        body: JSON.stringify({
          email: mockUser.email,
          password: 'password123',
        }),
      })

      await POST(request as any)

      expect(mockResetLoginAttempts).toHaveBeenCalled()
    })
  })

  describe('❌ Başarısız Giriş', () => {
    it('should return error for invalid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-csrf-token': validCSRFToken,
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Geçersiz')
    })

    it('should return error for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(false as never)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-csrf-token': validCSRFToken,
        },
        body: JSON.stringify({
          email: mockUser.email,
          password: 'wrongpassword',
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Geçersiz')
    })

    it('should not reveal whether email exists (security)', async () => {
      // Test 1: Olmayan email
      mockPrisma.user.findUnique.mockResolvedValue(null)
      const request1 = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'x-csrf-token': validCSRFToken },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      })
      const response1 = await POST(request1 as any)
      const data1 = await response1.json()

      // Test 2: Var olan email ama yanlış şifre
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(false as never)
      const request2 = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'x-csrf-token': validCSRFToken },
        body: JSON.stringify({
          email: mockUser.email,
          password: 'wrongpassword',
        }),
      })
      const response2 = await POST(request2 as any)
      const data2 = await response2.json()

      // Her iki durumda da aynı mesaj
      expect(data1.message).toBe(data2.message)
    })
  })

  describe('🔒 Güvenlik Testleri', () => {
    it('should reject request without CSRF token', async () => {
      mockIsValidCSRFToken.mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: mockUser.email,
          password: 'password123',
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.message).toContain('CSRF')
    })

    it('should reject request with invalid CSRF token', async () => {
      mockIsValidCSRFToken.mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'invalid-token',
        },
        body: JSON.stringify({
          email: mockUser.email,
          password: 'password123',
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })

    it('should enforce brute force protection', async () => {
      const blockedResponse = {
        status: 429,
        json: async () => ({ success: false, message: 'Too many attempts' }),
      }
      mockCreateBruteForceProtection.mockReturnValue(
        jest.fn().mockResolvedValue(blockedResponse)
      )

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-csrf-token': validCSRFToken,
        },
        body: JSON.stringify({
          email: mockUser.email,
          password: 'password123',
        }),
      })

      const response = await POST(request as any)

      expect(response.status).toBe(429)
    })

    it('should not return password in response', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-csrf-token': validCSRFToken,
        },
        body: JSON.stringify({
          email: mockUser.email,
          password: 'password123',
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(data.user.password).toBeUndefined()
      expect(JSON.stringify(data)).not.toContain(mockUser.password)
    })
  })

  describe('⚠️ Validation Testleri', () => {
    it('should return error for missing email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-csrf-token': validCSRFToken,
        },
        body: JSON.stringify({
          password: 'password123',
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(500) // Validation error
      expect(data.success).toBe(false)
    })

    it('should return error for missing password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-csrf-token': validCSRFToken,
        },
        body: JSON.stringify({
          email: mockUser.email,
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(500) // Validation error
      expect(data.success).toBe(false)
    })
  })
})

