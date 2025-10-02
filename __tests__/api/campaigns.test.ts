import { GET, POST } from '@/app/api/campaigns/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    campaign: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('GET /api/campaigns', () => {
  const mockCampaigns = [
    {
      id: 'c1',
      title: 'Summer Sale',
      description: '50% off',
      status: 'active',
      position: 1,
      clickCount: 10,
      viewCount: 100,
    },
    {
      id: 'c2',
      title: 'Winter Deal',
      description: '30% off',
      status: 'active',
      position: 2,
      clickCount: 5,
      viewCount: 50,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return active campaigns', async () => {
    mockPrisma.campaign.findMany.mockResolvedValue(mockCampaigns as any)

    const request = new NextRequest('http://localhost/api/campaigns')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
  })

  it('should filter by active status', async () => {
    mockPrisma.campaign.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/campaigns')
    await GET(request)

    expect(mockPrisma.campaign.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'active',
        }),
      })
    )
  })

  it('should limit to 8 campaigns', async () => {
    mockPrisma.campaign.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/campaigns')
    await GET(request)

    expect(mockPrisma.campaign.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 8,
      })
    )
  })

  it('should order by position', async () => {
    mockPrisma.campaign.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/campaigns')
    await GET(request)

    expect(mockPrisma.campaign.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: expect.arrayContaining([
          { position: 'asc' },
        ]),
      })
    )
  })

  it('should include CORS headers', async () => {
    mockPrisma.campaign.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/campaigns')
    const response = await GET(request)

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('should handle empty results', async () => {
    mockPrisma.campaign.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/campaigns')
    const response = await GET(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })
})

describe('POST /api/campaigns', () => {
  const validCampaignData = {
    title: 'New Campaign',
    description: 'Description',
    status: 'active',
    position: 1,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create campaign', async () => {
    mockPrisma.campaign.create.mockResolvedValue({ id: 'c1', ...validCampaignData } as any)

    const request = new NextRequest('http://localhost/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(validCampaignData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should handle creation errors', async () => {
    mockPrisma.campaign.create.mockRejectedValue(new Error('DB Error'))

    const request = new NextRequest('http://localhost/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(validCampaignData),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
  })
})

