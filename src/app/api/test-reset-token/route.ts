import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email gereklidir'
      }, { status: 400 })
    }

    // Kullanıcıyı bul veya oluştur
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Test için kullanıcı oluştur
      user = await prisma.user.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: email,
          password: 'test123' // Bu sadece test için
        }
      })
    }

    // Test token oluştur
    const resetToken = crypto.randomUUID()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 saat

    // Token'ı kaydet
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Test linki oluştur
    const testLink = `https://anasite.grbt8.store/sifre-sifirla?token=${resetToken}`

    return NextResponse.json({
      success: true,
      message: 'Test token oluşturuldu',
      data: {
        userId: user.id,
        email: user.email,
        resetToken,
        resetTokenExpiry,
        testLink
      }
    })

  } catch (error: any) {
    console.error('Test reset token error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 })
  }
}
