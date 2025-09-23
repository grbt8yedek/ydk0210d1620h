import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    
    // Basit simülasyon verisi
    const stats = {
      totalSamples: Math.floor(Math.random() * 1000) + 500,
      averageCpuUsage: Math.random() * 40 + 20,
      averageMemoryUsage: Math.random() * 30 + 30,
      averageDiskUsage: Math.random() * 20 + 10,
      averageResponseTime: Math.random() * 100 + 50,
      activeConnections: Math.floor(Math.random() * 200) + 50,
      requestsPerMinute: Math.floor(Math.random() * 500) + 100,
      currentUptime: Math.floor(Math.random() * 86400) + 3600,
      healthStatus: {
        cpu: 'HEALTHY',
        memory: 'HEALTHY',
        disk: 'HEALTHY',
        responseTime: 'HEALTHY'
      },
      hourlyTrends: (() => {
        const hourlyData: Record<number, { cpu: number; memory: number; responseTime: number }> = {};
        for (let i = 0; i < 24; i++) {
          hourlyData[i] = {
            cpu: Math.random() * 40 + 20,
            memory: Math.random() * 30 + 30,
            responseTime: Math.random() * 100 + 50
          };
        }
        return hourlyData;
      })()
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentMetrics: [{
          timestamp: new Date().toISOString(),
          cpuUsage: stats.averageCpuUsage,
          memoryUsage: stats.averageMemoryUsage,
          diskUsage: stats.averageDiskUsage,
          responseTime: stats.averageResponseTime,
          activeConnections: stats.activeConnections,
          requestsPerMinute: stats.requestsPerMinute,
          uptime: stats.currentUptime,
          version: '1.0.0',
          region: 'eu-central-1'
        }]
      }
    });
  } catch (error) {
    console.error('System metrics okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}