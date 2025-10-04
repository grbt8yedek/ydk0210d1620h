import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Sistem bilgilerini topla
    const systemInfo = {
      // Sunucu bilgileri
      serverStatus: 'active',
      version: '1.0.0',
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      
      // Bellek kullanımı
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      },
      
      // CPU bilgileri
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown',
        loadAverage: os.loadavg()
      },
      
      // Disk kullanımı (veritabanı dosyası)
      disk: {
        dbPath: '/Users/incesu/Desktop/grbt8/prisma/dev.db',
        dbSize: 0
      },
      
      // Ağ bilgileri
      network: {
        hostname: os.hostname(),
        interfaces: os.networkInterfaces()
      },
      
      // Veritabanı durumu
      database: {
        status: 'connected',
        userCount: 0,
        reservationCount: 0,
        paymentCount: 0
      },
      
      // Son güncelleme
      lastUpdate: new Date().toISOString()
    };

    // Veritabanı istatistikleri
    try {
      const userCount = await prisma.user.count();
      const reservationCount = await prisma.reservation.count();
      const paymentCount = await prisma.payment.count();
      
      systemInfo.database.userCount = userCount;
      systemInfo.database.reservationCount = reservationCount;
      systemInfo.database.paymentCount = paymentCount;
    } catch (error) {
      logger.error('Database stats error:', error);
      systemInfo.database.status = 'error';
    }

    // Veritabanı dosya boyutu
    try {
      const dbPath = '/Users/incesu/Desktop/grbt8/prisma/dev.db';
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        systemInfo.disk.dbSize = stats.size;
      }
    } catch (error) {
      logger.error('Disk size error:', error);
    }

    return NextResponse.json({
      success: true,
      data: systemInfo
    });

  } catch (error) {
    logger.error('System status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Sistem durumu alınamadı' 
      },
      { status: 500 }
    );
  }
}


