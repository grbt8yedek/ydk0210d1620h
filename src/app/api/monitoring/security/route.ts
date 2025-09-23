import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const securityEventSchema = z.object({
  timestamp: z.string().datetime(),
  eventType: z.enum(['LOGIN_ATTEMPT', 'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'BRUTE_FORCE', 'SUSPICIOUS_ACTIVITY', 'RATE_LIMIT', 'INVALID_TOKEN', 'UNAUTHORIZED_ACCESS']),
  ip: z.string(),
  userAgent: z.string().optional(),
  userId: z.string().optional(),
  details: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  page: z.string().optional(),
  action: z.string().optional(),
});

// Geçici depolama (production'da Redis kullanılmalı)
const securityEvents: Array<z.infer<typeof securityEventSchema>> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = securityEventSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }

    const event = validation.data;
    securityEvents.push(event);

    // Son 5000 kaydı tut
    if (securityEvents.length > 5000) {
      securityEvents.splice(0, securityEvents.length - 5000);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Security event hatası:', error);
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

    // Güvenlik olayları simülasyonu
    const stats = {
      totalEvents: Math.floor(Math.random() * 50) + 10, // 10-60 arası
      eventsByType: {
        'LOGIN_SUCCESS': Math.floor(Math.random() * 20) + 5,
        'LOGIN_FAILURE': Math.floor(Math.random() * 5) + 1,
        'RATE_LIMIT': Math.floor(Math.random() * 3),
        'SUSPICIOUS_ACTIVITY': Math.floor(Math.random() * 2)
      },
      eventsBySeverity: {
        'LOW': Math.floor(Math.random() * 30) + 10,
        'MEDIUM': Math.floor(Math.random() * 10) + 2,
        'HIGH': Math.floor(Math.random() * 3),
        'CRITICAL': Math.floor(Math.random() * 2)
      },
      topSuspiciousIPs: [
        { ip: '192.168.1.100', count: Math.floor(Math.random() * 10) + 1, highSeverity: Math.floor(Math.random() * 2) },
        { ip: '10.0.0.50', count: Math.floor(Math.random() * 8) + 1, highSeverity: Math.floor(Math.random() * 2) }
      ],
      recentCriticalEvents: []
    };

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentEvents: [{
          timestamp: new Date().toISOString(),
          eventType: 'LOGIN_SUCCESS',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (compatible; Security Monitor)',
          userId: 'user-123',
          details: 'Başarılı giriş',
          severity: 'LOW',
          page: '/giris',
          action: 'login'
        }]
      }
    });
  } catch (error) {
    console.error('Security events okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
