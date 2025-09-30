import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { logger } from '@/utils/error';

export async function POST(request: Request) {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      countryCode, 
      phone, 
      birthDay, 
      birthMonth, 
      birthYear, 
      gender, 
      identityNumber, 
      isForeigner 
    } = await request.json();

    // Basit validasyon
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz' },
        { status: 400 }
      );
    }

    // Email kullanımda mı kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        countryCode,
        phone,
        birthDay,
        birthMonth,
        birthYear,
        gender,
        identityNumber,
        isForeigner: isForeigner || false,
        status: 'active'
      }
    });

    // NOT: Admin panel ve ana site aynı Neon PostgreSQL database'ini kullanıyor
    // Bu yüzden ayrıca HTTP sync'e gerek yok - kullanıcı zaten her iki panelde de görünüyor

    logger.info('Yeni kullanıcı kaydedildi:', { email: user.email, id: user.id });

    return NextResponse.json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    logger.error('Kullanıcı kayıt hatası:', {
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
