import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const systemMetricsSchema = z.object({
  timestamp: z.string().datetime(),
  cpuUsage: z.number().min(0).max(100).optional(),
  memoryUsage: z.number().min(0).max(100).optional(),
  diskUsage: z.number().min(0).max(100).optional(),
  responseTime: z.number().positive().optional(),
  activeConnections: z.number().min(0).optional(),
  requestsPerMinute: z.number().min(0).optional(),
  uptime: z.number().positive().optional(),
  version: z.string().optional(),
  region: z.string().optional(),
});

// Geçici depolama (production'da Redis kullanılmalı)
const systemMetrics: Array<z.infer<typeof systemMetricsSchema>> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = systemMetricsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }

    const metrics = validation.data;
    systemMetrics.push(metrics);

    // Son 1000 kaydı tut
    if (systemMetrics.length > 1000) {
      systemMetrics.splice(0, systemMetrics.length - 1000);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('System metrics hatası:', error);
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

    const filteredMetrics = systemMetrics.filter(metric => 
      new Date(metric.timestamp) >= cutoffTime
    );

    // İstatistikleri hesapla
    const stats = {
      totalSamples: filteredMetrics.length,
      averageCpuUsage: filteredMetrics
        .filter(m => m.cpuUsage !== undefined)
        .reduce((sum, m) => sum + (m.cpuUsage || 0), 0) / 
        filteredMetrics.filter(m => m.cpuUsage !== undefined).length || 0,
      averageMemoryUsage: filteredMetrics
        .filter(m => m.memoryUsage !== undefined)
        .reduce((sum, m) => sum + (m.memoryUsage || 0), 0) / 
        filteredMetrics.filter(m => m.memoryUsage !== undefined).length || 0,
      averageDiskUsage: filteredMetrics
        .filter(m => m.diskUsage !== undefined)
        .reduce((sum, m) => sum + (m.diskUsage || 0), 0) / 
        filteredMetrics.filter(m => m.diskUsage !== undefined).length || 0,
      averageResponseTime: filteredMetrics
        .filter(m => m.responseTime !== undefined)
        .reduce((sum, m) => sum + (m.responseTime || 0), 0) / 
        filteredMetrics.filter(m => m.responseTime !== undefined).length || 0,
      averageRequestsPerMinute: filteredMetrics
        .filter(m => m.requestsPerMinute !== undefined)
        .reduce((sum, m) => sum + (m.requestsPerMinute || 0), 0) / 
        filteredMetrics.filter(m => m.requestsPerMinute !== undefined).length || 0,
      maxCpuUsage: Math.max(...filteredMetrics.filter(m => m.cpuUsage !== undefined).map(m => m.cpuUsage || 0)),
      maxMemoryUsage: Math.max(...filteredMetrics.filter(m => m.memoryUsage !== undefined).map(m => m.memoryUsage || 0)),
      maxResponseTime: Math.max(...filteredMetrics.filter(m => m.responseTime !== undefined).map(m => m.responseTime || 0)),
      currentUptime: filteredMetrics.length > 0 ? filteredMetrics[filteredMetrics.length - 1].uptime : 0,
      healthStatus: {
        cpu: filteredMetrics.length > 0 && (filteredMetrics[filteredMetrics.length - 1].cpuUsage || 0) < 80 ? 'HEALTHY' : 'WARNING',
        memory: filteredMetrics.length > 0 && (filteredMetrics[filteredMetrics.length - 1].memoryUsage || 0) < 85 ? 'HEALTHY' : 'WARNING',
        disk: filteredMetrics.length > 0 && (filteredMetrics[filteredMetrics.length - 1].diskUsage || 0) < 90 ? 'HEALTHY' : 'WARNING',
        responseTime: filteredMetrics.length > 0 && (filteredMetrics[filteredMetrics.length - 1].responseTime || 0) < 2000 ? 'HEALTHY' : 'WARNING'
      },
      hourlyTrends: (() => {
        const hourlyData = filteredMetrics.reduce((acc, metric) => {
          const hour = new Date(metric.timestamp).getHours();
          if (!acc[hour]) {
            acc[hour] = { cpu: [], memory: [], responseTime: [] };
          }
          if (metric.cpuUsage !== undefined) acc[hour].cpu.push(metric.cpuUsage);
          if (metric.memoryUsage !== undefined) acc[hour].memory.push(metric.memoryUsage);
          if (metric.responseTime !== undefined) acc[hour].responseTime.push(metric.responseTime);
          return acc;
        }, {} as Record<number, { cpu: number[]; memory: number[]; responseTime: number[] }>);

        // Ortalama değerlere dönüştür
        const processedTrends: Record<number, { cpu: number; memory: number; responseTime: number }> = {};
        Object.keys(hourlyData).forEach(hour => {
          const trends = hourlyData[parseInt(hour)];
          processedTrends[parseInt(hour)] = {
            cpu: trends.cpu.length > 0 ? trends.cpu.reduce((sum, val) => sum + val, 0) / trends.cpu.length : 0,
            memory: trends.memory.length > 0 ? trends.memory.reduce((sum, val) => sum + val, 0) / trends.memory.length : 0,
            responseTime: trends.responseTime.length > 0 ? trends.responseTime.reduce((sum, val) => sum + val, 0) / trends.responseTime.length : 0
          };
        });
        return processedTrends;
      })()
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentMetrics: filteredMetrics.slice(-50) // Son 50 ölçüm
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
