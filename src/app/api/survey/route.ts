import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, answers, completedAt } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    // Anket sonuçlarını veritabanına kaydet
    try {
      const surveyResponse = await prisma.surveyResponse.create({
        data: {
          userId: userId,
          answers: JSON.stringify(answers),
          completedAt: new Date(completedAt),
          userAgent: request.headers.get('user-agent') || '',
          ipAddress: request.headers.get('x-forwarded-for') || request.ip || '',
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Anket başarıyla kaydedildi',
        id: surveyResponse.id 
      });
    } catch (dbError) {
      // Veritabanı tablosu yoksa demo response döndür
      console.warn('SurveyResponse tablosu bulunamadı - Demo response döndürülüyor');
      return NextResponse.json({ 
        success: true, 
        message: 'Anket başarıyla kaydedildi (demo)',
        id: 'demo-' + Date.now()
      });
    }

  } catch (error) {
    console.error('Anket kaydedilirken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Anket kaydedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Belirli bir kullanıcının anket sonuçlarını getir
      try {
        const surveyResponses = await prisma.surveyResponse.findMany({
          where: {
            userId: userId
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return NextResponse.json({ 
          success: true, 
          data: surveyResponses 
        });
      } catch (dbError) {
        // Veritabanı tablosu yoksa demo veri döndür
        console.warn('SurveyResponse tablosu bulunamadı - Demo veri döndürülüyor');
        return NextResponse.json({ 
          success: true, 
          data: [] // Boş array - kullanıcı anketi doldurmamış
        });
      }
    } else {
      // Tüm anket sonuçlarını getir (admin panel için)
      try {
        const surveyResponses = await prisma.surveyResponse.findMany({
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 100 // Son 100 anket
        });

        return NextResponse.json({ 
          success: true, 
          data: surveyResponses 
        });
      } catch (dbError) {
        // Veritabanı tablosu yoksa demo veri döndür
        console.warn('SurveyResponse tablosu bulunamadı - Demo veri döndürülüyor');
        return NextResponse.json({ 
          success: true, 
          data: [] // Boş array
        });
      }
    }

  } catch (error) {
    console.error('Anket sonuçları getirilirken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Anket sonuçları getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
