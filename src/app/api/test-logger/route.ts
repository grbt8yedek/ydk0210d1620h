/**
 * Logger Test API Endpoint
 * 
 * Bu endpoint logger sisteminin doğru çalıştığını test eder.
 * Production'a geçmeden önce bu endpoint silinecek.
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Test 1: Basit log
    logger.info('Logger test başladı');

    // Test 2: Debug log (sadece dev'de görünür)
    logger.debug('Bu debug log sadece development\'da görünür', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

    // Test 3: Payment log (hassas veri sanitize edilmeli)
    logger.payment('Test ödeme', {
      cardNumber: '4242424242424242',
      cvv: '123', // Bu ASLA loglanmamalı
      amount: 100,
      currency: 'TRY',
      token: 'tok_1234567890abcdefghijklmno',
    });

    // Test 4: Security log
    logger.security('Test güvenlik olayı', {
      userId: 'user_123',
      action: 'login_attempt',
      ipAddress: '192.168.1.1',
      token: 'csrf_token_1234567890abcdefghijklmno',
    });

    // Test 5: Hassas veri (sadece dev'de)
    logger.sensitive('Test hassas veri', {
      password: 'super_secret_password', // Production'da ASLA
      apiKey: 'sk_test_123456789',
      secret: 'my_secret_key',
    });

    // Test 6: User data
    logger.api('GET', '/api/test-logger', {
      userId: 'user_123',
      email: 'test@example.com',
      phone: '5551234567',
    });

    // Test 7: Warning
    logger.warn('Test uyarı mesajı', {
      code: 'TEST_WARNING',
      message: 'Bu bir test uyarısıdır',
    });

    // Test 8: Error
    logger.error('Test hata mesajı', {
      code: 'TEST_ERROR',
      message: 'Bu bir test hatasıdır',
      stack: 'Test stack trace',
    });

    return NextResponse.json({
      success: true,
      message: 'Logger test tamamlandı. Console/terminal\'i kontrol edin.',
      environment: process.env.NODE_ENV,
      tests: [
        '✅ info log',
        '✅ debug log (sadece dev)',
        '✅ payment log (sanitized)',
        '✅ security log',
        '✅ sensitive log (sadece dev)',
        '✅ api log',
        '✅ warn log',
        '✅ error log',
      ],
      notes: [
        'Development\'da: Tüm loglar console\'da görünmelidir',
        'Production\'da: Sadece error ve warn görünmelidir',
        'Hassas veriler: cardNumber, cvv, token, password sanitize edilmelidir',
      ],
    });
  } catch (error) {
    logger.error('Test API hatası', { error });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Test sırasında hata oluştu',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    logger.info('POST test', { body });

    // Custom test
    if (body.testType === 'payment') {
      logger.payment('Custom payment test', body.data);
    } else if (body.testType === 'security') {
      logger.security('Custom security test', body.data);
    }

    return NextResponse.json({
      success: true,
      message: 'Custom test tamamlandı',
      received: body,
    });
  } catch (error) {
    logger.error('POST test hatası', { error });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Test sırasında hata oluştu',
      },
      { status: 500 }
    );
  }
}

