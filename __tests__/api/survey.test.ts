import { POST, GET } from '@/app/api/survey/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    surveyResponse: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('POST /api/survey', () => {
  const validSurveyData = {
    userId: 'user-123',
    answers: { q1: 'answer1', q2: 'answer2' },
    completedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create survey response', async () => {
    mockPrisma.surveyResponse.create.mockResolvedValue({ id: 's1', ...validSurveyData } as any)

    const request = new NextRequest('http://localhost/api/survey', {
      method: 'POST',
      body: JSON.stringify(validSurveyData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should reject missing userId', async () => {
    const invalidData = { answers: {}, completedAt: new Date().toISOString() }

    const request = new NextRequest('http://localhost/api/survey', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('should handle database errors', async () => {
    mockPrisma.surveyResponse.create.mockRejectedValue(new Error('DB Error'))

    const request = new NextRequest('http://localhost/api/survey', {
      method: 'POST',
      body: JSON.stringify(validSurveyData),
    })

    const response = await POST(request)
    expect(response.status).toBe(200) // Demo fallback
  })
})

describe('GET /api/survey', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return survey responses', async () => {
    const mockResponses = [
      { id: 's1', userId: 'user-123', answers: '{}' },
      { id: 's2', userId: 'user-456', answers: '{}' },
    ]
    mockPrisma.surveyResponse.findMany.mockResolvedValue(mockResponses as any)

    const request = new NextRequest('http://localhost/api/survey')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should filter by userId if provided', async () => {
    mockPrisma.surveyResponse.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/survey?userId=user-123')
    await GET(request)

    expect(mockPrisma.surveyResponse.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-123' },
      })
    )
  })

  it('should handle demo mode when table missing', async () => {
    mockPrisma.surveyResponse.findMany.mockRejectedValue(new Error('Table not found'))

    const request = new NextRequest('http://localhost/api/survey')
    const response = await GET(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })
})

