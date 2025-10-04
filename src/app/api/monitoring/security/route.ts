import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    
    // Zaman aralığını hesapla
    const now = new Date();
    const hours = timeframe === '1h' ? 1 : timeframe === '7d' ? 168 : 24;
    const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));

    // Güvenlik verilerini topla
    const [
      totalUsers,
      recentLogins,
      failedLogins,
      suspiciousActivities
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { 
          lastLoginAt: { gte: startTime }
        }
      }),
      prisma.systemLog.count({
        where: { 
          timestamp: { gte: startTime },
          level: 'error',
          source: 'auth'
        }
      }),
      prisma.systemLog.count({
        where: { 
          timestamp: { gte: startTime },
          level: 'warn',
          message: { contains: 'suspicious' }
        }
      })
    ]);

    // Güvenlik skorlarını hesapla (0-100)
    const loginSuccessRate = recentLogins > 0 ? Math.max(0, 100 - (failedLogins / recentLogins * 100)) : 100;
    const threatLevel = suspiciousActivities > 10 ? 'HIGH' : suspiciousActivities > 5 ? 'MEDIUM' : 'LOW';
    const securityScore = Math.round((loginSuccessRate * 0.6) + (threatLevel === 'LOW' ? 40 : threatLevel === 'MEDIUM' ? 20 : 0));

    const stats = {
      securityScore,
      threatLevel,
      loginSuccessRate: Math.round(loginSuccessRate),
      failedLogins,
      suspiciousActivities,
      recentLogins,
      isRisky: securityScore < 70 || threatLevel === 'HIGH',
      metrics: {
        authSecurity: loginSuccessRate > 90 ? 'GOOD' : loginSuccessRate > 70 ? 'WARNING' : 'CRITICAL',
        threatDetection: threatLevel === 'LOW' ? 'GOOD' : threatLevel === 'MEDIUM' ? 'WARNING' : 'CRITICAL',
        userActivity: recentLogins > totalUsers * 0.1 ? 'GOOD' : 'LOW'
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats
      }
    });
  } catch (error) {
    logger.error('Security metrics okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}