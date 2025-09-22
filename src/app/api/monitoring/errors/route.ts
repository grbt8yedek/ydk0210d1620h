import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const errorEventSchema = z.object({
  timestamp: z.string().datetime(),
  errorType: z.string(),
  errorMessage: z.string(),
  stackTrace: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  page: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  requestId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Geçici depolama (production'da Redis kullanılmalı)
const errorEvents: Array<z.infer<typeof errorEventSchema>> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = errorEventSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }

    const errorEvent = validation.data;
    errorEvents.push(errorEvent);

    // Son 2000 kaydı tut
    if (errorEvents.length > 2000) {
      errorEvents.splice(0, errorEvents.length - 2000);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const severity = searchParams.get('severity');
    const errorType = searchParams.get('errorType');
    
    const now = new Date();
    let cutoffTime: Date;
    
    switch (timeframe) {
      case '1h':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    let filteredErrors = errorEvents.filter(errorEvent => 
      new Date(errorEvent.timestamp) >= cutoffTime
    );

    if (severity) {
      filteredErrors = filteredErrors.filter(errorEvent => errorEvent.severity === severity);
    }

    if (errorType) {
      filteredErrors = filteredErrors.filter(errorEvent => errorEvent.errorType === errorType);
    }

    // İstatistikleri hecapla
    const stats = {
      totalErrors: filteredErrors.length,
      criticalErrors: filteredErrors.filter(e => e.severity === 'CRITICAL').length,
      highErrors: filteredErrors.filter(e => e.severity === 'HIGH').length,
      mediumErrors: filteredErrors.filter(e => e.severity === 'MEDIUM').length,
      lowErrors: filteredErrors.filter(e => e.severity === 'LOW').length,
      errorsByType: filteredErrors.reduce((acc, error) => {
        acc[error.errorType] = (acc[error.errorType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      errorsBySeverity: filteredErrors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      topErrorPages: filteredErrors
        .filter(e => e.page)
        .reduce((acc, error) => {
          const page = error.page!;
          const existing = acc.find(p => p.page === page);
          if (existing) {
            existing.count += 1;
            if (error.severity === 'CRITICAL' || error.severity === 'HIGH') {
              existing.criticalCount += 1;
            }
          } else {
            acc.push({ 
              page, 
              count: 1, 
              criticalCount: (error.severity === 'CRITICAL' || error.severity === 'HIGH') ? 1 : 0 
            });
          }
          return acc;
        }, [] as Array<{ page: string; count: number; criticalCount: number }>)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      hourlyDistribution: filteredErrors.reduce((acc, error) => {
        const hour = new Date(error.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      uniqueUsers: new Set(filteredErrors.filter(e => e.userId).map(e => e.userId)).size,
      recentCriticalErrors: filteredErrors
        .filter(e => e.severity === 'CRITICAL')
        .slice(-10)
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentErrors: filteredErrors.slice(-50) // Son 50 hata
      }
    });
  } catch (error) {
    console.error('Error tracking okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
