import { logger } from '@/utils/error';
import { ApiError, successResponse } from '@/utils/errorResponse';

// Airport arama için server-side proxy
// API key'i client-side'da expose etmeden kullan

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return successResponse([]);
    }

    // Server-side API key kullanımı (güvenli)
    const API_KEY = process.env.FLIGHT_API_KEY;

    if (!API_KEY) {
      logger.error('FLIGHT_API_KEY tanımlı değil');
      return ApiError.internalError(new Error('API key yapılandırılmamış'));
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
      return ApiError.externalApiError('Havalimanı servisi');
    }

    const data = await response.json();

    return successResponse(data.airports || []);

  } catch (error) {
    return ApiError.externalApiError('Havalimanı servisi', error as Error);
  }
}
