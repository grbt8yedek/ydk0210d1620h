import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email adresi gereklidir'
      }, { status: 400 })
    }

    // Şimdilik sadece başarılı mesaj döndür
    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama sistemi yeniden kurulacak.'
    })

  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json({
      success: false,
      error: 'Bir hata oluştu'
    }, { status: 500 })
  }
}