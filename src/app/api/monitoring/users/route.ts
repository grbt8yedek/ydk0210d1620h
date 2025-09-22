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
    const eventType = searchParams.get('eventType');
    
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

    let filteredActivities = userActivities.filter(activity => 
      new Date(activity.timestamp) >= cutoffTime
    );

    if (eventType) {
      filteredActivities = filteredActivities.filter(activity => activity.eventType === eventType);
    }

    // İstatistikleri hesapla
    const stats = {
      totalActivities: filteredActivities.length,
      uniqueUsers: new Set(filteredActivities.map(a => a.userId)).size,
      newRegistrations: filteredActivities.filter(a => a.eventType === 'USER_REGISTERED').length,
      activeUsers: new Set(filteredActivities.filter(a => a.eventType === 'USER_LOGIN').map(a => a.userId)).size,
      activitiesByType: filteredActivities.reduce((acc, activity) => {
        acc[activity.eventType] = (acc[activity.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      hourlyDistribution: filteredActivities.reduce((acc, activity) => {
        const hour = new Date(activity.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      topActiveUsers: filteredActivities
        .reduce((acc, activity) => {
          const existing = acc.find(u => u.userId === activity.userId);
          if (existing) {
            existing.count += 1;
            existing.lastActivity = activity.timestamp;
          } else {
            acc.push({ 
              userId: activity.userId, 
              email: activity.email,
              count: 1, 
              lastActivity: activity.timestamp 
            });
          }
          return acc;
        }, [] as Array<{ userId: string; email?: string; count: number; lastActivity: string }>)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      conversionMetrics: {
        searchesToBookings: filteredActivities.filter(a => a.eventType === 'BOOKING_CREATED').length / 
          filteredActivities.filter(a => a.eventType === 'FLIGHT_SEARCH').length * 100 || 0,
        registrationToLogin: filteredActivities.filter(a => a.eventType === 'USER_LOGIN').length / 
          filteredActivities.filter(a => a.eventType === 'USER_REGISTERED').length * 100 || 0
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentActivities: filteredActivities.slice(-100) // Son 100 aktivite
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
