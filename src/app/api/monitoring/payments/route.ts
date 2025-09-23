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

    // Veritabanından gerçek veri çek
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Rezervasyonları ödeme verisi olarak kullan
    const totalReservations = await prisma.reservation.count({
      where: {
        createdAt: {
          gte: cutoffTime
        }
      }
    });

    const successfulReservations = await prisma.reservation.count({
      where: {
        createdAt: {
          gte: cutoffTime
        },
        status: {
          in: ['confirmed', 'completed']
        }
      }
    });

    const failedReservations = await prisma.reservation.count({
      where: {
        createdAt: {
          gte: cutoffTime
        },
        status: 'cancelled'
      }
    });

    // Rezervasyon detaylarını çek
    const reservations = await prisma.reservation.findMany({
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
      take: 50
    });

    // İstatistikleri hesapla
    const stats = {
      totalTransactions: totalReservations,
      successfulPayments: successfulReservations,
      failedPayments: failedReservations,
      successRate: totalReservations > 0 ? (successfulReservations / totalReservations) * 100 : 0,
      totalVolume: reservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
      averageTransactionValue: successfulReservations > 0 ? 
        reservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0) / successfulReservations : 0,
      eventsByType: {
        'PAYMENT_SUCCESS': successfulReservations,
        'PAYMENT_FAILED': failedReservations
      },
      volumeByCurrency: {
        'EUR': reservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
      },
      paymentMethods: {
        'CARD': successfulReservations
      },
      topErrors: {},
      averageProcessingTime: 1500 // Demo değer
    };

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentEvents: reservations.map(r => ({
          timestamp: r.createdAt.toISOString(),
          eventType: r.status === 'confirmed' ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
          amount: r.totalAmount || 0,
          currency: 'EUR',
          paymentMethod: 'CARD',
          userId: r.userId,
          orderId: r.id,
          transactionId: r.pnr || r.id
        }))
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
