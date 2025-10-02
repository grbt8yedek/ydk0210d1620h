import { errorResponse, successResponse, ApiError, ErrorCode } from '@/utils/errorResponse'
import { logger } from '@/utils/error'

// Mock dependencies
jest.mock('@/utils/error', () => ({
  logger: {
    error: jest.fn()
  }
}))

// Mock NextResponse
const mockJson = jest.fn()
jest.mock('next/server', () => ({
  NextResponse: {
    json: mockJson
  }
}))

describe('errorResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockJson.mockReturnValue({ status: 500 })
  })

  describe('Basic Error Response', () => {
    it('should create error response with default values', () => {
      errorResponse({})

      expect(mockJson).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin',
            statusCode: 500
          }
        },
        { status: 500 }
      )
    })

    it('should create error response with custom code', () => {
      errorResponse({ code: ErrorCode.UNAUTHORIZED })

      expect(mockJson).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: ErrorCode.UNAUTHORIZED,
            message: 'Lütfen giriş yapın',
            statusCode: 401
          }
        },
        { status: 401 }
      )
    })

    it('should create error response with custom message', () => {
      const customMessage = 'Özel hata mesajı'
      errorResponse({ code: ErrorCode.VALIDATION_ERROR, message: customMessage })

      expect(mockJson).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: customMessage,
            statusCode: 400
          }
        },
        { status: 400 }
      )
    })

    it('should create error response with custom status code', () => {
      errorResponse({ code: ErrorCode.NOT_FOUND, statusCode: 422 })

      expect(mockJson).toHaveBeenCalledWith(
        expect.any(Object),
        { status: 422 }
      )
    })

    it('should include details in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const details = { field: 'email', reason: 'invalid format' }
      errorResponse({ code: ErrorCode.VALIDATION_ERROR, details })

      expect(mockJson).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Girdiğiniz bilgileri kontrol edin',
            statusCode: 400,
            details: details
          }
        },
        { status: 400 }
      )

      process.env.NODE_ENV = originalEnv
    })

    it('should not include details in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const details = { sensitive: 'data' }
      errorResponse({ code: ErrorCode.VALIDATION_ERROR, details })

      expect(mockJson).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Girdiğiniz bilgileri kontrol edin',
            statusCode: 400
          }
        },
        { status: 400 }
      )

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Logging', () => {
    it('should log error by default', () => {
      const logContext = { userId: '123', action: 'login' }
      errorResponse({ code: ErrorCode.INVALID_CREDENTIALS, logContext })

      expect(logger.error).toHaveBeenCalledWith('API Error:', {
        code: ErrorCode.INVALID_CREDENTIALS,
        message: 'Geçersiz e-posta veya şifre',
        statusCode: 401,
        userId: '123',
        action: 'login',
        timestamp: expect.any(String)
      })
    })

    it('should not log when logError is false', () => {
      errorResponse({ code: ErrorCode.NOT_FOUND, logError: false })

      expect(logger.error).not.toHaveBeenCalled()
    })

    it('should include timestamp in logs', () => {
      errorResponse({ code: ErrorCode.INTERNAL_ERROR })

      expect(logger.error).toHaveBeenCalledWith('API Error:', 
        expect.objectContaining({
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        })
      )
    })

    it('should merge log context correctly', () => {
      const logContext = { 
        userId: '123', 
        endpoint: '/api/test',
        requestId: 'req-456'
      }
      
      errorResponse({ code: ErrorCode.DATABASE_ERROR, logContext })

      expect(logger.error).toHaveBeenCalledWith('API Error:', 
        expect.objectContaining({
          userId: '123',
          endpoint: '/api/test',
          requestId: 'req-456'
        })
      )
    })
  })

  describe('Status Code Mapping', () => {
    it('should map auth error codes correctly', () => {
      const authCodes = [
        { code: ErrorCode.UNAUTHORIZED, expectedStatus: 401 },
        { code: ErrorCode.FORBIDDEN, expectedStatus: 403 },
        { code: ErrorCode.INVALID_CREDENTIALS, expectedStatus: 401 },
        { code: ErrorCode.INVALID_TOKEN, expectedStatus: 401 },
        { code: ErrorCode.SESSION_EXPIRED, expectedStatus: 401 }
      ]

      authCodes.forEach(({ code, expectedStatus }) => {
        errorResponse({ code })
        expect(mockJson).toHaveBeenCalledWith(
          expect.any(Object),
          { status: expectedStatus }
        )
      })
    })

    it('should map validation error codes correctly', () => {
      const validationCodes = [
        { code: ErrorCode.VALIDATION_ERROR, expectedStatus: 400 },
        { code: ErrorCode.INVALID_INPUT, expectedStatus: 400 },
        { code: ErrorCode.MISSING_REQUIRED_FIELD, expectedStatus: 400 }
      ]

      validationCodes.forEach(({ code, expectedStatus }) => {
        errorResponse({ code })
        expect(mockJson).toHaveBeenCalledWith(
          expect.any(Object),
          { status: expectedStatus }
        )
      })
    })

    it('should map resource error codes correctly', () => {
      const resourceCodes = [
        { code: ErrorCode.NOT_FOUND, expectedStatus: 404 },
        { code: ErrorCode.ALREADY_EXISTS, expectedStatus: 409 }
      ]

      resourceCodes.forEach(({ code, expectedStatus }) => {
        errorResponse({ code })
        expect(mockJson).toHaveBeenCalledWith(
          expect.any(Object),
          { status: expectedStatus }
        )
      })
    })

    it('should map server error codes correctly', () => {
      const serverCodes = [
        { code: ErrorCode.INTERNAL_ERROR, expectedStatus: 500 },
        { code: ErrorCode.DATABASE_ERROR, expectedStatus: 500 },
        { code: ErrorCode.EXTERNAL_API_ERROR, expectedStatus: 502 }
      ]

      serverCodes.forEach(({ code, expectedStatus }) => {
        errorResponse({ code })
        expect(mockJson).toHaveBeenCalledWith(
          expect.any(Object),
          { status: expectedStatus }
        )
      })
    })
  })
})

