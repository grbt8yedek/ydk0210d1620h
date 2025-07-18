import { NextResponse } from 'next/server';
import { validate } from '@/utils/validation';
import { userSchema } from '@/utils/validation';
import { logger } from '@/utils/error';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Input validation
    await validate(userSchema.login, body);
    const { email, password } = body;

    // Veritabanından kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (user && user.password) {
      // Şifreyi karşılaştır
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        logger.info(`Başarılı giriş: ${email}`);
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone
          }
        });
      }
    }

    logger.warn(`Başarısız giriş denemesi: ${email}`);
    return NextResponse.json({
      success: false,
      message: 'Geçersiz e-posta veya şifre'
    }, { status: 401 });

  } catch (error) {
    logger.error('Giriş hatası:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Bir hata oluştu'
    }, { status: 500 });
  }
} 