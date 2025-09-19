import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Şimdilik her zaman geçersiz döndür
    return NextResponse.json({ 
      valid: false,
      message: 'Şifre sıfırlama sistemi yeniden kurulacak.'
    })

  } catch (error: any) {
    console.error('Token verification error:', error)
    return NextResponse.json({ 
      valid: false, 
      error: error.message || 'Unknown error' 
    })
  }
}