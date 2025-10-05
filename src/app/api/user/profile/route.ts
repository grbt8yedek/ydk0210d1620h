import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { cache, cacheKeys } from '@/lib/cache';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const userId = session.user.id;
    const cacheKey = cacheKeys.userProfile(userId);

    // Cache'den kontrol et
    const cachedUser = cache.get(cacheKey);
    if (cachedUser) {
      logger.debug(`User profile cache hit: ${userId}`);
      return NextResponse.json(cachedUser, {
        headers: { 'Cache-Control': 'public, max-age=300' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        countryCode: true,
        birthDay: true,
        birthMonth: true,
        birthYear: true,
        gender: true,
        identityNumber: true,
        isForeigner: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    // Cache'e kaydet (5 dakika)
    cache.set(cacheKey, user, 300);
    logger.debug(`User profile cached: ${userId}`);

    return NextResponse.json(user, {
      headers: { 'Cache-Control': 'public, max-age=300' }
    });

  } catch (error) {
    logger.error('Kullanıcı profili hatası', { error });
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
