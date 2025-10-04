import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    
    // Basit simülasyon verisi
    const stats = {
      totalActivities: Math.floor(Math.random() * 500) + 200,
      uniqueUsers: Math.floor(Math.random() * 100) + 50,
      newRegistrations: Math.floor(Math.random() * 20) + 10,
      activeUsers: Math.floor(Math.random() * 80) + 40,
      activitiesByType: {
        'USER_REGISTERED': Math.floor(Math.random() * 20) + 10,
        'USER_LOGIN': Math.floor(Math.random() * 80) + 40,
        'PROFILE_UPDATED': Math.floor(Math.random() * 30) + 15,
        'PASSWORD_CHANGED': Math.floor(Math.random() * 10) + 5,
        'FLIGHT_SEARCH': Math.floor(Math.random() * 200) + 100,
        'BOOKING_CREATED': Math.floor(Math.random() * 50) + 25
      },
      hourlyDistribution: (() => {
        const distribution: Record<number, number> = {};
        for (let i = 0; i < 24; i++) {
          distribution[i] = Math.floor(Math.random() * 20) + 5;
        }
        return distribution;
      })(),
      topActiveUsers: [
        { userId: 'user_1', email: 'user1@example.com', count: 50, lastActivity: new Date().toISOString() },
        { userId: 'user_2', email: 'user2@example.com', count: 45, lastActivity: new Date().toISOString() },
      ],
      conversionMetrics: {
        searchesToBookings: Math.random() * 20 + 10,
        registrationToLogin: Math.random() * 80 + 60
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentActivities: []
      }
    });
  } catch (error) {
    logger.error('User activities okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}