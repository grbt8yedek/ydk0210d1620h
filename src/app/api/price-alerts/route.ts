import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

async function sendPriceAlertMail(to: string, alert: any) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: 'Gurbet.biz <no-reply@gurbet.biz>',
    to,
    subject: 'Fiyat Alarmınız Oluşturuldu',
    text: `Fiyat alarmınız başarıyla oluşturuldu!\n\nRota: ${alert.origin} -> ${alert.destination}\nTarih: ${alert.departureDate}${alert.targetPrice ? `\nHedef Fiyat: ${alert.targetPrice} EUR` : ''}`,
    html: `<b>Fiyat alarmınız başarıyla oluşturuldu!</b><br/>Rota: ${alert.origin} → ${alert.destination}<br/>Tarih: ${alert.departureDate}${alert.targetPrice ? `<br/>Hedef Fiyat: ${alert.targetPrice} EUR` : ''}`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { origin, destination, departureDate, targetPrice } = await req.json();
    if (!origin || !destination || !departureDate) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }
    const alert = await prisma.priceAlert.create({
      data: {
        userId: session.user.id,
        origin,
        destination,
        departureDate: new Date(departureDate),
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
      },
    });
    // E-posta gönderimi
    if (session.user.email) {
      try {
        await sendPriceAlertMail(session.user.email, alert);
      } catch (e) {
        logger.error('E-posta gönderilemedi', { error: e });
      }
    }
    return NextResponse.json({ success: true, alert });
  } catch (error: any) {
    logger.error('API error', { error });
    return NextResponse.json({ error: error?.message || 'Bilinmeyen hata' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const alerts = await prisma.priceAlert.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ alerts });
  } catch (error: any) {
    logger.error('API error', { error });
    return NextResponse.json({ error: error?.message || 'Bilinmeyen hata' }, { status: 500 });
  }
} 