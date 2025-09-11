import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // Toplam kullanıcı sayısı
    const totalUsers = await prisma.user.count();

    // Son 24 saatte aktif kullanıcılar (son giriş yapanlar)
    const activeUsers24h = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: last24Hours
        }
      }
    });

    // Son 1 saatte aktif kullanıcılar
    const activeUsers1h = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: lastHour
        }
      }
    });

    // Aktif kullanıcılar (status = 'active')
    const activeUsers = await prisma.user.count({
      where: {
        status: 'active'
      }
    });

    // Son 7 günlük kullanıcı kayıtları
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newUsers7Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: last7Days
        }
      }
    });

    // Son 30 günlük kullanıcı kayıtları
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const newUsers30Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: last30Days
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        activeUsers24h,
        activeUsers1h,
        newUsers7Days,
        newUsers30Days,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Active users error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Aktif kullanıcı bilgileri alınamadı' 
      },
      { status: 500 }
    );
  }
}


