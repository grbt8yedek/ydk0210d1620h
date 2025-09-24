import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.campaign.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updated = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl && typeof body.imageUrl === 'string' && !body.imageUrl.startsWith('data:') ? body.imageUrl : undefined,
        imageData: body.imageData && typeof body.imageData === 'string' && body.imageData.startsWith('data:') ? body.imageData : undefined,
        altText: body.altText,
        linkUrl: body.linkUrl,
        status: body.status,
        position: typeof body.position === 'number' ? body.position : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      }
    })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 })
  }
}


