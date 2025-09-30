import { NextResponse } from 'next/server';
import { logger } from '@/utils/error';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    
    if (!pin) {
      return NextResponse.json({
        success: false,
        message: 'PIN gerekli'
      }, { status: 400 });
    }

    // Server-side PIN kontrolü (güvenli)
    const correctPin = process.env.ADMIN_PIN || '7000';
    
    if (pin !== correctPin) {
      logger.warn('Başarısız admin PIN denemesi', {
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
      
      return NextResponse.json({
        success: false,
        message: 'Geçersiz PIN'
      }, { status: 401 });
    }

    logger.info('Admin PIN doğrulandı');

    return NextResponse.json({
      success: true,
      message: 'PIN doğrulandı'
    });
    
  } catch (error) {
    logger.error('Admin PIN verification hatası:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Sunucu hatası'
    }, { status: 500 });
  }
}
