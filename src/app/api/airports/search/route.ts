import { NextResponse } from 'next/server';
import { logger } from '@/utils/error';

// Airport arama için server-side proxy
// API key'i client-side'da expose etmeden kullan

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        data: []
      });
    }

    // Server-side API key kullanımı (güvenli)
    const API_KEY = process.env.FLIGHT_API_KEY;

    if (!API_KEY) {
      logger.error('FLIGHT_API_KEY tanımlı değil');
      return NextResponse.json({
        success: false,
        error: 'API key yapılandırılmamış'
      }, { status: 500 });
    }

    // Bilet Dükkanı airport API'sine istek at
    const response = await fetch(
      `https://api.biletdukkani.com/airports?search=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.error('Airport API hatası:', {
        status: response.status,
        statusText: response.statusText
      });
      
      return NextResponse.json({
        success: false,
        data: []
      });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.airports || []
    });

  } catch (error) {
    logger.error('Airport search hatası:', {
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({
      success: false,
      data: []
    });
  }
}
