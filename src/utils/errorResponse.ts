import { NextResponse } from 'next/server';
import { logger } from './error';

/**
 * Standart API Error Response Helper
 * Tüm API endpoint'lerinde tutarlı error response formatı sağlar
 */

// Error kodları enum
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resource
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Rate Limiting
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  
  // Business Logic
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  BOOKING_FAILED = 'BOOKING_FAILED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

// HTTP Status Code mapping
const STATUS_CODE_MAP: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.SESSION_EXPIRED]: 401,
  
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_API_ERROR]: 502,
  
  [ErrorCode.INSUFFICIENT_BALANCE]: 400,
  [ErrorCode.BOOKING_FAILED]: 500,
  [ErrorCode.PAYMENT_FAILED]: 500,
};

// Kullanıcıya gösterilecek Türkçe mesajlar
const USER_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'Lütfen giriş yapın',
  [ErrorCode.FORBIDDEN]: 'Bu işlem için yetkiniz yok',
  [ErrorCode.INVALID_CREDENTIALS]: 'Geçersiz e-posta veya şifre',
  [ErrorCode.INVALID_TOKEN]: 'Geçersiz token',
  [ErrorCode.SESSION_EXPIRED]: 'Oturumunuz sona erdi, lütfen tekrar giriş yapın',
  
  [ErrorCode.VALIDATION_ERROR]: 'Girdiğiniz bilgileri kontrol edin',
  [ErrorCode.INVALID_INPUT]: 'Geçersiz veri',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Zorunlu alanları doldurun',
  
  [ErrorCode.NOT_FOUND]: 'İstediğiniz kayıt bulunamadı',
  [ErrorCode.ALREADY_EXISTS]: 'Bu kayıt zaten mevcut',
  
  [ErrorCode.TOO_MANY_REQUESTS]: 'Çok fazla istek gönderdiniz, lütfen biraz bekleyin',
  
  [ErrorCode.INTERNAL_ERROR]: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin',
  [ErrorCode.DATABASE_ERROR]: 'Veritabanı hatası oluştu',
  [ErrorCode.EXTERNAL_API_ERROR]: 'Dış servis hatası',
  
  [ErrorCode.INSUFFICIENT_BALANCE]: 'Yetersiz bakiye',
  [ErrorCode.BOOKING_FAILED]: 'Rezervasyon oluşturulamadı',
  [ErrorCode.PAYMENT_FAILED]: 'Ödeme işlemi başarısız',
};

interface ErrorResponseOptions {
  code?: ErrorCode;
  message?: string;
  statusCode?: number;
  details?: any;
  logError?: boolean;
  logContext?: Record<string, any>;
}

/**
 * Standart error response oluşturur
 * @param options Error response ayarları
 */
export function errorResponse(options: ErrorResponseOptions): NextResponse {
  const {
    code = ErrorCode.INTERNAL_ERROR,
    message,
    statusCode,
    details,
    logError = true,
    logContext = {}
  } = options;

  // HTTP status code belirle
  const status = statusCode || STATUS_CODE_MAP[code] || 500;
  
  // Kullanıcıya gösterilecek mesaj
  const userMessage = message || USER_MESSAGES[code] || USER_MESSAGES[ErrorCode.INTERNAL_ERROR];

  // Server-side loglama (opsiyonel)
  if (logError) {
    logger.error('API Error:', {
      code,
      message: userMessage,
      statusCode: status,
      ...logContext,
      timestamp: new Date().toISOString()
    });
  }

  // Response body
  const responseBody: any = {
    success: false,
    error: {
      code,
      message: userMessage,
      statusCode: status
    }
  };

  // Development'ta detay ekle
  if (process.env.NODE_ENV === 'development' && details) {
    responseBody.error.details = details;
  }

  return NextResponse.json(responseBody, { status });
}

/**
 * Success response oluşturur (tutarlılık için)
 */
export function successResponse(data: any = null, message?: string, statusCode: number = 200): NextResponse {
  const responseBody: any = {
    success: true,
  };

  if (message) {
    responseBody.message = message;
  }

  if (data !== null) {
    responseBody.data = data;
  }

  return NextResponse.json(responseBody, { status: statusCode });
}

/**
 * Hızlı error response fonksiyonları
 */
export const ApiError = {
  // Auth errors
  unauthorized: (message?: string, logContext?: any) => 
    errorResponse({ code: ErrorCode.UNAUTHORIZED, message, logContext }),
  
  forbidden: (message?: string, logContext?: any) => 
    errorResponse({ code: ErrorCode.FORBIDDEN, message, logContext }),
  
  invalidCredentials: (logContext?: any) => 
    errorResponse({ code: ErrorCode.INVALID_CREDENTIALS, logContext }),
  
  // Validation errors
  validationError: (message?: string, details?: any) => 
    errorResponse({ code: ErrorCode.VALIDATION_ERROR, message, details }),
  
  invalidInput: (message?: string, details?: any) => 
    errorResponse({ code: ErrorCode.INVALID_INPUT, message, details }),
  
  missingField: (fieldName?: string) => 
    errorResponse({ 
      code: ErrorCode.MISSING_REQUIRED_FIELD, 
      message: fieldName ? `${fieldName} alanı zorunludur` : undefined 
    }),
  
  // Resource errors
  notFound: (resource?: string) => 
    errorResponse({ 
      code: ErrorCode.NOT_FOUND, 
      message: resource ? `${resource} bulunamadı` : undefined 
    }),
  
  alreadyExists: (resource?: string) => 
    errorResponse({ 
      code: ErrorCode.ALREADY_EXISTS, 
      message: resource ? `${resource} zaten mevcut` : undefined 
    }),
  
  // Rate limiting
  tooManyRequests: (retryAfter?: number) => 
    errorResponse({ code: ErrorCode.TOO_MANY_REQUESTS }),
  
  // Server errors
  internalError: (error?: Error, logContext?: any) => 
    errorResponse({ 
      code: ErrorCode.INTERNAL_ERROR,
      details: error?.message,
      logContext: {
        ...logContext,
        error: error?.message,
        stack: error?.stack
      }
    }),
  
  databaseError: (error?: Error) => 
    errorResponse({ 
      code: ErrorCode.DATABASE_ERROR,
      details: error?.message,
      logContext: {
        error: error?.message,
        stack: error?.stack
      }
    }),
  
  externalApiError: (serviceName?: string, error?: Error) => 
    errorResponse({ 
      code: ErrorCode.EXTERNAL_API_ERROR,
      message: serviceName ? `${serviceName} servisi yanıt vermiyor` : undefined,
      logContext: {
        service: serviceName,
        error: error?.message
      }
    }),
};
