import { NextRequest, NextResponse } from 'next/server';
import { getCardBinInfo } from '@/services/paymentApi';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Güvenli kart bilgisi şeması
const binInfoSchema = z.object({
  cardNumber: z.string().min(6, 'En az 6 hane gerekli').max(19, 'Geçersiz kart numarası'),
  price: z.number().optional(),
  productType: z.string().optional(),
  currencyCode: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Input validation
    const validation = binInfoSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { cardNumber, price, productType, currencyCode } = validation.data;

    // Kart numarasını temizle ve BIN'i çıkar
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    const bin = cleanCardNumber.substring(0, 6);

    // Güvenlik: Sadece BIN'i logla, tam kart numarasını değil
    logger.payment('BIN bilgisi sorgulanıyor', {
      bin: `${bin}****`,
      cardLength: cleanCardNumber.length
    });

    // BIN bilgisini al (v2 formatında)
    const binInfo = await getCardBinInfo(cardNumber, {
      withInstallment: true,
      price: price,
      productType: productType,
      currencyCode: currencyCode
    });

    return NextResponse.json({
      success: true,
      data: binInfo
    });

  } catch (error) {
    // Detaylı error bilgisini logger'a kaydet (güvenli)
    logger.error('BIN bilgisi alınırken hata', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Kullanıcıya generic mesaj döndür (güvenli)
    return NextResponse.json(
      { 
        success: false, 
        error: 'BIN bilgisi alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        errorCode: 'BIN_INFO_ERROR'
      },
      { status: 500 }
    );
  }
}

// GET method'unu devre dışı bırak (güvenlik için)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Bu endpoint sadece POST method ile kullanılabilir. Güvenlik nedeniyle GET method devre dışıdır.' 
    },
    { status: 405 }
  );
} 