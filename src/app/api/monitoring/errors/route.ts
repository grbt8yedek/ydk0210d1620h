import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    
    // Basit simülasyon verisi
    const stats = {
      totalErrors: Math.floor(Math.random() * 50) + 20,
      criticalErrors: Math.floor(Math.random() * 5) + 2,
      highErrors: Math.floor(Math.random() * 10) + 5,
      mediumErrors: Math.floor(Math.random() * 20) + 10,
      lowErrors: Math.floor(Math.random() * 15) + 5,
      errorsByType: {
        'TypeError': Math.floor(Math.random() * 10) + 5,
        'ReferenceError': Math.floor(Math.random() * 8) + 3,
        'NetworkError': Math.floor(Math.random() * 12) + 6,
        'ValidationError': Math.floor(Math.random() * 15) + 8
      },
      errorsBySeverity: {
        'CRITICAL': Math.floor(Math.random() * 5) + 2,
        'HIGH': Math.floor(Math.random() * 10) + 5,
        'MEDIUM': Math.floor(Math.random() * 20) + 10,
        'LOW': Math.floor(Math.random() * 15) + 5
      },
      topErrorPages: [
        { page: '/flights/search', count: Math.floor(Math.random() * 15) + 8, criticalCount: Math.floor(Math.random() * 3) + 1 },
        { page: '/payment', count: Math.floor(Math.random() * 12) + 6, criticalCount: Math.floor(Math.random() * 2) + 1 },
        { page: '/hesabim', count: Math.floor(Math.random() * 10) + 5, criticalCount: Math.floor(Math.random() * 2) }
      ],
      hourlyDistribution: (() => {
        const distribution: Record<number, number> = {};
        for (let i = 0; i < 24; i++) {
          distribution[i] = Math.floor(Math.random() * 5) + 1;
        }
        return distribution;
      })(),
      uniqueUsers: Math.floor(Math.random() * 20) + 10,
      recentCriticalErrors: []
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentErrors: []
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