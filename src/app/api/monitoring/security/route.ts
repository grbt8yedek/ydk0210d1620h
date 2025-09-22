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
    const severity = searchParams.get('severity');
    
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

    let filteredEvents = securityEvents.filter(event => 
      new Date(event.timestamp) >= cutoffTime
    );

    if (severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === severity);
    }

    // İstatistikleri hesapla
    const stats = {
      totalEvents: filteredEvents.length,
      eventsByType: filteredEvents.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      eventsBySeverity: filteredEvents.reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      topSuspiciousIPs: filteredEvents
        .reduce((acc, event) => {
          const existing = acc.find(ip => ip.ip === event.ip);
          if (existing) {
            existing.count += 1;
            if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
              existing.highSeverity += 1;
            }
          } else {
            acc.push({ 
              ip: event.ip, 
              count: 1, 
              highSeverity: (event.severity === 'HIGH' || event.severity === 'CRITICAL') ? 1 : 0 
            });
          }
          return acc;
        }, [] as Array<{ ip: string; count: number; highSeverity: number }>)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      recentCriticalEvents: filteredEvents
        .filter(event => event.severity === 'CRITICAL')
        .slice(-10)
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentEvents: filteredEvents.slice(-100) // Son 100 olay
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
