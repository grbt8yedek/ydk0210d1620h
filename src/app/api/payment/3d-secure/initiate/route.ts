import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { initiate3DSecure } from '@/lib/threeDSecure';
import { getCardFromToken, getSecureCardInfo } from '@/lib/cardTokenization';
import { logger } from '@/lib/logger';

// 3D Secure başlatma şeması
const initiate3DSchema = z.object({
  cardToken: z.string().min(1, 'Kart token gerekli'),
  amount: z.number().positive('Geçerli bir tutar girin'),
  currency: z.string().length(3, 'Geçerli bir para birimi girin'),
  orderId: z.string().optional(),
  description: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Input validation
    const validation = initiate3DSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { cardToken, amount, currency, orderId, description } = validation.data;

    // Token'dan kart bilgilerini kontrol et
    const cardData = getCardFromToken(cardToken);
    if (!cardData) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veya süresi dolmuş kart token' },
        { status: 400 }
      );
    }

    // Güvenli kart bilgilerini al
    const secureCardInfo = getSecureCardInfo(cardToken);
    
    // 3D Secure işlemini başlat
    const result = initiate3DSecure({
      cardToken,
      amount,
      currency,
      orderId,
      description
    });

    if (result.success) {
      logger.payment('3D Secure başlatıldı', {
        amount: `${amount} ${currency}`,
        card: `${secureCardInfo?.brand} ****${secureCardInfo?.lastFour}`,
        sessionId: result.sessionId?.substring(0, 8) + '...'
      });
      
      return NextResponse.json({
        success: true,
        sessionId: result.sessionId,
        acsUrl: result.acsUrl,
        pareq: result.pareq,
        md: result.md,
        message: '3D Secure işlemi başlatıldı. Kullanıcıyı ACS sayfasına yönlendirin.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    logger.error('3D Secure başlatma hatası', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '3D Secure işlemi başlatılamadı'
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
