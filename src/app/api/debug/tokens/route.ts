import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Geliştirme ortamında sadece çalışsın
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
    }

    // Tüm resetToken'ları listele
    const usersWithTokens = await prisma.user.findMany({
      where: {
        resetToken: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetTokenExpiry: true,
        createdAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      count: usersWithTokens.length,
      tokens: usersWithTokens,
      currentTime: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug tokens error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
