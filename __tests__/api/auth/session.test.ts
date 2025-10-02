import { POST } from '@/app/api/auth/session/route'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createMockUser } from '@/__tests__/helpers/mockData'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))
jest.mock('bcryptjs')

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('POST /api/auth/session', () => {
  const adminEmail = 'admin@grbt8.store'
  const validPassword = 'Test123!'

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_EMAILS = 'admin@grbt8.store,test@grbt8.store'
  })

  describe('✅ Successful Session Creation', () => {
    it('should create session for valid admin', async () => {
      const mockUser = createMockUser({ email: adminEmail })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: validPassword,
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
    })

    it('should return user info', async () => {
      const mockUser = createMockUser({
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: validPassword,
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(data.user.email).toBe(adminEmail)
      expect(data.user.firstName).toBe('Admin')
      expect(data.user.lastName).toBe('User')
    })

    it('should not expose password', async () => {
      const mockUser = createMockUser({ email: adminEmail })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: validPassword,
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(data.user).not.toHaveProperty('password')
      expect(JSON.stringify(data)).not.toContain('hashed')
    })
  })

  describe('❌ Validation Errors', () => {
    it('should reject missing email', async () => {
      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          password: validPassword,
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Email ve şifre')
    })

    it('should reject missing password', async () => {
      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
        }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(400)
    })

    it('should reject non-admin email', async () => {
      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          password: validPassword,
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('Yetkisiz')
    })

    it('should reject user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: validPassword,
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('bulunamadı')
    })

    it('should reject invalid password', async () => {
      const mockUser = createMockUser({ email: adminEmail })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(false as never)

      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: 'WrongPassword',
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Geçersiz şifre')
    })
  })

  describe('🔒 Admin Email Security Issue', () => {
    it('should allow grbt8 emails (SECURITY ISSUE)', async () => {
      const mockUser = createMockUser({ email: 'fake@grbt8.com' })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: 'fake@grbt8.com',
          password: validPassword,
        }),
      })

      const response = await POST(request as any)
      // This passes but SHOULD fail - security issue!
      expect(response.status).toBe(200)
    })

    it('should allow admin string in email (SECURITY ISSUE)', async () => {
      const mockUser = createMockUser({ email: 'fakeadmin@test.com' })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: 'fakeadmin@test.com',
          password: validPassword,
        }),
      })

      const response = await POST(request as any)
      // This passes but SHOULD fail - security issue!
      expect(response.status).toBe(200)
    })
  })

  describe('🔐 Password Verification', () => {
    it('should use bcrypt compare', async () => {
      const mockUser = createMockUser({ email: adminEmail })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: validPassword,
        }),
      })

      await POST(request as any)

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        validPassword,
        expect.any(String)
      )
    })

    it('should handle user without password', async () => {
      const mockUser = createMockUser({ email: adminEmail, password: null })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: validPassword,
        }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(404)
    })
  })

  describe('⚠️ Error Handling', () => {
    it('should handle database errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('DB Error'))

      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: validPassword,
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Sunucu')
    })

    it('should handle bcrypt errors', async () => {
      const mockUser = createMockUser({ email: adminEmail })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockRejectedValue(new Error('Bcrypt error'))

      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: validPassword,
        }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(500)
    })
  })

  describe('📧 Email Normalization', () => {
    it('should normalize email to lowercase', async () => {
      const mockUser = createMockUser({ email: adminEmail })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: 'ADMIN@GRBT8.STORE',
          password: validPassword,
        }),
      })

      await POST(request as any)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: adminEmail },
      })
    })

    it('should handle ADMIN_EMAILS env variable', async () => {
      process.env.ADMIN_EMAILS = 'test1@test.com,test2@test.com'
      
      const request = new NextRequest('http://localhost/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test1@test.com',
          password: validPassword,
        }),
      })

      const mockUser = createMockUser({ email: 'test1@test.com' })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const response = await POST(request as any)
      expect(response.status).toBe(200)
    })
  })
})

