import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { cache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 60, 60000); // 60 req/min
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 });
    }

    const cacheKey = 'system-status';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      logger.debug('System status cache hit');
      return NextResponse.json(cached, {
        headers: { 'Cache-Control': 'public, max-age=60' }
      });
    }

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalReservations,
      recentReservations,
      systemHealth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { lastLoginAt: { gte: last24Hours } }
      }),
      prisma.reservation.count(),
      prisma.reservation.count({
        where: { createdAt: { gte: last24Hours } }
      }),
      // System health check
      prisma.$queryRaw`SELECT 1 as health`.then(() => 'healthy').catch(() => 'unhealthy')
    ]);

    const status = {
      timestamp: now.toISOString(),
      users: {
        total: totalUsers,
        active24h: activeUsers
      },
      reservations: {
        total: totalReservations,
        recent24h: recentReservations
      },
      system: {
        status: systemHealth,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    };

    // Cache for 1 minute
    cache.set(cacheKey, status, 60);
    logger.debug('System status cached');

    return NextResponse.json(status, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    });

  } catch (error) {
    logger.error('System status error:', error);
    return NextResponse.json(
      { error: 'Sistem durumu alınamadı' },
      { status: 500 }
    );
  }
}
