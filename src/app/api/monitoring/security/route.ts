import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    
    // Basit simülasyon verisi
    const stats = {
      totalSecurityEvents: Math.floor(Math.random() * 100) + 50,
      loginAttempts: Math.floor(Math.random() * 200) + 100,
      successfulLogins: Math.floor(Math.random() * 150) + 80,
      failedLogins: Math.floor(Math.random() * 50) + 20,
      passwordResetRequests: Math.floor(Math.random() * 30) + 10,
      suspiciousActivities: Math.floor(Math.random() * 10) + 5,
      bruteForceAttempts: Math.floor(Math.random() * 5) + 2,
      securityScore: Math.max(100 - (Math.random() * 30), 70),
      eventsByType: {
        'LOGIN_SUCCESS': Math.floor(Math.random() * 150) + 80,
        'LOGIN_FAILURE': Math.floor(Math.random() * 50) + 20,
        'PASSWORD_RESET': Math.floor(Math.random() * 30) + 10,
        'SUSPICIOUS_ACTIVITY': Math.floor(Math.random() * 10) + 5,
        'BRUTE_FORCE': Math.floor(Math.random() * 5) + 2
      },
      hourlyDistribution: (() => {
        const distribution: Record<number, number> = {};
        for (let i = 0; i < 24; i++) {
          distribution[i] = Math.floor(Math.random() * 10) + 1;
        }
        return distribution;
      })(),
      topThreats: [
        { type: 'Failed Login Attempts', count: Math.floor(Math.random() * 50) + 20, severity: 'MEDIUM' },
        { type: 'Password Reset Requests', count: Math.floor(Math.random() * 30) + 10, severity: 'LOW' },
        { type: 'Suspicious IP Activity', count: Math.floor(Math.random() * 10) + 5, severity: 'HIGH' }
      ],
      recentEvents: [
        {
          timestamp: new Date().toISOString(),
          eventType: 'LOGIN_SUCCESS',
          ip: '192.168.1.100',
          userId: 'user_' + Math.floor(Math.random() * 100),
          severity: 'LOW',
          details: 'Successful login'
        },
        {
          timestamp: new Date().toISOString(),
          eventType: 'LOGIN_FAILURE',
          ip: '192.168.1.101',
          userId: null,
          severity: 'MEDIUM',
          details: 'Failed login attempt'
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats
      }
    });
  } catch (error) {
    console.error('Security monitoring okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}