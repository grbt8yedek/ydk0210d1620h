import { NextResponse } from 'next/server';
import { signIn } from 'next-auth/react';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email ve şifre gerekli' }, { status: 400 });
    }

    // Admin email kontrolü
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean);

    const isAdminEmail = email.includes('grbt8') || 
                         email.includes('admin') ||
                         adminEmails.includes(email.toLowerCase());

    if (!isAdminEmail) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Geçersiz şifre' }, { status: 401 });
    }

    // Başarılı giriş - session bilgilerini döndür
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
