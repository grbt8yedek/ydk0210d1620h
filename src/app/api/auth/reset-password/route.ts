import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({
        success: false,
        error: 'Token ve şifre gereklidir'
      }, { status: 400 })
    }

    // Şimdilik başarısız döndür
    return NextResponse.json({
      success: false,
      error: 'Şifre sıfırlama sistemi yeniden kurulacak.'
    }, { status: 400 })

  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json({
      success: false,
      error: 'Şifre güncellenirken hata oluştu'
    }, { status: 500 })
  }
}