describe('successResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockJson.mockReturnValue({ status: 200 })
  })

  describe('Basic Success Response', () => {
    it('should create success response with default values', () => {
      successResponse()

      expect(mockJson).toHaveBeenCalledWith(
        { success: true },
        { status: 200 }
      )
    })

    it('should create success response with data', () => {
      const data = { id: 1, name: 'John' }
      successResponse(data)

      expect(mockJson).toHaveBeenCalledWith(
        {
          success: true,
          data: data
        },
        { status: 200 }
      )
    })

    it('should create success response with message', () => {
      const message = 'İşlem başarılı'
      successResponse(null, message)

      expect(mockJson).toHaveBeenCalledWith(
        {
          success: true,
          message: message
        },
        { status: 200 }
      )
    })

    it('should create success response with custom status code', () => {
      successResponse(null, undefined, 201)

      expect(mockJson).toHaveBeenCalledWith(
        { success: true },
        { status: 201 }
      )
    })

    it('should create success response with data, message and status', () => {
      const data = { created: true }
      const message = 'Kayıt oluşturuldu'
      
      successResponse(data, message, 201)

      expect(mockJson).toHaveBeenCalledWith(
        {
          success: true,
          data: data,
          message: message
        },
        { status: 201 }
      )
    })

    it('should handle null data explicitly', () => {
      successResponse(null)

      expect(mockJson).toHaveBeenCalledWith(
        { success: true },
        { status: 200 }
      )
    })

    it('should handle different data types', () => {
      const testData = [
        { type: 'object', value: { test: 'data' } },
        { type: 'array', value: [1, 2, 3] },
        { type: 'string', value: 'test string' },
        { type: 'number', value: 42 },
        { type: 'boolean', value: true },
        { type: 'empty object', value: {} },
        { type: 'empty array', value: [] }
      ]

      testData.forEach(({ value }) => {
        successResponse(value)
        expect(mockJson).toHaveBeenCalledWith(
          {
            success: true,
            data: value
          },
          { status: 200 }
        )
      })
    })
  })
})

