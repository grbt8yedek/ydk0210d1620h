import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function jsonOk(body: any, cacheSeconds = 0) {
  return NextResponse.json(body, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      // Kampanya yönetiminde anında yansısın
      'Cache-Control': cacheSeconds > 0 ? `public, max-age=${cacheSeconds}` : 'no-store',
    },
  })
}

export async function GET(request: NextRequest) {
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
  return jsonOk(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const created = await prisma.campaign.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      imageUrl: body.imageUrl && typeof body.imageUrl === 'string' && !body.imageUrl.startsWith('data:') ? body.imageUrl : null,
      imageData: body.imageData && typeof body.imageData === 'string' && body.imageData.startsWith('data:') ? body.imageData : null,
      altText: body.altText || body.title || 'Kampanya',
      linkUrl: body.linkUrl || null,
      status: body.status || 'active',
      position: typeof body.position === 'number' ? body.position : 0,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  })
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

