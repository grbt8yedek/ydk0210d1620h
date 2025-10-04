import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Disable in production to avoid polluting real data
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_TEST_MONITORING !== 'true') {
      return NextResponse.json({ success: false, error: 'Test data disabled in production' }, { status: 403 })
    }
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Test verilerini oluştur
    const testData = {
      performance: {
        timestamp: new Date().toISOString(),
        page: '/flights/search',
        loadTime: Math.floor(Math.random() * 2000) + 500,
        firstContentfulPaint: Math.floor(Math.random() * 1000) + 200,
        largestContentfulPaint: Math.floor(Math.random() * 1500) + 500,
        cumulativeLayoutShift: Math.random() * 0.2,
        firstInputDelay: Math.floor(Math.random() * 100) + 10,
        timeToInteractive: Math.floor(Math.random() * 3000) + 1000,
        userAgent: 'Mozilla/5.0 (Test Browser)',
        connectionType: '4g',
        deviceType: 'desktop'
      },
      security: {
        timestamp: new Date().toISOString(),
        eventType: 'LOGIN_ATTEMPT',
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: 'Mozilla/5.0 (Test Browser)',
        userId: 'test_user_' + Math.floor(Math.random() * 100),
        details: 'Test login attempt',
        severity: 'MEDIUM',
        page: '/giris',
        action: 'login_attempt'
      },
      user: {
        timestamp: new Date().toISOString(),
        eventType: 'FLIGHT_SEARCH',
        userId: 'test_user_' + Math.floor(Math.random() * 100),
        email: 'test@example.com',
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: 'Mozilla/5.0 (Test Browser)',
        details: 'Test flight search',
        metadata: {
          origin: 'IST',
          destination: 'FRA',
          tripType: 'roundtrip'
        }
      },
      payment: {
        timestamp: new Date().toISOString(),
        eventType: 'PAYMENT_SUCCESS',
        amount: Math.floor(Math.random() * 500) + 100,
        currency: 'EUR',
        paymentMethod: 'credit_card',
        userId: 'test_user_' + Math.floor(Math.random() * 100),
        orderId: 'order_' + Math.floor(Math.random() * 10000),
        transactionId: 'txn_' + Math.floor(Math.random() * 100000),
        cardMasked: '****1234',
        processingTime: Math.floor(Math.random() * 5000) + 1000,
        ip: '192.168.1.' + Math.floor(Math.random() * 255)
      },
      error: {
        timestamp: new Date().toISOString(),
        errorType: 'ValidationError',
        errorMessage: 'Test error message',
        stackTrace: 'Error: Test error\n    at testFunction()\n    at test.js:1:1',
        severity: 'MEDIUM',
        page: '/flights/search',
        userId: 'test_user_' + Math.floor(Math.random() * 100),
        sessionId: 'session_' + Math.floor(Math.random() * 1000),
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: 'Mozilla/5.0 (Test Browser)',
        requestId: 'req_' + Math.floor(Math.random() * 10000),
        metadata: { test: true }
      },
      system: {
        timestamp: new Date().toISOString(),
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
        responseTime: Math.floor(Math.random() * 2000) + 100,
        activeConnections: Math.floor(Math.random() * 100) + 10,
        requestsPerMinute: Math.floor(Math.random() * 100) + 5,
        uptime: Math.floor(Math.random() * 86400) + 3600,
        version: '1.0.0',
        region: 'eu-west-1'
      }
    };

    // Her monitoring API'sine test verisi gönder
    const endpoints = [
      '/api/monitoring/performance',
      '/api/monitoring/security',
      '/api/monitoring/users',
      '/api/monitoring/payments',
      '/api/monitoring/errors',
      '/api/monitoring/system'
    ];

    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData[endpoint.split('/').pop() as keyof typeof testData])
        });
        return { endpoint, status: response.status, ok: response.ok };
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;

    return NextResponse.json({
      success: true,
      message: `${successCount}/${endpoints.length} test verisi başarıyla eklendi`,
      data: {
        testData,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { error: 'Failed' })
      }
    });

  } catch (error) {
    logger.error('Test verisi ekleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Test verisi eklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
