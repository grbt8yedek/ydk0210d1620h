import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { validatePasswordStrength } from '@/lib/authSecurity'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    console.log('Şifre sıfırlama isteği:', { token: token ? 'var' : 'yok' })

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
        error: 'Şifre güvenlik gereksinimlerini karşılamıyor: ' + passwordValidation.errors.map(err => err.replace('Password', 'Şifre')).join(', ')
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
      console.log('Geçersiz veya süresi dolmuş token:', token)
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

    console.log('Şifre başarıyla güncellendi:', {
      userId: user.id,
      email: user.email
    })

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi'
    })

  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json({
      success: false,
      error: 'Şifre güncellenirken hata oluştu'
    }, { status: 500 })
  }
}