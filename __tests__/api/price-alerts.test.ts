import { POST, GET } from '@/app/api/price-alerts/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    priceAlert: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))
jest.mock('next-auth')
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue(true),
  })),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('POST /api/price-alerts', () => {
  const validAlertData = {
    origin: 'IST',
    destination: 'FRA',
    departureDate: '2025-12-25',
    targetPrice: 500,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create price alert', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123', email: 'test@test.com' },
    } as any)
    mockPrisma.priceAlert.create.mockResolvedValue({ id: 'alert-1', ...validAlertData } as any)

    const request = new NextRequest('http://localhost/api/price-alerts', {
      method: 'POST',
      body: JSON.stringify(validAlertData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should reject unauthenticated requests', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/price-alerts', {
      method: 'POST',
      body: JSON.stringify(validAlertData),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('should validate required fields', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123' },
    } as any)

    const invalidData = { origin: 'IST' } // Missing fields

    const request = new NextRequest('http://localhost/api/price-alerts', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('should handle optional targetPrice', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123', email: 'test@test.com' },
    } as any)
    mockPrisma.priceAlert.create.mockResolvedValue({ id: 'alert-1' } as any)

    const dataWithoutPrice = {
      origin: 'IST',
      destination: 'FRA',
      departureDate: '2025-12-25',
    }

    const request = new NextRequest('http://localhost/api/price-alerts', {
      method: 'POST',
      body: JSON.stringify(dataWithoutPrice),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})

describe('GET /api/price-alerts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return price alerts', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123' },
    } as any)

    const mockAlerts = [
      { id: 'alert-1', origin: 'IST', destination: 'FRA' },
      { id: 'alert-2', origin: 'SAW', destination: 'AMS' },
    ]
    mockPrisma.priceAlert.findMany.mockResolvedValue(mockAlerts as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
  })

  it('should reject unauthenticated requests', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const response = await GET()
    expect(response.status).toBe(401)
  })
})

