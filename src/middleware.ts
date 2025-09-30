import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createCSRFProtection } from './lib/csrfProtection';

// Rate limiting için basit bir Map
const rateLimit = new Map<string, number[]>();
const RATE_LIMIT_DURATION = 60 * 1000; // 1 dakika
const MAX_REQUESTS = 100; // 1 dakikada maksimum istek sayısı

export async function middleware(request: NextRequest) {
  // Giriş sayfasına yönlendirme kontrolü
  if (request.nextUrl.pathname === '/giris') {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // CORS allowlist (Admin ve Ana Site domainleri)
  const allowedOrigins = new Set<string>([
    'https://www.grbt8.store',
    'https://grbt8.store',
    'https://anasite.grbt8.store',
    'http://localhost:3000',
    'http://localhost:4000',
  ]);
  const requestOrigin = request.headers.get('origin') || '';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isAllowedOrigin = allowedOrigins.has(requestOrigin);

  // CORS headers (sadece API için uygula)
  if (isApiRoute) {
    response.headers.set('Vary', 'Origin');
    response.headers.set('Access-Control-Allow-Origin', isAllowedOrigin ? requestOrigin : 'https://anasite.grbt8.store');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // Preflight isteği ise erken dön
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  // Not: Admin paneli (https://www.grbt8.store) iframe ile ana sitede gösterilebilsin diye frame-src'e admin domaini eklendi
  response.headers.set('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://www.grbt8.store https://grbt8.store http://localhost:3000 http://localhost:4000;
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim());

  // API Rate Limiting ve CSRF Protection
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_DURATION;
    
    const requestHistory = rateLimit.get(ip) || [];
    const recentRequests = requestHistory.filter((time: number) => time > windowStart);
    
    if (recentRequests.length >= MAX_REQUESTS) {
      return new NextResponse(JSON.stringify({
        error: 'Too many requests',
        message: 'Please try again later'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      });
    }
    
    recentRequests.push(now);
    rateLimit.set(ip, recentRequests);

    // CSRF Protection for POST, PUT, DELETE requests
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      const csrfMiddleware = createCSRFProtection();
      const csrfResponse = await csrfMiddleware(request);
      if (csrfResponse.status === 403) {
        return csrfResponse;
      }
    }
  }

  // /admin ve /grbt-8: arama motoru engelleme ve ek sertleştirme
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/grbt-8')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    if (process.env.NODE_ENV === 'production' && request.nextUrl.protocol !== 'https:') {
      return NextResponse.redirect(new URL('https://' + request.nextUrl.host + request.nextUrl.pathname));
    }
  }

  return response;
}

// Middleware'in çalışacağı path'leri belirt
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 