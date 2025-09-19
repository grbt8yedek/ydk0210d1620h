import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' })
    }

    console.log('Debug - Aranan token:', token)

    // Veritabanı bağlantısını test et
    const testConnection = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Debug - DB Connection:', testConnection)

    // Bu token'ı ara
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token
      },
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetTokenExpiry: true
      }
    })

    console.log('Debug - Bulunan user:', user)

    // Tüm reset token'ları listele
    const allTokens = await prisma.user.findMany({
      where: {
        resetToken: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetTokenExpiry: true
      }
    })

    console.log('Debug - Tüm tokenlar:', allTokens)

    return NextResponse.json({
      searchedToken: token,
      foundUser: user,
      allTokens: allTokens,
      currentTime: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    })
  }
}
