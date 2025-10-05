import { NextRequest, NextResponse } from 'next/server';
import { cache, cacheKeys } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 30, 60000); // 30 req/min
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 });
    }

    const cacheKey = cacheKeys.agencyBalance();
    const cached = cache.get(cacheKey);
    
    if (cached) {
      logger.debug('Agency balance cache hit');
      return NextResponse.json(cached, {
        headers: { 'Cache-Control': 'public, max-age=300' }
      });
    }

    // Simulated agency balance data
    const balanceData = {
      balance: 15750.50,
      currency: 'TRY',
      lastUpdate: new Date().toISOString(),
      transactions: [
        { date: '2024-01-01', amount: -250.00, description: 'Bilet satışı' },
        { date: '2024-01-02', amount: 1000.00, description: 'Bakiye yükleme' }
      ]
    };

    // Cache for 5 minutes
    cache.set(cacheKey, balanceData, 300);
    logger.debug('Agency balance cached');

    return NextResponse.json(balanceData, {
      headers: { 'Cache-Control': 'public, max-age=300' }
    });

  } catch (error) {
    logger.error('Agency balance error:', error);
    return NextResponse.json(
      { error: 'Bakiye bilgisi alınamadı' },
      { status: 500 }
    );
  }
}
