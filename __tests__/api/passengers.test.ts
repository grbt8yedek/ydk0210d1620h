import { GET, POST } from '@/app/api/passengers/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    passenger: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))
jest.mock('next-auth')

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('GET /api/passengers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return passengers for authenticated user', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123', email: 'test@test.com' },
    } as any)

    const mockPassengers = [
      { id: 'p1', firstName: 'John', lastName: 'Doe', status: 'active' },
      { id: 'p2', firstName: 'Jane', lastName: 'Doe', status: 'active' },
    ]
    mockPrisma.passenger.findMany.mockResolvedValue(mockPassengers as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
  })

  it('should reject unauthenticated requests', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toContain('Oturum')
  })

  it('should filter by active status', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123' },
    } as any)
    mockPrisma.passenger.findMany.mockResolvedValue([])

    await GET()

    expect(mockPrisma.passenger.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-123',
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  })

  it('should handle database errors', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123' },
    } as any)
    mockPrisma.passenger.findMany.mockRejectedValue(new Error('DB Error'))

    const response = await GET()
    expect(response.status).toBe(500)
  })
})

describe('POST /api/passengers', () => {
  const validPassengerData = {
    firstName: 'John',
    lastName: 'Doe',
    birthDay: '15',
    birthMonth: '06',
    birthYear: '1990',
    gender: 'M',
    identityNumber: '12345678901',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create passenger for authenticated user', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123' },
    } as any)
    mockPrisma.passenger.create.mockResolvedValue({ id: 'p1', ...validPassengerData } as any)

    const request = new NextRequest('http://localhost/api/passengers', {
      method: 'POST',
      body: JSON.stringify(validPassengerData),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe('p1')
  })

  it('should reject unauthenticated requests', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/passengers', {
      method: 'POST',
      body: JSON.stringify(validPassengerData),
    })

    const response = await POST(request as any)
    expect(response.status).toBe(401)
  })

  it('should validate required fields', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123' },
    } as any)

    const invalidData = { firstName: 'John' } // Missing other fields

    const request = new NextRequest('http://localhost/api/passengers', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Gerekli')
  })

  it('should handle database errors', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123' },
    } as any)
    mockPrisma.passenger.create.mockRejectedValue(new Error('DB Error'))

    const request = new NextRequest('http://localhost/api/passengers', {
      method: 'POST',
      body: JSON.stringify(validPassengerData),
    })

    const response = await POST(request as any)
    expect(response.status).toBe(500)
  })
})

