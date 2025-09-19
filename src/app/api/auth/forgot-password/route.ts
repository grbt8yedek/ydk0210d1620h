import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email adresi gereklidir'
      }, { status: 400 })
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Güvenlik için her zaman başarılı mesaj döndür
      return NextResponse.json({
        success: true,
        message: 'Eğer bu email adresi kayıtlı ise, şifre sıfırlama linki gönderilecektir.'
      })
    }

    // Token oluştur
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

    // Admin panel'den email gönder
    const emailResponse = await fetch('https://www.grbt8.store/api/email/templates/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        name: user.firstName || user.email,
        resetToken: resetToken
      })
    })

    const emailData = await emailResponse.json()

    if (!emailData.success) {
      console.error('Email gönderme hatası:', emailData.error)
      return NextResponse.json({
        success: false,
        error: 'Email gönderilirken hata oluştu'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama linki email adresinize gönderildi.'
    })

  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json({
      success: false,
      error: 'Bir hata oluştu'
    }, { status: 500 })
  }
}
