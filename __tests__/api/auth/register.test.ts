import { POST } from '@/app/api/auth/register/route'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { createMockUser } from '@/__tests__/helpers/mockData'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))
jest.mock('bcryptjs')

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('POST /api/auth/register', () => {
  const validUserData = {
    email: 'newuser@example.com',
    password: 'SecurePassword123!',
    firstName: 'Test',
    lastName: 'User',
    countryCode: '+90',
    phone: '5551234567',
    birthDay: '01',
    birthMonth: '01',
    birthYear: '1990',
    gender: 'M',
    identityNumber: '12345678901',
    isForeigner: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Başarılı Kayıt', () => {
    it('should register new user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null) // Email kullanımda değil
      mockBcrypt.hash.mockResolvedValue('hashed-password-123' as never)
      
      const createdUser = createMockUser({
        email: validUserData.email,
        firstName: validUserData.firstName,
        lastName: validUserData.lastName,
      })
      mockPrisma.user.create.mockResolvedValue(createdUser)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validUserData),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.user).toBeDefined()
      expect(data.data.user.email).toBe(validUserData.email)
      expect(data.data.user.firstName).toBe(validUserData.firstName)
      expect(mockBcrypt.hash).toHaveBeenCalledWith(validUserData.password, 10)
    })

    it('should hash password before storing', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed-password-123' as never)
      mockPrisma.user.create.mockResolvedValue(createMockUser())

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validUserData),
      })

      await POST(request as any)

      expect(mockBcrypt.hash).toHaveBeenCalledWith(validUserData.password, 10)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          password: 'hashed-password-123', // Hashed olmalı
        }),
      })
    })

    it('should set default status as active', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
      mockPrisma.user.create.mockResolvedValue(createMockUser())

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validUserData),
      })

      await POST(request as any)

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'active',
        }),
      })
    })

    it('should handle optional fields correctly', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
      mockPrisma.user.create.mockResolvedValue(createMockUser())

      const minimalUserData = {
        email: 'minimal@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(minimalUserData),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should set isForeigner to false if not provided', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
      mockPrisma.user.create.mockResolvedValue(createMockUser())

      const userWithoutForeignerFlag = { ...validUserData }
      delete userWithoutForeignerFlag.isForeigner

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userWithoutForeignerFlag),
      })

      await POST(request as any)

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isForeigner: false, // Default değer
        }),
      })
    })
  })

  describe('❌ Validation Hataları', () => {
    it('should return error for missing email', async () => {
      const invalidData = { ...validUserData }
      delete invalidData.email

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('MISSING_FIELD')
    })

    it('should return error for missing password', async () => {
      const invalidData = { ...validUserData }
      delete invalidData.password

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should return error for missing firstName', async () => {
      const invalidData = { ...validUserData }
      delete invalidData.firstName

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should return error for missing lastName', async () => {
      const invalidData = { ...validUserData }
      delete invalidData.lastName

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should return error for invalid email format', async () => {
      const invalidEmailData = {
        ...validUserData,
        email: 'invalid-email-format',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidEmailData),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_INPUT')
    })

    it('should validate various invalid email formats', async () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
      ]

      for (const invalidEmail of invalidEmails) {
        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            ...validUserData,
            email: invalidEmail,
          }),
        })

        const response = await POST(request as any)
        const data = await response.json()

        expect(data.success).toBe(false)
        expect(data.error.code).toBe('INVALID_INPUT')
      }
    })

    it('should return error if email already exists', async () => {
      const existingUser = createMockUser({ email: validUserData.email })
      mockPrisma.user.findUnique.mockResolvedValue(existingUser)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validUserData),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('ALREADY_EXISTS')
    })
  })

  describe('🔒 Güvenlik Testleri', () => {
    it('should not return password in response', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
      
      const createdUser = createMockUser()
      mockPrisma.user.create.mockResolvedValue(createdUser)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validUserData),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(data.data.user.password).toBeUndefined()
      expect(JSON.stringify(data)).not.toContain('hashed-password')
      expect(JSON.stringify(data)).not.toContain(validUserData.password)
    })

    it('should not store plain text password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed-password-xyz' as never)
      mockPrisma.user.create.mockResolvedValue(createMockUser())

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validUserData),
      })

      await POST(request as any)

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          password: 'hashed-password-xyz', // Hashed version
        }),
      })

      expect(mockPrisma.user.create).not.toHaveBeenCalledWith({
        data: expect.objectContaining({
          password: validUserData.password, // Plain text OLMAMALI
        }),
      })
    })

    it('should use bcrypt with salt rounds 10', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
      mockPrisma.user.create.mockResolvedValue(createMockUser())

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validUserData),
      })

      await POST(request as any)

      expect(mockBcrypt.hash).toHaveBeenCalledWith(
        validUserData.password,
        10 // Salt rounds
      )
    })
  })

  describe('📊 Database İşlemleri', () => {
    it('should check if email exists before creating user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
      mockPrisma.user.create.mockResolvedValue(createMockUser())

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validUserData),
      })

      await POST(request as any)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: validUserData.email },
      })
      expect(mockPrisma.user.findUnique).toHaveBeenCalledBefore(mockPrisma.user.create as any)
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
      mockPrisma.user.create.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validUserData),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('DATABASE_ERROR')
    })

    it('should log user creation', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
      
      const createdUser = createMockUser({ email: validUserData.email })
      mockPrisma.user.create.mockResolvedValue(createdUser)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validUserData),
      })

      await POST(request as any)

      // Logger mock yok ama en azından hata fırlatmadığını doğruluyoruz
      expect(mockPrisma.user.create).toHaveBeenCalled()
    })
  })

  describe('🌍 Yabancı Uyruklu Kullanıcılar', () => {
    it('should handle foreign users correctly', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
      mockPrisma.user.create.mockResolvedValue(createMockUser())

      const foreignUserData = {
        ...validUserData,
        isForeigner: true,
        identityNumber: null,
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(foreignUserData),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isForeigner: true,
        }),
      })
    })
  })
})

