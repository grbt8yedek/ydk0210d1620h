import { ApiError, successResponse } from '@/utils/errorResponse';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    
    // Validation
    if (!pin) {
      return ApiError.missingField('PIN');
    }

    // Server-side PIN kontrolü (güvenli)
    const correctPin = process.env.ADMIN_PIN || '7000';
    
    if (pin !== correctPin) {
      return ApiError.invalidCredentials({
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
    }

    // Success response
    return successResponse(null, 'PIN doğrulandı');
    
  } catch (error) {
    return ApiError.internalError(error as Error);
  }
}
