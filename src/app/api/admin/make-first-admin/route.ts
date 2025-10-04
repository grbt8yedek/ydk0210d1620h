import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    // En eski kullanıcıyı bul (ilk kayıt olan)
    const firstUser = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (!firstUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Kullanıcıyı admin ve silinmez olarak işaretle
    const updatedUser = await prisma.user.update({
      where: {
        id: firstUser.id
      },
      data: {
        role: 'admin',
        canDelete: false
      }
    });

    return NextResponse.json({
      message: 'İlk kullanıcı admin ve silinmez olarak işaretlendi',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        canDelete: updatedUser.canDelete
      }
    });
  } catch (error) {
    logger.error('Admin yapma hatası', { error });
    return NextResponse.json(
      { 
        error: 'İşlem sırasında bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
} 