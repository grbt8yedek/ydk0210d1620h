import { randomBytes, createHash } from 'crypto';

// Kart tokenization için interface'ler
export interface CardToken {
  token: string;
  lastFour: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  createdAt: number;
  expiresAt: number;
}

export interface CardData {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  name: string;
}

// Memory'de token store (production'da Redis kullanılmalı)
const cardTokens = new Map<string, CardToken>();
const tokenToCard = new Map<string, CardData>();

// Token expiration süresi (1 saat)
const TOKEN_EXPIRY = 60 * 60 * 1000;

/**
 * Kart bilgilerini token'a çevirir (PCI DSS uyumlu)
 * @param cardData Kart bilgileri
 * @returns Güvenli token
 */
export function tokenizeCard(cardData: CardData): string {
  // Kart numarasının son 4 hanesini al
  const lastFour = cardData.number.slice(-4);
  
  // Kart markasını tespit et
  const brand = detectCardBrand(cardData.number);
  
  // Güvenli token oluştur
  const token = generateSecureToken();
  
  // Token'ı kaydet
  const cardToken: CardToken = {
    token,
    lastFour,
    brand,
    expiryMonth: cardData.expiryMonth,
    expiryYear: cardData.expiryYear,
    createdAt: Date.now(),
    expiresAt: Date.now() + TOKEN_EXPIRY
  };
  
  cardTokens.set(token, cardToken);
  tokenToCard.set(token, cardData);
  
  // Eski token'ları temizle
  cleanupExpiredTokens();
  
  console.log(`Kart tokenize edildi: ${brand} ****${lastFour} (Token: ${token.substring(0, 8)}...)`);
  
  return token;
}

/**
 * Token'dan kart bilgilerini alır
 * @param token Güvenli token
 * @returns Kart bilgileri veya null
 */
export function getCardFromToken(token: string): CardData | null {
  const cardToken = cardTokens.get(token);
  
  if (!cardToken) {
    console.log('Geçersiz kart token:', token.substring(0, 8) + '...');
    return null;
  }
  
  // Token süresi dolmuş mu?
  if (Date.now() > cardToken.expiresAt) {
    console.log('Süresi dolmuş kart token:', token.substring(0, 8) + '...');
    cardTokens.delete(token);
    tokenToCard.delete(token);
    return null;
  }
  
  return tokenToCard.get(token) || null;
}

/**
 * Token'dan güvenli kart bilgilerini alır (sadece gösterim için)
 * @param token Güvenli token
 * @returns Güvenli kart bilgileri
 */
export function getSecureCardInfo(token: string): Omit<CardToken, 'token'> | null {
  const cardToken = cardTokens.get(token);
  
  if (!cardToken || Date.now() > cardToken.expiresAt) {
    return null;
  }
  
  return {
    lastFour: cardToken.lastFour,
    brand: cardToken.brand,
    expiryMonth: cardToken.expiryMonth,
    expiryYear: cardToken.expiryYear,
    createdAt: cardToken.createdAt,
    expiresAt: cardToken.expiresAt
  };
}

/**
 * Token'ı geçersiz kılar
 * @param token Güvenli token
 */
export function invalidateToken(token: string): void {
  console.log(`Kart token geçersiz kılındı: ${token.substring(0, 8)}...`);
  cardTokens.delete(token);
  tokenToCard.delete(token);
}

/**
 * Güvenli token oluşturur
 * @returns Güvenli token
 */
function generateSecureToken(): string {
  const randomPart = randomBytes(16).toString('hex');
  const timestamp = Date.now().toString(36);
  const hash = createHash('sha256').update(randomPart + timestamp).digest('hex').substring(0, 8);
  
  return `card_${timestamp}_${hash}_${randomPart}`;
}

/**
 * Kart markasını tespit eder
 * @param cardNumber Kart numarası
 * @returns Kart markası
 */
function detectCardBrand(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleanNumber)) return 'Visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'MasterCard';
  if (/^3[47]/.test(cleanNumber)) return 'American Express';
  if (/^6/.test(cleanNumber)) return 'Discover';
  
  return 'Unknown';
}

/**
 * Süresi dolmuş token'ları temizler
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  
  for (const [token, cardToken] of cardTokens.entries()) {
    if (now > cardToken.expiresAt) {
      cardTokens.delete(token);
      tokenToCard.delete(token);
    }
  }
}

/**
 * Kart numarasını maskeler
 * @param cardNumber Kart numarası
 * @returns Maskelenmiş kart numarası
 */
export function maskCardNumber(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  if (cleanNumber.length < 8) return cardNumber;
  
  const firstFour = cleanNumber.substring(0, 4);
  const lastFour = cleanNumber.substring(cleanNumber.length - 4);
  const middle = '*'.repeat(cleanNumber.length - 8);
  
  return `${firstFour} ${middle} ${lastFour}`;
}

/**
 * CVV'yi maskeler
 * @param cvv CVV numarası
 * @returns Maskelenmiş CVV
 */
export function maskCvv(cvv: string): string {
  return '*'.repeat(cvv.length);
}

/**
 * Token istatistiklerini döndürür
 * @returns Token istatistikleri
 */
export function getTokenStats(): {
  activeTokens: number;
  expiredTokens: number;
  totalTokens: number;
} {
  const now = Date.now();
  let activeTokens = 0;
  let expiredTokens = 0;
  
  for (const cardToken of cardTokens.values()) {
    if (now > cardToken.expiresAt) {
      expiredTokens++;
    } else {
      activeTokens++;
    }
  }
  
  return {
    activeTokens,
    expiredTokens,
    totalTokens: cardTokens.size
  };
}
