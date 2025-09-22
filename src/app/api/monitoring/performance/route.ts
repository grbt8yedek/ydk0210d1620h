import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const performanceMetricsSchema = z.object({
  timestamp: z.string().datetime(),
  page: z.string(),
  loadTime: z.number().positive(),
  firstContentfulPaint: z.number().positive().optional(),
  largestContentfulPaint: z.number().positive().optional(),
  cumulativeLayoutShift: z.number().optional(),
  firstInputDelay: z.number().optional(),
  timeToInteractive: z.number().positive().optional(),
  userAgent: z.string().optional(),
  connectionType: z.string().optional(),
  deviceType: z.string().optional(),
});

// Geçici depolama (production'da Redis kullanılmalı)
const performanceData: Array<z.infer<typeof performanceMetricsSchema>> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = performanceMetricsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }

    const metrics = validation.data;
    performanceData.push(metrics);

    // Son 1000 kaydı tut
    if (performanceData.length > 1000) {
      performanceData.splice(0, performanceData.length - 1000);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Performance metrics hatası:', error);
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
    const page = searchParams.get('page');
    
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

    let filteredData = performanceData.filter(metric => 
      new Date(metric.timestamp) >= cutoffTime
    );

    if (page) {
      filteredData = filteredData.filter(metric => metric.page.includes(page));
    }

    // İstatistikleri hesapla
    const stats = {
      totalRequests: filteredData.length,
      averageLoadTime: filteredData.reduce((sum, m) => sum + m.loadTime, 0) / filteredData.length || 0,
      averageFCP: filteredData.filter(m => m.firstContentfulPaint).reduce((sum, m) => sum + (m.firstContentfulPaint || 0), 0) / filteredData.filter(m => m.firstContentfulPaint).length || 0,
      averageLCP: filteredData.filter(m => m.largestContentfulPaint).reduce((sum, m) => sum + (m.largestContentfulPaint || 0), 0) / filteredData.filter(m => m.largestContentfulPaint).length || 0,
      averageCLS: filteredData.filter(m => m.cumulativeLayoutShift).reduce((sum, m) => sum + (m.cumulativeLayoutShift || 0), 0) / filteredData.filter(m => m.cumulativeLayoutShift).length || 0,
      slowestPages: filteredData
        .reduce((acc, metric) => {
          const existing = acc.find(p => p.page === metric.page);
          if (existing) {
            existing.totalTime += metric.loadTime;
            existing.count += 1;
            existing.avgTime = existing.totalTime / existing.count;
          } else {
            acc.push({ page: metric.page, totalTime: metric.loadTime, count: 1, avgTime: metric.loadTime });
          }
          return acc;
        }, [] as Array<{ page: string; totalTime: number; count: number; avgTime: number }>)
        .sort((a, b) => b.avgTime - a.avgTime)
        .slice(0, 10)
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentMetrics: filteredData.slice(-50) // Son 50 kayıt
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
