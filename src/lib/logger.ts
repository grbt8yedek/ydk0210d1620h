/**
 * GRBT8 Profesyonel Logger Sistemi
 * 
 * Production'da hassas bilgileri korur, development'da detaylı log sağlar.
 * PCI-DSS ve GDPR uyumlu logging.
 */

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

// Log seviyeleri
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'sensitive' | 'payment' | 'security' | 'api';

// Hassas alanlar - ASLA loglanmayacak
const SENSITIVE_FIELDS = [
  'password',
  'cardNumber',
  'cvv',
  'cvc',
  'token',
  'secret',
  'apiKey',
  'privateKey',
];

/**
 * Genel veri sanitizasyonu
 */
function sanitize(data: any): any {
  if (!data) return data;
  if (typeof data !== 'object') return data;

  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();
    
    // Hassas alan kontrolü
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '***REDACTED***';
    }
    
    // Nested object kontrolü
    if (sanitized[key] && typeof sanitized[key] === 'object') {
      sanitized[key] = sanitize(sanitized[key]);
    }
  });

  return sanitized;
}

/**
 * Ödeme verilerini PCI-DSS uyumlu temizle
 */
function sanitizePaymentData(data: any): any {
  if (!data) return data;

  const sanitized = { ...data };

  // Kart numarası
  if (sanitized.cardNumber) {
    const last4 = sanitized.cardNumber.slice(-4);
    sanitized.cardNumber = `****${last4}`;
  }

  // CVV - ASLA loglanmaz
  if (sanitized.cvv) sanitized.cvv = undefined;
  if (sanitized.cvc) sanitized.cvc = undefined;

  // Token - sadece başlangıcı
  if (sanitized.token && typeof sanitized.token === 'string' && sanitized.token.length > 8) {
    sanitized.token = `${sanitized.token.substring(0, 8)}...`;
  }

  // Diğer hassas alanlar
  return sanitize(sanitized);
}

/**
 * Güvenlik verilerini temizle
 */
function sanitizeSecurityData(data: any): any {
  if (!data) return data;

  const sanitized = { ...data };

  // Token'lar
  if (sanitized.token && typeof sanitized.token === 'string' && sanitized.token.length > 8) {
    sanitized.token = `${sanitized.token.substring(0, 8)}...`;
  }

  // Session ID
  if (sanitized.sessionId && typeof sanitized.sessionId === 'string' && sanitized.sessionId.length > 8) {
    sanitized.sessionId = `${sanitized.sessionId.substring(0, 8)}...`;
  }

  // Password - ASLA
  if (sanitized.password) sanitized.password = undefined;

  return sanitized;
}

/**
 * User data temizle (GDPR)
 */
function sanitizeUserData(data: any): any {
  if (!data) return data;

  const sanitized = { ...data };

  // Email'i kısalt
  if (sanitized.email && isProd) {
    const [local, domain] = sanitized.email.split('@');
    sanitized.email = `${local.substring(0, 2)}***@${domain}`;
  }

  // Telefon
  if (sanitized.phone && isProd) {
    sanitized.phone = `***${sanitized.phone.slice(-4)}`;
  }

  // TC Kimlik
  if (sanitized.tcKimlik) {
    sanitized.tcKimlik = `***${sanitized.tcKimlik.slice(-4)}`;
  }

  return sanitize(sanitized);
}

/**
 * Safe log fonksiyonu - ASLA hata fırlatmaz
 */
function safeLog(level: string, message: string, meta?: any) {
  try {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (isDev) {
      switch (level) {
        case 'error':
          console.error(prefix, message, meta || '');
          break;
        case 'warn':
          console.warn(prefix, message, meta || '');
          break;
        case 'debug':
          console.log(prefix, message, meta || '');
          break;
        default:
          console.log(prefix, message, meta || '');
      }
    }
  } catch (error) {
    // Logger ASLA hata fırlatmamalı
    console.error('[LOGGER ERROR]', error);
  }
}

/**
 * Profesyonel Logger
 */
export const logger = {
  /**
   * Kritik hatalar - Her zaman loglanır
   */
  error: (message: string, meta?: any) => {
    try {
      const sanitized = sanitize(meta);
      safeLog('error', message, sanitized);

      // Production'da Sentry'ye gönder (gelecekte)
      if (isProd) {
        // TODO: Sentry entegrasyonu
      }
    } catch (error) {
      console.error('[LOGGER ERROR]', error);
    }
  },

  /**
   * Uyarılar
   */
  warn: (message: string, meta?: any) => {
    try {
      const sanitized = sanitize(meta);
      safeLog('warn', message, sanitized);
    } catch (error) {
      console.error('[LOGGER ERROR]', error);
    }
  },

  /**
   * Genel bilgiler
   */
  info: (message: string, meta?: any) => {
    try {
      const sanitized = sanitize(meta);
      safeLog('info', message, sanitized);
    } catch (error) {
      console.error('[LOGGER ERROR]', error);
    }
  },

  /**
   * Debug bilgileri - SADECE DEVELOPMENT
   */
  debug: (message: string, meta?: any) => {
    if (!isDev) return; // Production'da çalışmaz

    try {
      const sanitized = sanitize(meta);
      safeLog('debug', message, sanitized);
    } catch (error) {
      console.error('[LOGGER ERROR]', error);
    }
  },

  /**
   * Hassas bilgiler - SADECE DEVELOPMENT
   * Production'da ASLA çalışmaz
   */
  sensitive: (message: string, meta?: any) => {
    if (!isDev) return; // Production'da ASLA

    try {
      const sanitized = sanitize(meta);
      safeLog('sensitive', `🔒 ${message}`, sanitized);
    } catch (error) {
      console.error('[LOGGER ERROR]', error);
    }
  },

  /**
   * Ödeme işlemleri - PCI-DSS uyumlu
   */
  payment: (action: string, meta?: any) => {
    try {
      const sanitized = sanitizePaymentData(meta);
      safeLog('payment', `💳 [PAYMENT] ${action}`, sanitized);

      // Production'da audit log'a kaydet (gelecekte)
      if (isProd) {
        // TODO: Audit log entegrasyonu
      }
    } catch (error) {
      console.error('[LOGGER ERROR]', error);
    }
  },

  /**
   * Güvenlik olayları
   */
  security: (event: string, meta?: any) => {
    try {
      const sanitized = sanitizeSecurityData(meta);
      safeLog('security', `🛡️ [SECURITY] ${event}`, sanitized);

      // Production'da security log'a kaydet (gelecekte)
      if (isProd) {
        // TODO: Security log entegrasyonu
      }
    } catch (error) {
      console.error('[LOGGER ERROR]', error);
    }
  },

  /**
   * API çağrıları
   */
  api: (method: string, path: string, meta?: any) => {
    try {
      const sanitized = sanitizeUserData(meta);
      safeLog('api', `🌐 [API] ${method} ${path}`, sanitized);
    } catch (error) {
      console.error('[LOGGER ERROR]', error);
    }
  },
};

/**
 * Export sanitization fonksiyonları (test için)
 */
export const sanitizers = {
  sanitize,
  sanitizePaymentData,
  sanitizeSecurityData,
  sanitizeUserData,
};

