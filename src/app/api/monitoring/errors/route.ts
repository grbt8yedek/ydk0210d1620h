import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    
    // Zaman aralığını hesapla
    const now = new Date();
    const hours = timeframe === '1h' ? 1 : timeframe === '7d' ? 168 : 24;
    const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));

    // Gerçek hata verilerini topla
    const [
      errorLogs,
      criticalLogs,
      allUsers
    ] = await Promise.all([
      prisma.systemLog.findMany({
        where: { 
          createdAt: { gte: startTime },
          level: { in: ['error', 'warn', 'fatal'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 200
      }),
      prisma.systemLog.findMany({
        where: { 
          createdAt: { gte: startTime },
          level: 'fatal'
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startTime } },
        select: { id: true }
      })
    ]);

    // Hata tiplerini analiz et
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {
      'CRITICAL': 0,
      'HIGH': 0,
      'MEDIUM': 0,
      'LOW': 0
    };

    // Log'ları analiz et
    errorLogs.forEach(log => {
      // Hata tiplerini say
      const errorType = log.source || 'Unknown';
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;

      // Severity'e göre say
      if (log.level === 'fatal') errorsBySeverity.CRITICAL++;
      else if (log.level === 'error') errorsBySeverity.HIGH++;
      else if (log.level === 'warn') errorsBySeverity.MEDIUM++;
      else errorsBySeverity.LOW++;
    });

    // En çok hata veren sayfalar (simüle)
    const pageErrors = [
      { page: '/flights/search', count: Math.floor(errorLogs.length * 0.3), criticalCount: Math.floor(criticalLogs.length * 0.4) },
      { page: '/payment', count: Math.floor(errorLogs.length * 0.2), criticalCount: Math.floor(criticalLogs.length * 0.3) },
      { page: '/hesabim', count: Math.floor(errorLogs.length * 0.15), criticalCount: Math.floor(criticalLogs.length * 0.2) },
      { page: '/ops-admin', count: Math.floor(errorLogs.length * 0.1), criticalCount: Math.floor(criticalLogs.length * 0.1) }
    ];

    const stats = {
      totalErrors: errorLogs.length,
      criticalErrors: criticalLogs.length,
      highErrors: errorLogs.filter(log => log.level === 'error').length,
      mediumErrors: errorLogs.filter(log => log.level === 'warn').length,
      lowErrors: errorLogs.filter(log => log.level === 'info').length,
      errorsByType,
      errorsBySeverity,
      topErrorPages: pageErrors,
      hourlyDistribution: (() => {
        const distribution: Record<number, number> = {};
        for (let i = 0; i < 24; i++) {
          const hourErrors = errorLogs.filter(log => 
            new Date(log.createdAt).getHours() === i
          ).length;
          distribution[i] = hourErrors;
        }
        return distribution;
      })(),
      uniqueUsers: allUsers.length,
      recentCriticalErrors: criticalLogs.map(log => ({
        timestamp: log.createdAt.toISOString(),
        errorType: log.source || 'Unknown',
        message: log.message.substring(0, 100),
        severity: 'CRITICAL',
        page: '/unknown'
      }))
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentErrors: stats.recentCriticalErrors
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

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}