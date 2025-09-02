import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('API: Session user ID:', session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    console.log('API: Type filter:', type);

    const reservations = await prisma.reservation.findMany({
      where: { 
        userId: session.user.id,
        ...(type && { type })
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('API: Found reservations:', reservations.length);
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Rezervasyon getirme hatası:', error);
    return NextResponse.json({ error: 'Rezervasyonlar yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Rezervasyon oluşturma isteği:', body);

    const reservation = await prisma.reservation.create({
      data: {
        userId: session.user.id,
        type: body.type,
        status: body.status,
        amount: body.amount,
        currency: body.currency,
        biletDukkaniOrderId: body.biletDukkaniOrderId,
        biletDukkaniRouteId: body.biletDukkaniRouteId,
        pnr: body.pnr,
        // Bilet Dükkanı API'sinden gelen ek bilgiler
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        passengers: body.passengers,
        flightNumber: body.flightNumber,
        origin: body.origin,
        destination: body.destination,
        departureTime: new Date(body.departureTime),
        arrivalTime: new Date(body.arrivalTime),
        airline: body.airline,
      }
    });

    console.log('Rezervasyon başarıyla oluşturuldu:', reservation);
    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Rezervasyon oluşturma hatası:', error);
    console.error('Hata detayı:', error.message);
    return NextResponse.json({ error: 'Rezervasyon oluşturulurken bir hata oluştu.', details: error.message }, { status: 500 });
  }
}
