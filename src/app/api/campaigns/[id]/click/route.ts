import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { clickCount: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Campaign click API error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}



