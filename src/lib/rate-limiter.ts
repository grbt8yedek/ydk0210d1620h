import { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/redis';
import { logger } from '@/lib/logger';

export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         request.ip || 
         'unknown';
}

export async function checkRateLimit(
  request: NextRequest, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const clientIp = getClientIp(request);
    const result = await rateLimit.check(clientIp, maxRequests, windowMs);
    
    if (!result.allowed) {
      logger.warn(`Rate limit exceeded for IP: ${clientIp}`);
    }
    
    return result;
  } catch (error) {
    logger.error('Rate limit check error:', error);
    // Hata durumunda trafiği engelleme
    return { allowed: true, remaining: maxRequests };
  }
}
