import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { validatePasswordStrength } from '@/lib/authSecurity'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    logger.debug('Şifre sıfırlama isteği', { hasToken: !!token })

    if (!token || !password) {
      return NextResponse.json({
        success: false,
        error: 'Token ve şifre gereklidir'
      }, { status: 400 })
    }

    // Güçlü şifre kontrolü
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Şifre güvenlik gereksinimlerini karşılamıyor: ' + passwordValidation.errors.join(', ')
      }, { status: 400 })
    }

    // Token'ı doğrula ve kullanıcıyı bul
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      logger.warn('Geçersiz veya süresi dolmuş token')
      return NextResponse.json({
        success: false,
        error: 'Geçersiz veya süresi dolmuş token'
      }, { status: 400 })
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12)

    // Şifreyi güncelle ve token'ı temizle
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date()
      }
    })

    logger.security('Şifre başarıyla sıfırlandı', {
      userId: user.id,
      email: user.email
    })

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi'
    })

  } catch (error: any) {
    logger.error('Reset password error', { error })
    return NextResponse.json({
      success: false,
      error: 'Şifre güncellenirken hata oluştu'
    }, { status: 500 })
  }
}