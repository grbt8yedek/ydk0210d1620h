import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    console.log('Token doğrulama isteği:', { token })

    if (!token) {
      console.log('Token bulunamadı')
      return NextResponse.json({ 
        valid: false,
        error: 'Token bulunamadı'
      })
    }

    // Token'ı veritabanında ara
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Süresi dolmamış olmalı
        }
      },
      select: {
        id: true,
        email: true,
        resetTokenExpiry: true
      }
    })

    if (!user) {
      console.log('Geçersiz veya süresi dolmuş token:', token)
      return NextResponse.json({ 
        valid: false,
        error: 'Token geçersiz veya süresi dolmuş'
      })
    }

    console.log('Token geçerli:', {
      userId: user.id,
      email: user.email,
      expiry: user.resetTokenExpiry
    })

    return NextResponse.json({ 
      valid: true,
      message: 'Token geçerli'
    })

  } catch (error: any) {
    console.error('Token verification error:', error)
    return NextResponse.json({ 
      valid: false, 
      error: 'Token doğrulanırken hata oluştu'
    })
  }
}