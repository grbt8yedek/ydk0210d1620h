import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    
    // Basit simülasyon verisi
    const stats = {
      totalRequests: Math.floor(Math.random() * 1000) + 500,
      averageLoadTime: Math.random() * 500 + 200,
      averageFCP: Math.random() * 200 + 100,
      averageLCP: Math.random() * 300 + 200,
      averageCLS: Math.random() * 0.1,
      slowestPages: [
        { page: '/flights/search', totalTime: Math.random() * 1000 + 500, count: Math.floor(Math.random() * 50) + 10, avgTime: Math.random() * 800 + 300 },
        { page: '/payment', totalTime: Math.random() * 800 + 400, count: Math.floor(Math.random() * 30) + 5, avgTime: Math.random() * 600 + 200 },
        { page: '/hesabim', totalTime: Math.random() * 600 + 300, count: Math.floor(Math.random() * 20) + 3, avgTime: Math.random() * 400 + 150 }
      ]
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentMetrics: [{
          timestamp: new Date().toISOString(),
          page: '/dashboard',
          loadTime: stats.averageLoadTime,
          firstContentfulPaint: stats.averageFCP,
          largestContentfulPaint: stats.averageLCP,
          cumulativeLayoutShift: stats.averageCLS,
          userAgent: 'Mozilla/5.0 (compatible; Monitoring)',
          connectionType: '4g',
          deviceType: 'desktop'
        }]
      }
    });
  } catch (error) {
    console.error('Performance metrics okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}