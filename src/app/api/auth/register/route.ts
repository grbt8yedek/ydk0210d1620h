import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { logger } from '@/utils/error';
import { ApiError, successResponse, ErrorCode } from '@/utils/errorResponse';

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

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return ApiError.missingField('Tüm zorunlu alanlar');
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ApiError.invalidInput('Geçersiz email adresi');
    }

    // Email kullanımda mı kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return ApiError.alreadyExists('Email adresi');
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

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    }, 'Kullanıcı başarıyla oluşturuldu');
    
  } catch (error) {
    return ApiError.databaseError(error as Error);
  }
}
