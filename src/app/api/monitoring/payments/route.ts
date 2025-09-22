import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const paymentEventSchema = z.object({
  timestamp: z.string().datetime(),
  eventType: z.enum(['PAYMENT_INITIATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED', 'CARD_TOKENIZED', 'THREE_D_INITIATED', 'THREE_D_COMPLETED', 'THREE_D_FAILED']),
  amount: z.number().positive(),
  currency: z.string(),
  paymentMethod: z.string(),
  userId: z.string().optional(),
  orderId: z.string().optional(),
  transactionId: z.string().optional(),
  cardMasked: z.string().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  processingTime: z.number().optional(),
  ip: z.string().optional(),
});

// Geçici depolama (production'da Redis kullanılmalı)
const paymentEvents: Array<z.infer<typeof paymentEventSchema>> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = paymentEventSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }

    const event = validation.data;
    paymentEvents.push(event);

    // Son 2000 kaydı tut
    if (paymentEvents.length > 2000) {
      paymentEvents.splice(0, paymentEvents.length - 2000);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment event hatası:', error);
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
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    let filteredEvents = paymentEvents.filter(event => 
      new Date(event.timestamp) >= cutoffTime
    );

    if (eventType) {
      filteredEvents = filteredEvents.filter(event => event.eventType === eventType);
    }

    // İstatistikleri hesapla
    const successfulPayments = filteredEvents.filter(e => e.eventType === 'PAYMENT_SUCCESS');
    const failedPayments = filteredEvents.filter(e => e.eventType === 'PAYMENT_FAILED');
    
    const stats = {
      totalTransactions: filteredEvents.length,
      successfulPayments: successfulPayments.length,
      failedPayments: failedPayments.length,
      successRate: successfulPayments.length / (successfulPayments.length + failedPayments.length) * 100 || 0,
      totalVolume: successfulPayments.reduce((sum, payment) => sum + payment.amount, 0),
      averageTransactionValue: successfulPayments.reduce((sum, payment) => sum + payment.amount, 0) / successfulPayments.length || 0,
      eventsByType: filteredEvents.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      volumeByCurrency: successfulPayments.reduce((acc, payment) => {
        acc[payment.currency] = (acc[payment.currency] || 0) + payment.amount;
        return acc;
      }, {} as Record<string, number>),
      paymentMethods: successfulPayments.reduce((acc, payment) => {
        acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      topErrors: failedPayments
        .reduce((acc, payment) => {
          const errorKey = payment.errorCode || 'UNKNOWN';
          acc[errorKey] = (acc[errorKey] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      averageProcessingTime: successfulPayments
        .filter(p => p.processingTime)
        .reduce((sum, p) => sum + (p.processingTime || 0), 0) / 
        successfulPayments.filter(p => p.processingTime).length || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentEvents: filteredEvents.slice(-50) // Son 50 olay
      }
    });
  } catch (error) {
    console.error('Payment events okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
