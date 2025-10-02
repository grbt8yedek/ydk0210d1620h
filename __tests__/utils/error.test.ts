import { AppError, errorHandler, logger } from '@/utils/error'
import { NextResponse } from 'next/server'

describe('AppError', () => {
  it('should create error with message', () => {
    const error = new AppError('Test error')
    expect(error.message).toBe('Test error')
    expect(error.name).toBe('AppError')
  })

  it('should have default status code 500', () => {
    const error = new AppError('Error')
    expect(error.statusCode).toBe(500)
  })

  it('should accept custom status code', () => {
    const error = new AppError('Not found', 404)
    expect(error.statusCode).toBe(404)
  })

  it('should accept error code', () => {
    const error = new AppError('Error', 400, 'BAD_REQUEST')
    expect(error.code).toBe('BAD_REQUEST')
  })

  it('should extend Error', () => {
    const error = new AppError('Test')
    expect(error instanceof Error).toBe(true)
  })
})

describe('errorHandler', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('AppError Handling', () => {
    it('should handle AppError', async () => {
      const error = new AppError('Custom error', 400, 'CUSTOM_CODE')
      const response = errorHandler(error)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Custom error')
      expect(data.code).toBe('CUSTOM_CODE')
    })

    it('should log AppError', () => {
      const error = new AppError('Test error')
      errorHandler(error)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', error)
    })
  })

  describe('Prisma Error Handling', () => {
    it('should handle Prisma errors', async () => {
      const prismaError = new Error('Prisma error')
      prismaError.name = 'PrismaClientKnownRequestError'
      
      const response = errorHandler(prismaError)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Veritabanı')
      expect(data.code).toBe('DATABASE_ERROR')
    })
  })

  describe('Validation Error Handling', () => {
    it('should handle validation errors', async () => {
      const validationError = new Error('Invalid input')
      validationError.name = 'ValidationError'
      
      const response = errorHandler(validationError)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid input')
      expect(data.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('Generic Error Handling', () => {
    it('should handle generic errors', async () => {
      const genericError = new Error('Generic error')
      const response = errorHandler(genericError)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Bir hata oluştu')
      expect(data.code).toBe('INTERNAL_SERVER_ERROR')
    })

    it('should handle non-Error objects', async () => {
      const response = errorHandler('String error')
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('should handle null/undefined', async () => {
      const response1 = errorHandler(null)
      const response2 = errorHandler(undefined)

      expect(response1.status).toBe(500)
      expect(response2.status).toBe(500)
    })
  })

  describe('Response Format', () => {
    it('should always include success: false', async () => {
      const testCases = [
        new AppError('Test'),
        new Error('Test'),
        'String error',
      ]

      for (const testCase of testCases) {
        const response = errorHandler(testCase)
        const data = await response.json()
        expect(data.success).toBe(false)
      }
    })

    it('should always include error message', async () => {
      const response = errorHandler(new Error('Test'))
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(typeof data.error).toBe('string')
    })

    it('should always include error code', async () => {
      const response = errorHandler(new Error('Test'))
      const data = await response.json()
      expect(data).toHaveProperty('code')
    })
  })
})

describe('logger', () => {
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance
  let consoleDebugSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleDebugSpy.mockRestore()
  })

  describe('info', () => {
    it('should log info message', () => {
      logger.info('Test message')
      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] Test message', '')
    })

    it('should log info with data', () => {
      const data = { id: 1, name: 'Test' }
      logger.info('User created', data)
      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] User created', data)
    })
  })

  describe('error', () => {
    it('should log error message', () => {
      logger.error('Error occurred')
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Error occurred', '')
    })

    it('should log error with error object', () => {
      const error = new Error('Test error')
      logger.error('Failed to process', error)
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Failed to process', error)
    })
  })

  describe('warn', () => {
    it('should log warning message', () => {
      logger.warn('Warning message')
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Warning message', '')
    })

    it('should log warning with data', () => {
      const data = { deprecatedAPI: true }
      logger.warn('Deprecated API used', data)
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Deprecated API used', data)
    })
  })

  describe('debug', () => {
    it('should log debug in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      logger.debug('Debug message')
      expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG] Debug message', '')

      process.env.NODE_ENV = originalEnv
    })

    it('should not log debug in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      logger.debug('Debug message')
      expect(consoleDebugSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })

    it('should log debug with data in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const data = { query: 'SELECT *' }
      logger.debug('SQL query', data)
      expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG] SQL query', data)

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Log Levels', () => {
    it('should have all log methods', () => {
      expect(logger).toHaveProperty('info')
      expect(logger).toHaveProperty('error')
      expect(logger).toHaveProperty('warn')
      expect(logger).toHaveProperty('debug')
    })

    it('should accept optional data parameter', () => {
      logger.info('Message')
      logger.info('Message', { data: true })
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(2)
    })
  })
})

