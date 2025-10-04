import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origin, destination, departureDate } = await req.json();
    if (!origin || !destination || !departureDate) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    const favorite = await prisma.searchFavorite.create({
      data: {
        userId: session.user.id,
        origin,
        destination,
        departureDate: new Date(departureDate),
      },
    });

    return NextResponse.json({ success: true, favorite });
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

    const favorites = await prisma.searchFavorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ favorites });
  } catch (error: any) {
    logger.error('API error', { error });
    return NextResponse.json({ error: error?.message || 'Bilinmeyen hata' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }

    const favorite = await prisma.searchFavorite.findUnique({ where: { id } });
    if (!favorite || favorite.userId !== session.user.id) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    await prisma.searchFavorite.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('API error', { error });
    return NextResponse.json({ error: error?.message || 'Bilinmeyen hata' }, { status: 500 });
  }
} 