import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

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

    // Admin paneline kullanıcıyı otomatik kaydet
    try {
      await fetch('http://localhost:3004/api/users/sync-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            password: hashedPassword,
            firstName: user.firstName,
            lastName: user.lastName,
            countryCode: user.countryCode,
            phone: user.phone,
            birthDay: user.birthDay,
            birthMonth: user.birthMonth,
            birthYear: user.birthYear,
            gender: user.gender,
            identityNumber: user.identityNumber,
            isForeigner: user.isForeigner,
            emailVerified: user.emailVerified,
            image: user.image,
            lastLoginAt: user.lastLoginAt,
            status: user.status,
            role: user.role,
            canDelete: user.canDelete,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        })
      });
      console.log('Kullanıcı admin paneline başarıyla kaydedildi');
    } catch (error) {
      console.error('Admin paneline kayıt hatası:', error);
      // Admin paneline kayıt başarısız olsa bile ana site kaydı devam etsin
    }

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
    console.error('Kullanıcı kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 