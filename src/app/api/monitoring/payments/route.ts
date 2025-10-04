import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    
    // Basit simülasyon verisi
    const stats = {
      totalTransactions: Math.floor(Math.random() * 200) + 100,
      successfulPayments: Math.floor(Math.random() * 150) + 80,
      failedPayments: Math.floor(Math.random() * 50) + 20,
      successRate: Math.random() * 20 + 75,
      totalVolume: Math.random() * 50000 + 25000,
      averageTransactionValue: Math.random() * 500 + 250,
      eventsByType: {
        'PAYMENT_SUCCESS': Math.floor(Math.random() * 150) + 80,
        'PAYMENT_FAILED': Math.floor(Math.random() * 50) + 20,
        'PAYMENT_INITIATED': Math.floor(Math.random() * 200) + 100,
      },
      volumeByCurrency: {
        'EUR': Math.random() * 50000 + 25000,
      },
      paymentMethods: {
        'credit_card': Math.floor(Math.random() * 150) + 80,
      },
      topErrors: {
        'GENERIC_FAILURE': Math.floor(Math.random() * 50) + 20,
      },
      averageProcessingTime: Math.random() * 1000 + 500
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentEvents: []
      }
    });
  } catch (error) {
    logger.error('Payment events okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}