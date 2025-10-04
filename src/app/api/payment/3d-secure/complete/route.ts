import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { complete3DSecure, get3DSecureSession } from '@/lib/threeDSecure';
import { logger } from '@/lib/logger';

// 3D Secure tamamlama şeması
const complete3DSchema = z.object({
  sessionId: z.string().min(1, 'Session ID gerekli'),
  pares: z.string().min(1, 'PARes gerekli')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Input validation
    const validation = complete3DSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { sessionId, pares } = validation.data;

    // Session'ı kontrol et
    const session = get3DSecureSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veya süresi dolmuş 3D Secure session' },
        { status: 400 }
      );
    }

    // 3D Secure doğrulamasını tamamla
    const result = complete3DSecure(sessionId, pares);

    if (result.success) {
      logger.payment('3D Secure tamamlandı', {
        sessionId: sessionId.substring(0, 8) + '...',
        transactionId: result.transactionId
      });
      
      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        amount: session.amount,
        currency: session.currency,
        message: '3D Secure doğrulaması başarıyla tamamlandı'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    // Detaylı error bilgisini logger'a kaydet (güvenli)
    logger.error('3D Secure tamamlama hatası', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Kullanıcıya generic mesaj döndür (güvenli)
    return NextResponse.json(
      { 
        success: false, 
        error: '3D Secure doğrulaması tamamlanamadı. Lütfen daha sonra tekrar deneyin.',
        errorCode: '3DS_COMPLETE_ERROR'
      },
      { status: 500 }
    );
  }
}

// GET method'unu devre dışı bırak
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Bu endpoint sadece POST method ile kullanılabilir.' 
    },
    { status: 405 }
  );
}
