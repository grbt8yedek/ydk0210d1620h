import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Basit bellek içi cache (5 dk)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000

function jsonOk(body: any, cacheSeconds = 300) {
  return NextResponse.json(body, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': `public, max-age=${cacheSeconds}`,
    },
  })
}

export async function GET(request: NextRequest) {
  const cacheKey = 'campaigns'
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return jsonOk(cached.data)
  }

  const items = await prisma.campaign.findMany({
    where: {
      status: 'active',
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
        { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
      ],
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    take: 8,
  })

  const result = { success: true, data: items }
  cache.set(cacheKey, { data: result, timestamp: Date.now() })
  return jsonOk(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const created = await prisma.campaign.create({
    data: {
      title: body.title,
      description: body.description || null,
      imageUrl: body.imageUrl || null,
      imageData: body.imageData || null,
      altText: body.altText || body.title || 'Kampanya',
      linkUrl: body.linkUrl || null,
      status: body.status || 'active',
      position: typeof body.position === 'number' ? body.position : 0,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  })
  cache.delete('campaigns')
  return jsonOk({ success: true, data: created }, 0)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  if (!body.id) return NextResponse.json({ success: false, error: 'id gerekli' }, { status: 400 })
  const updated = await prisma.campaign.update({
    where: { id: body.id },
    data: {
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      imageData: body.imageData,
      altText: body.altText,
      linkUrl: body.linkUrl,
      status: body.status,
      position: body.position,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    },
  })
  cache.delete('campaigns')
  return jsonOk({ success: true, data: updated }, 0)
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

