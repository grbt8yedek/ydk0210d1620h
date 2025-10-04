import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { tokenizeCard, maskCardNumber } from '@/lib/cardTokenization';
import { 
  validateCardNumber, 
  validateCVV, 
  validateExpiryDate, 
  logSecureCardInfo, 
  pciRateLimit,
  PCIErrorMessages,
  auditLog 
} from '@/lib/pciCompliance';
import { logger } from '@/lib/logger';

// Güvenli kart tokenization şeması
const tokenizeCardSchema = z.object({
  number: z.string().min(13, 'Geçerli bir kart numarası girin').max(19, 'Geçerli bir kart numarası girin'),
  expiryMonth: z.string().min(1).max(2),
  expiryYear: z.string().min(2).max(4),
  cvv: z.string().min(3).max(4),
  name: z.string().min(2, 'Kart üzerindeki isim gerekli')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Rate limiting kontrolü
    const clientIP = request.ip || 'unknown';
    if (!pciRateLimit.isAllowed(clientIP)) {
      auditLog('RATE_LIMIT_EXCEEDED', { ip: clientIP, endpoint: 'tokenize' });
      return NextResponse.json(
        { success: false, error: PCIErrorMessages.RATE_LIMIT_EXCEEDED },
        { status: 429 }
      );
    }
    
    // Input validation
    const validation = tokenizeCardSchema.safeParse(body);
    if (!validation.success) {
      auditLog('VALIDATION_ERROR', { ip: clientIP, errors: validation.error.errors });
      return NextResponse.json(
        { success: false, error: validation.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    const cardData = validation.data;

    // Kart numarasını temizle
    const cleanCardNumber = cardData.number.replace(/\s/g, '');
    
    // PCI DSS uyumlu kart numarası kontrolü
    if (!validateCardNumber(cleanCardNumber)) {
      auditLog('INVALID_CARD_NUMBER', { ip: clientIP, bin: cleanCardNumber.substring(0, 6) });
      return NextResponse.json(
        { success: false, error: PCIErrorMessages.INVALID_CARD_NUMBER },
        { status: 400 }
      );
    }
    
    // Kart markasını tespit et
    const cardBrand = detectCardBrand(cleanCardNumber);
    
    // CVV kontrolü
    if (!validateCVV(cardData.cvv, cardBrand)) {
      auditLog('INVALID_CVV', { ip: clientIP, brand: cardBrand });
      return NextResponse.json(
        { success: false, error: PCIErrorMessages.INVALID_CVV },
        { status: 400 }
      );
    }
    
    // Son kullanma tarihi kontrolü
    if (!validateExpiryDate(cardData.expiryMonth, cardData.expiryYear)) {
      auditLog('INVALID_EXPIRY', { ip: clientIP, brand: cardBrand });
      return NextResponse.json(
        { success: false, error: PCIErrorMessages.INVALID_EXPIRY },
        { status: 400 }
      );
    }

    // Kart numarasını maskele (log için)
    const maskedNumber = maskCardNumber(cleanCardNumber);
    
    // Güvenli token oluştur
    const token = tokenizeCard({
      ...cardData,
      number: cleanCardNumber
    });

    // PCI DSS uyumlu logging
    logSecureCardInfo('CARD_TOKENIZED', {
      brand: cardBrand,
      lastFour: cleanCardNumber.slice(-4),
      maskedNumber: maskedNumber,
      bin: cleanCardNumber.substring(0, 6)
    });
    
    // Audit log
    auditLog('CARD_TOKENIZED', {
      ip: clientIP,
      brand: cardBrand,
      bin: cleanCardNumber.substring(0, 6),
      token: token.substring(0, 8) + '...'
    });

    return NextResponse.json({
      success: true,
      token: token,
      cardInfo: {
        maskedNumber: maskedNumber,
        lastFour: cleanCardNumber.slice(-4),
        brand: cardBrand,
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear
      },
      expiresIn: 3600, // 1 saat (saniye)
      message: 'Kart bilgileri güvenli şekilde tokenize edildi'
    });

  } catch (error) {
    logger.error('Kart tokenization hatası', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Kart bilgileri işlenirken hata oluştu'
      },
      { status: 500 }
    );
  }
}

// validateLuhn fonksiyonu artık pciCompliance.ts'den import ediliyor

/**
 * Kart markasını tespit eder
 * @param cardNumber Kart numarası
 * @returns Kart markası
 */
function detectCardBrand(cardNumber: string): string {
  if (/^4/.test(cardNumber)) return 'Visa';
  if (/^5[1-5]/.test(cardNumber)) return 'MasterCard';
  if (/^3[47]/.test(cardNumber)) return 'American Express';
  if (/^6/.test(cardNumber)) return 'Discover';
  
  return 'Unknown';
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
