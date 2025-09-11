import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'

// Brute force koruması için store
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>()

interface AuthSecurityConfig {
  maxLoginAttempts: number
  lockoutDuration: number // ms
  windowMs: number // ms
}

const defaultConfig: AuthSecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 dakika
  windowMs: 15 * 60 * 1000, // 15 dakika
}

// Brute force koruması
export function createBruteForceProtection(config: Partial<AuthSecurityConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return async function bruteForceMiddleware(req: NextRequest) {
    const ip = getClientIP(req)
    const now = Date.now()
    
    // Eski kayıtları temizle
    cleanupOldAttempts(now, finalConfig.windowMs)

    // Mevcut deneme kaydını al
    let attempts = loginAttempts.get(ip)
    
    if (!attempts) {
      attempts = { count: 0, lastAttempt: now }
      loginAttempts.set(ip, attempts)
    }

    // Kilitli mi kontrol et
    if (attempts.blockedUntil && now < attempts.blockedUntil) {
      const remainingTime = Math.ceil((attempts.blockedUntil - now) / 1000)
      return NextResponse.json(
        {
          error: 'Account temporarily locked',
          message: `Too many failed login attempts. Try again in ${remainingTime} seconds.`,
          retryAfter: remainingTime
        },
        { status: 429 }
      )
    }

    // Başarısız deneme sayısını artır
    attempts.count++
    attempts.lastAttempt = now

    // Maksimum deneme sayısını aştı mı?
    if (attempts.count >= finalConfig.maxLoginAttempts) {
      attempts.blockedUntil = now + finalConfig.lockoutDuration
      
      // Güvenlik logu kaydet
      logSecurityEvent('BRUTE_FORCE_DETECTED', {
        ip,
        attempts: attempts.count,
        blockedUntil: attempts.blockedUntil
      })

      return NextResponse.json(
        {
          error: 'Account locked',
          message: `Too many failed login attempts. Account locked for ${finalConfig.lockoutDuration / 60000} minutes.`,
          retryAfter: Math.ceil(finalConfig.lockoutDuration / 1000)
        },
        { status: 429 }
      )
    }

    return NextResponse.next()
  }
}

// Başarılı giriş sonrası deneme sayacını sıfırla
export function resetLoginAttempts(ip: string): void {
  loginAttempts.delete(ip)
}

// Password güvenlik kontrolü
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Password hash'le
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return `${salt}:${hash}`
}

// Password doğrula
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':')
  const testHash = createHash('sha256').update(password + salt).digest('hex')
  return hash === testHash
}

// Session güvenliği
export function createSecureSession(userId: string): string {
  const sessionId = randomBytes(32).toString('hex')
  const expires = Date.now() + (24 * 60 * 60 * 1000) // 24 saat
  
  // Session'ı kaydet (production'da Redis kullanılmalı)
  // Burada sadece örnek olarak gösteriyoruz
  
  return sessionId
}

// Client IP adresini al
export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const ip = forwarded ? forwarded.split(',')[0] : realIP || req.ip || 'unknown'
  return ip
}

// Eski deneme kayıtlarını temizle
function cleanupOldAttempts(now: number, windowMs: number): void {
  const cutoff = now - windowMs
  for (const [ip, attempts] of loginAttempts.entries()) {
    if (attempts.lastAttempt < cutoff && (!attempts.blockedUntil || attempts.blockedUntil < now)) {
      loginAttempts.delete(ip)
    }
  }
}

// Güvenlik olayını logla
function logSecurityEvent(event: string, data: any): void {
  console.log(`[SECURITY] ${event}:`, data)
  // Production'da bu bilgileri güvenlik log sistemine gönder
}

// Login attempt sayısını al
export function getLoginAttempts(ip: string): { count: number; remaining: number; blockedUntil?: number } {
  const attempts = loginAttempts.get(ip)
  if (!attempts) {
    return { count: 0, remaining: defaultConfig.maxLoginAttempts }
  }

  return {
    count: attempts.count,
    remaining: Math.max(0, defaultConfig.maxLoginAttempts - attempts.count),
    blockedUntil: attempts.blockedUntil
  }
}
