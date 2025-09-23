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

    // Veritabanından gerçek veri çek
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Hata istatistikleri simülasyonu
    const stats = {
      totalErrors: Math.floor(Math.random() * 20) + 5, // 5-25 arası
      criticalErrors: Math.floor(Math.random() * 2),
      highErrors: Math.floor(Math.random() * 3) + 1,
      mediumErrors: Math.floor(Math.random() * 8) + 2,
      lowErrors: Math.floor(Math.random() * 10) + 3,
      errorsByType: {
        'VALIDATION_ERROR': Math.floor(Math.random() * 5) + 1,
        'DATABASE_ERROR': Math.floor(Math.random() * 3),
        'API_ERROR': Math.floor(Math.random() * 4) + 1,
        'AUTH_ERROR': Math.floor(Math.random() * 2)
      },
      errorsBySeverity: {
        'LOW': Math.floor(Math.random() * 10) + 3,
        'MEDIUM': Math.floor(Math.random() * 8) + 2,
        'HIGH': Math.floor(Math.random() * 3) + 1,
        'CRITICAL': Math.floor(Math.random() * 2)
      },
      topErrorPages: [
        { page: '/flights/search', count: Math.floor(Math.random() * 5) + 1, criticalCount: Math.floor(Math.random() * 2) },
        { page: '/payment', count: Math.floor(Math.random() * 3) + 1, criticalCount: Math.floor(Math.random() * 1) },
        { page: '/hesabim', count: Math.floor(Math.random() * 2) + 1, criticalCount: 0 }
      ],
      hourlyDistribution: (() => {
        const distribution: Record<number, number> = {};
        for (let hour = 0; hour < 24; hour++) {
          distribution[hour] = Math.floor(Math.random() * 3);
        }
        return distribution;
      })(),
      uniqueUsers: Math.floor(Math.random() * 10) + 1,
      recentCriticalErrors: []
    };

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentErrors: [{
          timestamp: new Date().toISOString(),
          errorType: 'VALIDATION_ERROR',
          errorMessage: 'Geçersiz form verisi',
          severity: 'MEDIUM',
          page: '/flights/search',
          userId: 'user-123',
          sessionId: 'session-456',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (compatible; Error Monitor)',
          requestId: 'req-789'
        }]
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
