import { createHash, randomBytes } from 'crypto';
import { logger } from '@/lib/logger';

// PCI DSS Compliance için güvenlik önlemleri

/**
 * Kart bilgilerini PCI DSS uyumlu şekilde loglar
 * @param message Log mesajı
 * @param cardInfo Kart bilgileri (maskelenmiş)
 */
export function logSecureCardInfo(message: string, cardInfo: {
  brand?: string;
  lastFour?: string;
  maskedNumber?: string;
  bin?: string;
}): void {
  const secureLog = {
    timestamp: new Date().toISOString(),
    message,
    cardInfo: {
      brand: cardInfo.brand || 'Unknown',
      lastFour: cardInfo.lastFour || '****',
      maskedNumber: cardInfo.maskedNumber || '**** **** **** ****',
      bin: cardInfo.bin ? cardInfo.bin + '****' : '******'
    }
  };
  
  logger.payment('[PCI-SECURE]', JSON.stringify(secureLog));
}

/**
 * Hassas verileri maskeler
 * @param data Hassas veri
 * @param type Veri tipi
 * @returns Maskelenmiş veri
 */
export function maskSensitiveData(data: string, type: 'card' | 'cvv' | 'email' | 'phone'): string {
  switch (type) {
    case 'card':
      if (data.length < 8) return '*'.repeat(data.length);
      return data.substring(0, 4) + '*'.repeat(data.length - 8) + data.substring(data.length - 4);
    
    case 'cvv':
      return '*'.repeat(data.length);
    
    case 'email':
      const [username, domain] = data.split('@');
      if (username.length <= 2) return data;
      return username.substring(0, 2) + '*'.repeat(username.length - 2) + '@' + domain;
    
    case 'phone':
      if (data.length < 4) return '*'.repeat(data.length);
      return '*'.repeat(data.length - 4) + data.substring(data.length - 4);
    
    default:
      return '*'.repeat(data.length);
  }
}

/**
 * PCI DSS uyumlu session token oluşturur
 * @returns Güvenli session token
 */
export function generatePCISessionToken(): string {
  const randomPart = randomBytes(32).toString('hex');
  const timestamp = Date.now().toString(36);
  const hash = createHash('sha256').update(randomPart + timestamp).digest('hex').substring(0, 16);
  
  return `pci_${timestamp}_${hash}_${randomPart}`;
}

/**
 * Kart numarası geçerliliğini kontrol eder (Luhn algoritması)
 * @param cardNumber Kart numarası
 * @returns Geçerli mi?
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }
  
  if (!/^\d+$/.test(cleanNumber)) {
    return false;
  }
  
  // Luhn algoritması
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * CVV geçerliliğini kontrol eder
 * @param cvv CVV
 * @param cardBrand Kart markası
 * @returns Geçerli mi?
 */
export function validateCVV(cvv: string, cardBrand: string): boolean {
  if (!/^\d+$/.test(cvv)) {
    return false;
  }
  
  switch (cardBrand.toLowerCase()) {
    case 'american express':
      return cvv.length === 4;
    case 'visa':
    case 'mastercard':
    case 'discover':
    default:
      return cvv.length === 3;
  }
}

/**
 * Son kullanma tarihini kontrol eder
 * @param month Ay (MM)
 * @param year Yıl (YY veya YYYY)
 * @returns Geçerli mi?
 */
export function validateExpiryDate(month: string, year: string): boolean {
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;
  
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  if (fullYear < currentYear || (fullYear === currentYear && monthNum < currentMonth)) {
    return false;
  }
  
  // Maksimum 10 yıl gelecek
  if (fullYear > currentYear + 10) {
    return false;
  }
  
  return true;
}

/**
 * PCI DSS uyumlu hata mesajları
 */
export const PCIErrorMessages = {
  INVALID_CARD_NUMBER: 'Geçersiz kart numarası',
  INVALID_CVV: 'Geçersiz CVV',
  INVALID_EXPIRY: 'Geçersiz son kullanma tarihi',
  CARD_EXPIRED: 'Kart süresi dolmuş',
  INVALID_CARD_BRAND: 'Desteklenmeyen kart markası',
  SECURITY_VIOLATION: 'Güvenlik ihlali tespit edildi',
  RATE_LIMIT_EXCEEDED: 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin',
  TOKEN_EXPIRED: 'Güvenlik token\'ı süresi dolmuş',
  INVALID_TOKEN: 'Geçersiz güvenlik token\'ı'
};

/**
 * PCI DSS uyumlu rate limiting
 */
export class PCIRateLimit {
  private attempts = new Map<string, { count: number; lastAttempt: number }>();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 dakika
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Window'u kontrol et
    if (now - attempt.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    attempt.lastAttempt = now;
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
  
  getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return this.maxAttempts;
    
    const now = Date.now();
    if (now - attempt.lastAttempt > this.windowMs) {
      return this.maxAttempts;
    }
    
    return Math.max(0, this.maxAttempts - attempt.count);
  }
}

/**
 * PCI DSS uyumlu audit log
 */
export function auditLog(action: string, details: Record<string, any>): void {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action,
    details: maskSensitiveAuditData(details),
    sessionId: details.sessionId || 'unknown',
    ip: details.ip || 'unknown'
  };
  
  logger.payment('[PCI-AUDIT]', JSON.stringify(auditEntry));
}

/**
 * Audit log'undaki hassas verileri maskeler
 */
function maskSensitiveAuditData(data: Record<string, any>): Record<string, any> {
  const masked = { ...data };
  
  // Hassas alanları maskeler
  if (masked.cardNumber) {
    masked.cardNumber = maskSensitiveData(masked.cardNumber, 'card');
  }
  if (masked.cvv) {
    masked.cvv = maskSensitiveData(masked.cvv, 'cvv');
  }
  if (masked.email) {
    masked.email = maskSensitiveData(masked.email, 'email');
  }
  if (masked.phone) {
    masked.phone = maskSensitiveData(masked.phone, 'phone');
  }
  
  return masked;
}

// Global rate limiter instance
export const pciRateLimit = new PCIRateLimit();
