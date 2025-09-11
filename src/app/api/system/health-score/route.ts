import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import os from 'os';

export async function GET() {
  try {
    let healthScore = 100;
    const issues: string[] = [];

    // Veritabanı bağlantısı kontrolü
    try {
      await prisma.user.count();
    } catch (error) {
      healthScore -= 30;
      issues.push('Veritabanı bağlantısı sorunu');
    }

    // Bellek kullanımı kontrolü
    const memoryUsage = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
    if (memoryUsage > 90) {
      healthScore -= 20;
      issues.push('Yüksek bellek kullanımı');
    } else if (memoryUsage > 80) {
      healthScore -= 10;
      issues.push('Orta seviye bellek kullanımı');
    }

    // CPU yükü kontrolü
    const loadAverage = os.loadavg()[0];
    const cpuCores = os.cpus().length;
    const cpuUsage = (loadAverage / cpuCores) * 100;
    
    if (cpuUsage > 80) {
      healthScore -= 15;
      issues.push('Yüksek CPU kullanımı');
    } else if (cpuUsage > 60) {
      healthScore -= 8;
      issues.push('Orta seviye CPU kullanımı');
    }

    // Disk alanı kontrolü (basit)
    const freeSpace = os.freemem();
    const totalSpace = os.totalmem();
    const diskUsage = ((totalSpace - freeSpace) / totalSpace) * 100;
    
    if (diskUsage > 95) {
      healthScore -= 25;
      issues.push('Disk alanı kritik seviyede');
    } else if (diskUsage > 85) {
      healthScore -= 15;
      issues.push('Disk alanı azalıyor');
    }

    // Sistem durumu belirleme
    let status = 'İyi';
    if (healthScore < 50) {
      status = 'Kritik';
    } else if (healthScore < 70) {
      status = 'Uyarı';
    } else if (healthScore < 90) {
      status = 'Orta';
    }

    return NextResponse.json({
      success: true,
      data: {
        score: Math.max(0, healthScore),
        status,
        issues,
        metrics: {
          memoryUsage: Math.round(memoryUsage),
          cpuUsage: Math.round(cpuUsage),
          diskUsage: Math.round(diskUsage),
          loadAverage: Math.round(loadAverage * 100) / 100
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Health score error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Sağlık skoru hesaplanamadı' 
      },
      { status: 500 }
    );
  }
}


