import { GET, POST } from '@/app/api/reservations/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { createMockUser, mockReservation } from '@/__tests__/helpers/mockData'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    reservation: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('GET /api/reservations', () => {
  const mockUser = createMockUser()
  const mockSession = {
    user: {
      id: mockUser.id,
      email: mockUser.email,
      name: `${mockUser.firstName} ${mockUser.lastName}`,
    },
    expires: '2024-12-31',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Başarılı Senaryolar', () => {
    it('should return user reservations', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.findMany.mockResolvedValue([mockReservation] as any)

      const request = new NextRequest('http://localhost:3000/api/reservations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
      expect(data[0].id).toBe(mockReservation.id)
    })

    it('should filter reservations by type', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/reservations?type=flight')
      await GET(request)

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          type: 'flight',
        },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should order reservations by creation date descending', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/reservations')
      await GET(request)

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      )
    })

    it('should return empty array if no reservations found', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/reservations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(0)
    })
  })

  describe('❌ Auth Hataları', () => {
    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/reservations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Yetkisiz')
    })

    it('should return 401 if session has no user ID', async () => {
      mockGetServerSession.mockResolvedValue({ user: {}, expires: '2024-12-31' } as any)

      const request = new NextRequest('http://localhost:3000/api/reservations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Yetkisiz')
    })
  })

  describe('🔒 Güvenlik Testleri', () => {
    it('should only return reservations for authenticated user', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/reservations')
      await GET(request)

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id, // Sadece kendi rezervasyonları
          }),
        })
      )
    })
  })

  describe('⚠️ Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/reservations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })
})

describe('POST /api/reservations', () => {
  const mockUser = createMockUser()
  const mockSession = {
    user: {
      id: mockUser.id,
      email: mockUser.email,
      name: `${mockUser.firstName} ${mockUser.lastName}`,
    },
    expires: '2024-12-31',
  }

  const validReservationData = {
    type: 'flight',
    status: 'confirmed',
    amount: 1500,
    currency: 'TRY',
    biletDukkaniOrderId: 'ORDER-123',
    biletDukkaniRouteId: 'ROUTE-456',
    pnr: 'ABC123',
    validUntil: '2024-12-31T23:59:59Z',
    passengers: [{ firstName: 'John', lastName: 'Doe' }],
    flightNumber: 'TK1234',
    origin: 'IST',
    destination: 'AMS',
    departureTime: '2024-06-01T10:00:00Z',
    arrivalTime: '2024-06-01T14:00:00Z',
    airline: 'Turkish Airlines',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Başarılı Rezervasyon', () => {
    it('should create reservation successfully', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.create.mockResolvedValue(mockReservation as any)

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(validReservationData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBeDefined()
      expect(mockPrisma.reservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUser.id,
          type: validReservationData.type,
          amount: validReservationData.amount,
          pnr: validReservationData.pnr,
        }),
      })
    })

    it('should include all required fields', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.create.mockResolvedValue(mockReservation as any)

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(validReservationData),
      })

      await POST(request)

      expect(mockPrisma.reservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: validReservationData.type,
          status: validReservationData.status,
          amount: validReservationData.amount,
          currency: validReservationData.currency,
          pnr: validReservationData.pnr,
          flightNumber: validReservationData.flightNumber,
          origin: validReservationData.origin,
          destination: validReservationData.destination,
        }),
      })
    })

    it('should convert date strings to Date objects', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.create.mockResolvedValue(mockReservation as any)

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(validReservationData),
      })

      await POST(request)

      expect(mockPrisma.reservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          departureTime: expect.any(Date),
          arrivalTime: expect.any(Date),
          validUntil: expect.any(Date),
        }),
      })
    })

    it('should handle null validUntil', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.create.mockResolvedValue(mockReservation as any)

      const dataWithoutValidUntil = { ...validReservationData }
      delete dataWithoutValidUntil.validUntil

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(dataWithoutValidUntil),
      })

      await POST(request)

      expect(mockPrisma.reservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          validUntil: null,
        }),
      })
    })
  })

  describe('❌ Auth Hataları', () => {
    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(validReservationData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Yetkisiz')
      expect(mockPrisma.reservation.create).not.toHaveBeenCalled()
    })
  })

  describe('🔒 Güvenlik Testleri', () => {
    it('should always use authenticated user ID', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.create.mockResolvedValue(mockReservation as any)

      // Kötü niyetli kullanıcı başkası adına rezervasyon yapmaya çalışıyor
      const maliciousData = {
        ...validReservationData,
        userId: 'different-user-id', // Hack attempt!
      }

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(maliciousData),
      })

      await POST(request)

      // Session'daki user ID kullanılmalı, body'deki değil!
      expect(mockPrisma.reservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUser.id, // Session'dan gelen ID
        }),
      })
    })
  })

  describe('⚠️ Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(validReservationData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })

    it('should include error details in response', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      const dbError = new Error('Unique constraint violation')
      mockPrisma.reservation.create.mockRejectedValue(dbError)

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(validReservationData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.details).toBeDefined()
      expect(data.details).toContain('Unique constraint')
    })
  })

  describe('🎟️ Rezervasyon Senaryoları', () => {
    it('should create flight reservation', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.create.mockResolvedValue(mockReservation as any)

      const flightData = { ...validReservationData, type: 'flight' }
      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(flightData),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should handle multiple passengers', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.reservation.create.mockResolvedValue(mockReservation as any)

      const multiPassengerData = {
        ...validReservationData,
        passengers: [
          { firstName: 'John', lastName: 'Doe' },
          { firstName: 'Jane', lastName: 'Doe' },
        ],
      }

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(multiPassengerData),
      })

      await POST(request)

      expect(mockPrisma.reservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          passengers: multiPassengerData.passengers,
        }),
      })
    })
  })
})