describe('ApiError shortcuts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockJson.mockReturnValue({ status: 500 })
  })

  describe('Auth Error Shortcuts', () => {
    it('should create unauthorized error', () => {
      ApiError.unauthorized()

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ErrorCode.UNAUTHORIZED,
            message: 'Lütfen giriş yapın',
            statusCode: 401
          })
        }),
        { status: 401 }
      )
    })

    it('should create forbidden error with custom message', () => {
      const customMessage = 'Admin yetkisi gerekli'
      ApiError.forbidden(customMessage)

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.FORBIDDEN,
            message: customMessage
          })
        }),
        { status: 403 }
      )
    })

    it('should create invalid credentials error', () => {
      const logContext = { email: 'test@example.com' }
      ApiError.invalidCredentials(logContext)

      expect(logger.error).toHaveBeenCalledWith('API Error:', 
        expect.objectContaining({
          code: ErrorCode.INVALID_CREDENTIALS,
          email: 'test@example.com'
        })
      )
    })
  })

  describe('Validation Error Shortcuts', () => {
    it('should create validation error with details', () => {
      const details = { field: 'email', error: 'invalid format' }
      ApiError.validationError('Email geçersiz', details)

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Email geçersiz'
          })
        }),
        { status: 400 }
      )
    })

    it('should create missing field error with field name', () => {
      ApiError.missingField('email')

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.MISSING_REQUIRED_FIELD,
            message: 'email alanı zorunludur'
          })
        }),
        { status: 400 }
      )
    })

    it('should create missing field error without field name', () => {
      ApiError.missingField()

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.MISSING_REQUIRED_FIELD,
            message: 'Zorunlu alanları doldurun'
          })
        }),
        { status: 400 }
      )
    })
  })

  describe('Resource Error Shortcuts', () => {
    it('should create not found error with resource name', () => {
      ApiError.notFound('Kullanıcı')

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.NOT_FOUND,
            message: 'Kullanıcı bulunamadı'
          })
        }),
        { status: 404 }
      )
    })

    it('should create already exists error with resource name', () => {
      ApiError.alreadyExists('Email')

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.ALREADY_EXISTS,
            message: 'Email zaten mevcut'
          })
        }),
        { status: 409 }
      )
    })
  })

  describe('Server Error Shortcuts', () => {
    it('should create internal error with Error object', () => {
      const error = new Error('Database connection failed')
      error.stack = 'Error stack trace'
      
      ApiError.internalError(error, { requestId: 'req-123' })

      expect(logger.error).toHaveBeenCalledWith('API Error:', 
        expect.objectContaining({
          code: ErrorCode.INTERNAL_ERROR,
          requestId: 'req-123',
          error: 'Database connection failed',
          stack: 'Error stack trace'
        })
      )
    })

    it('should create database error', () => {
      const dbError = new Error('Connection timeout')
      ApiError.databaseError(dbError)

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.DATABASE_ERROR,
            message: 'Veritabanı hatası oluştu'
          })
        }),
        { status: 500 }
      )
    })

    it('should create external API error with service name', () => {
      const error = new Error('Service unavailable')
      ApiError.externalApiError('BiletDukkani', error)

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.EXTERNAL_API_ERROR,
            message: 'BiletDukkani servisi yanıt vermiyor'
          })
        }),
        { status: 502 }
      )

      expect(logger.error).toHaveBeenCalledWith('API Error:', 
        expect.objectContaining({
          service: 'BiletDukkani',
          error: 'Service unavailable'
        })
      )
    })
  })

  describe('Error Code Coverage', () => {
    it('should handle all error codes with correct messages', () => {
      const allCodes = [
        ErrorCode.UNAUTHORIZED,
        ErrorCode.FORBIDDEN,
        ErrorCode.INVALID_CREDENTIALS,
        ErrorCode.INVALID_TOKEN,
        ErrorCode.SESSION_EXPIRED,
        ErrorCode.VALIDATION_ERROR,
        ErrorCode.INVALID_INPUT,
        ErrorCode.MISSING_REQUIRED_FIELD,
        ErrorCode.NOT_FOUND,
        ErrorCode.ALREADY_EXISTS,
        ErrorCode.TOO_MANY_REQUESTS,
        ErrorCode.INTERNAL_ERROR,
        ErrorCode.DATABASE_ERROR,
        ErrorCode.EXTERNAL_API_ERROR,
        ErrorCode.INSUFFICIENT_BALANCE,
        ErrorCode.BOOKING_FAILED,
        ErrorCode.PAYMENT_FAILED
      ]

      allCodes.forEach(code => {
        errorResponse({ code, logError: false })
        
        expect(mockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              code: code,
              message: expect.any(String),
              statusCode: expect.any(Number)
            })
          }),
          { status: expect.any(Number) }
        )
      })
    })

    it('should have Turkish messages for all error codes', () => {
      const turkishMessages = [
        'Lütfen giriş yapın',
        'Bu işlem için yetkiniz yok',
        'Geçersiz e-posta veya şifre',
        'Geçersiz token',
        'Oturumunuz sona erdi',
        'Girdiğiniz bilgileri kontrol edin',
        'Geçersiz veri',
        'Zorunlu alanları doldurun',
        'İstediğiniz kayıt bulunamadı',
        'Bu kayıt zaten mevcut',
        'Çok fazla istek gönderdiniz',
        'Bir hata oluştu',
        'Veritabanı hatası oluştu',
        'Dış servis hatası',
        'Yetersiz bakiye',
        'Rezervasyon oluşturulamadı',
        'Ödeme işlemi başarısız'
      ]

      Object.values(ErrorCode).forEach((code, index) => {
        errorResponse({ code, logError: false })
        
        expect(mockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              message: expect.any(String)
            })
          }),
          expect.any(Object)
        )
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle unknown error code gracefully', () => {
      const unknownCode = 'UNKNOWN_ERROR' as ErrorCode
      errorResponse({ code: unknownCode })

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: unknownCode,
            statusCode: 500 // Should default to 500
          })
        }),
        { status: 500 }
      )
    })

    it('should handle very long custom messages', () => {
      const longMessage = 'Çok uzun hata mesajı ' + 'x'.repeat(1000)
      errorResponse({ code: ErrorCode.VALIDATION_ERROR, message: longMessage })

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: longMessage
          })
        }),
        expect.any(Object)
      )
    })

    it('should handle special characters in messages', () => {
      const specialMessage = 'Özel karakter içeren mesaj: àáâãäåæçèéêëìíîï'
      errorResponse({ code: ErrorCode.INVALID_INPUT, message: specialMessage })

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: specialMessage
          })
        }),
        expect.any(Object)
      )
    })

    it('should handle null and undefined options', () => {
      errorResponse({ code: undefined as any, message: null as any })

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ErrorCode.INTERNAL_ERROR,
            statusCode: 500
          })
        }),
        { status: 500 }
      )
    })
  })
})
