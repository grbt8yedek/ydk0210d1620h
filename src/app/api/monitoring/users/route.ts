import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const userActivitySchema = z.object({
  timestamp: z.string().datetime(),
  eventType: z.enum(['USER_REGISTERED', 'USER_LOGIN', 'USER_LOGOUT', 'PROFILE_UPDATED', 'PASSWORD_CHANGED', 'EMAIL_VERIFIED', 'ACCOUNT_DEACTIVATED', 'FLIGHT_SEARCH', 'BOOKING_CREATED', 'BOOKING_CANCELLED']),
  userId: z.string(),
  email: z.string().email().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  details: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Geçici depolama (production'da Redis kullanılmalı)
const userActivities: Array<z.infer<typeof userActivitySchema>> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = userActivitySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }

    const activity = validation.data;
    userActivities.push(activity);

    // Son 5000 kaydı tut
    if (userActivities.length > 5000) {
      userActivities.splice(0, userActivities.length - 5000);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User activity hatası:', error);
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
      case '30d':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Veritabanından gerçek veri çek
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const totalUsers = await prisma.user.count();
    const newRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: cutoffTime
        }
      }
    });

    // Son aktiviteleri çek (rezervasyonlar üzerinden)
    const recentReservations = await prisma.reservation.findMany({
      where: {
        createdAt: {
          gte: cutoffTime
        }
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    const activeUsers = new Set(recentReservations.map(r => r.userId)).size;

    // İstatistikleri hesapla
    const stats = {
      totalActivities: recentReservations.length,
      uniqueUsers: activeUsers,
      newRegistrations: newRegistrations,
      activeUsers: activeUsers,
      activitiesByType: {
        'BOOKING_CREATED': recentReservations.length,
        'USER_REGISTERED': newRegistrations
      },
      hourlyDistribution: recentReservations.reduce((acc, reservation) => {
        const hour = new Date(reservation.createdAt).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      topActiveUsers: recentReservations
        .reduce((acc, reservation) => {
          const existing = acc.find(u => u.userId === reservation.userId);
          if (existing) {
            existing.count += 1;
            existing.lastActivity = reservation.createdAt.toISOString();
          } else {
            acc.push({ 
              userId: reservation.userId, 
              email: reservation.user.email,
              count: 1, 
              lastActivity: reservation.createdAt.toISOString()
            });
          }
          return acc;
        }, [] as Array<{ userId: string; email?: string; count: number; lastActivity: string }>)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      conversionMetrics: {
        searchesToBookings: recentReservations.length > 0 ? 100 : 0, // Basit hesaplama
        registrationToLogin: newRegistrations > 0 ? 100 : 0
      }
    };

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentActivities: recentReservations.map(r => ({
          timestamp: r.createdAt.toISOString(),
          eventType: 'BOOKING_CREATED',
          userId: r.userId,
          email: r.user.email,
          details: `Rezervasyon oluşturuldu: ${r.pnr || 'N/A'}`
        }))
      }
    });
  } catch (error) {
    console.error('User activities okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
