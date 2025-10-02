import { POST, GET } from '@/app/api/payment/3d-secure/complete/route'
import { complete3DSecure, get3DSecureSession } from '@/lib/threeDSecure'

// Mock dependencies
jest.mock('@/lib/threeDSecure', () => ({
  complete3DSecure: jest.fn(),
  get3DSecureSession: jest.fn()
}))

// Mock console methods
const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

describe('POST /api/payment/3d-secure/complete', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('Başarılı 3D Secure Tamamlama', () => {
    it('should complete 3D Secure successfully', async () => {
      const mockSession = {
        sessionId: '3ds_abc123_def456_789',
        cardToken: 'card_token_123',
        amount: 150.50,
        currency: 'EUR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      const mockResult = {
        success: true,
        transactionId: 'TXN_3DS_1234567890_abc123'
      }

      ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
      ;(complete3DSecure as jest.Mock).mockReturnValue(mockResult)

      const requestBody = {
        sessionId: '3ds_abc123_def456_789',
        pares: 'base64-encoded-pares-success-data'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.transactionId).toBe('TXN_3DS_1234567890_abc123')
      expect(responseData.amount).toBe(150.50)
      expect(responseData.currency).toBe('EUR')
      expect(responseData.message).toBe('3D Secure doğrulaması başarıyla tamamlandı')

      expect(get3DSecureSession).toHaveBeenCalledWith('3ds_abc123_def456_789')
      expect(complete3DSecure).toHaveBeenCalledWith('3ds_abc123_def456_789', 'base64-encoded-pares-success-data')

      expect(consoleSpy).toHaveBeenCalledWith('3D Secure tamamlandı: Session 3ds_abc1... - Transaction TXN_3DS_1234567890_abc123')
    })

    it('should handle different currencies and amounts', async () => {
      const testCases = [
        { amount: 99.99, currency: 'USD' },
        { amount: 1234.56, currency: 'GBP' },
        { amount: 50.00, currency: 'TRY' },
        { amount: 0.01, currency: 'JPY' }
      ]

      for (const testCase of testCases) {
        const mockSession = {
          sessionId: 'test_session',
          cardToken: 'test_token',
          amount: testCase.amount,
          currency: testCase.currency,
          createdAt: Date.now(),
          expiresAt: Date.now() + 600000,
          status: 'pending' as const
        }

        const mockResult = {
          success: true,
          transactionId: `TXN_${testCase.currency}_123`
        }

        ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
        ;(complete3DSecure as jest.Mock).mockReturnValue(mockResult)

        const requestBody = {
          sessionId: 'test_session',
          pares: 'success_pares'
        }

        const request = {
          json: jest.fn().mockResolvedValue(requestBody)
        } as any

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)
        expect(responseData.amount).toBe(testCase.amount)
        expect(responseData.currency).toBe(testCase.currency)
        expect(responseData.transactionId).toBe(`TXN_${testCase.currency}_123`)
      }
    })

    it('should handle different PARes formats', async () => {
      const paresFormats = [
        'simple-success',
        'base64-encoded-success-data',
        'Y', // Success indicator
        'SUCCESS',
        Buffer.from('SUCCESS').toString('base64'),
        Buffer.from(JSON.stringify({ status: 'Y', message: 'Success' })).toString('base64')
      ]

      const mockSession = {
        sessionId: 'test_session',
        cardToken: 'test_token',
        amount: 100,
        currency: 'EUR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      for (const pares of paresFormats) {
        const mockResult = {
          success: true,
          transactionId: `TXN_${Date.now()}`
        }

        ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
        ;(complete3DSecure as jest.Mock).mockReturnValue(mockResult)

        const requestBody = {
          sessionId: 'test_session',
          pares: pares
        }

        const request = {
          json: jest.fn().mockResolvedValue(requestBody)
        } as any

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)

        expect(complete3DSecure).toHaveBeenCalledWith('test_session', pares)
      }
    })

    it('should return session amount and currency in response', async () => {
      const mockSession = {
        sessionId: 'session_with_data',
        cardToken: 'token_123',
        amount: 999.99,
        currency: 'USD',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      const mockResult = {
        success: true,
        transactionId: 'TXN_DATA_TEST'
      }

      ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
      ;(complete3DSecure as jest.Mock).mockReturnValue(mockResult)

      const requestBody = {
        sessionId: 'session_with_data',
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.amount).toBe(999.99)
      expect(responseData.currency).toBe('USD')
      expect(responseData.transactionId).toBe('TXN_DATA_TEST')
      expect(responseData.message).toBe('3D Secure doğrulaması başarıyla tamamlandı')
    })
  })

  describe('Validasyon Hataları', () => {
    it('should reject request without sessionId', async () => {
      const requestBody = {
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Session ID gerekli')
    })

    it('should reject request without pares', async () => {
      const requestBody = {
        sessionId: 'test_session'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('PARes gerekli')
    })

    it('should reject empty sessionId', async () => {
      const requestBody = {
        sessionId: '',
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Session ID gerekli')
    })

    it('should reject empty pares', async () => {
      const requestBody = {
        sessionId: 'test_session',
        pares: ''
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('PARes gerekli')
    })

    it('should reject null sessionId', async () => {
      const requestBody = {
        sessionId: null,
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Expected string, received null')
    })

    it('should reject null pares', async () => {
      const requestBody = {
        sessionId: 'test_session',
        pares: null
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Expected string, received null')
    })

    it('should reject non-string sessionId', async () => {
      const requestBody = {
        sessionId: 12345,
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Expected string, received number')
    })

    it('should reject non-string pares', async () => {
      const requestBody = {
        sessionId: 'test_session',
        pares: 12345
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Expected string, received number')
    })
  })

  describe('Session Doğrulama', () => {
    it('should reject invalid session ID', async () => {
      ;(get3DSecureSession as jest.Mock).mockReturnValue(null)

      const requestBody = {
        sessionId: 'invalid_session',
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Geçersiz veya süresi dolmuş 3D Secure session')

      expect(get3DSecureSession).toHaveBeenCalledWith('invalid_session')
    })

    it('should reject expired session', async () => {
      ;(get3DSecureSession as jest.Mock).mockReturnValue(null) // Expired session returns null

      const requestBody = {
        sessionId: 'expired_session',
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Geçersiz veya süresi dolmuş 3D Secure session')

      expect(get3DSecureSession).toHaveBeenCalledWith('expired_session')
    })

    it('should handle get3DSecureSession throwing error', async () => {
      ;(get3DSecureSession as jest.Mock).mockImplementation(() => {
        throw new Error('Session lookup error')
      })

      const requestBody = {
        sessionId: 'error_session',
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Session lookup error')

      expect(consoleErrorSpy).toHaveBeenCalledWith('3D Secure tamamlama hatası:', expect.any(Error))
    })
  })

  describe('3D Secure Service Hataları', () => {
    it('should handle 3D Secure completion failure', async () => {
      const mockSession = {
        sessionId: 'valid_session',
        cardToken: 'valid_token',
        amount: 100,
        currency: 'EUR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
      ;(complete3DSecure as jest.Mock).mockReturnValue({
        success: false,
        error: '3D Secure doğrulaması başarısız'
      })

      const requestBody = {
        sessionId: 'valid_session',
        pares: 'failed_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('3D Secure doğrulaması başarısız')

      expect(complete3DSecure).toHaveBeenCalledWith('valid_session', 'failed_pares')
    })

    it('should handle different failure scenarios', async () => {
      const mockSession = {
        sessionId: 'test_session',
        cardToken: 'test_token',
        amount: 100,
        currency: 'EUR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      const failureScenarios = [
        { error: 'Geçersiz PARes' },
        { error: 'Session süresi dolmuş' },
        { error: 'Bu session zaten işlenmiş' },
        { error: '3D Secure service unavailable' }
      ]

      for (const scenario of failureScenarios) {
        ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
        ;(complete3DSecure as jest.Mock).mockReturnValue({
          success: false,
          error: scenario.error
        })

        const requestBody = {
          sessionId: 'test_session',
          pares: 'test_pares'
        }

        const request = {
          json: jest.fn().mockResolvedValue(requestBody)
        } as any

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(400)
        expect(responseData.success).toBe(false)
        expect(responseData.error).toBe(scenario.error)
      }
    })

    it('should handle complete3DSecure throwing error', async () => {
      const mockSession = {
        sessionId: 'error_session',
        cardToken: 'error_token',
        amount: 100,
        currency: 'EUR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
      ;(complete3DSecure as jest.Mock).mockImplementation(() => {
        throw new Error('3D Secure completion failed')
      })

      const requestBody = {
        sessionId: 'error_session',
        pares: 'error_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('3D Secure completion failed')

      expect(consoleErrorSpy).toHaveBeenCalledWith('3D Secure tamamlama hatası:', expect.any(Error))
    })
  })

  describe('Güvenlik Kontrolleri', () => {
    it('should not expose session ID in response', async () => {
      const mockSession = {
        sessionId: 'sensitive_session_12345',
        cardToken: 'sensitive_token',
        amount: 100,
        currency: 'EUR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      const mockResult = {
        success: true,
        transactionId: 'TXN_SECURITY_TEST'
      }

      ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
      ;(complete3DSecure as jest.Mock).mockReturnValue(mockResult)

      const requestBody = {
        sessionId: 'sensitive_session_12345',
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      const responseString = JSON.stringify(responseData)
      expect(responseString).not.toContain('sensitive_session_12345')
      expect(responseString).not.toContain('sessionId')
    })

    it('should not expose card token in response', async () => {
      const mockSession = {
        sessionId: 'test_session',
        cardToken: 'sensitive_card_token_67890',
        amount: 100,
        currency: 'EUR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      const mockResult = {
        success: true,
        transactionId: 'TXN_TOKEN_TEST'
      }

      ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
      ;(complete3DSecure as jest.Mock).mockReturnValue(mockResult)

      const requestBody = {
        sessionId: 'test_session',
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      const responseString = JSON.stringify(responseData)
      expect(responseString).not.toContain('sensitive_card_token_67890')
      expect(responseString).not.toContain('cardToken')
    })

    it('should not expose PARes in logs', async () => {
      const mockSession = {
        sessionId: 'log_session',
        cardToken: 'log_token',
        amount: 100,
        currency: 'EUR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      const mockResult = {
        success: true,
        transactionId: 'TXN_LOG_TEST'
      }

      ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
      ;(complete3DSecure as jest.Mock).mockReturnValue(mockResult)

      const requestBody = {
        sessionId: 'log_session',
        pares: 'sensitive_pares_data_12345'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith('3D Secure tamamlandı: Session log_sess... - Transaction TXN_LOG_TEST')
      
      // Check that PARes is not logged
      const allCalls = consoleSpy.mock.calls.flat()
      const loggedText = allCalls.join(' ')
      expect(loggedText).not.toContain('sensitive_pares_data_12345')
    })

    it('should sanitize session ID in logs', async () => {
      const testCases = [
        { sessionId: '3ds_1234567890_abcdef_xyz', expected: '3ds_1234...' },
        { sessionId: 'session_123456789', expected: 'session_...' },
        { sessionId: 'short', expected: 'short...' },
        { sessionId: 'verylongsessionidwithmanycharacters', expected: 'verylong...' }
      ]

      const mockSession = {
        cardToken: 'test_token',
        amount: 100,
        currency: 'EUR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      const mockResult = {
        success: true,
        transactionId: 'TXN_SANITIZE_TEST'
      }

      for (const testCase of testCases) {
        ;(get3DSecureSession as jest.Mock).mockReturnValue({
          ...mockSession,
          sessionId: testCase.sessionId
        })
        ;(complete3DSecure as jest.Mock).mockReturnValue(mockResult)

        const requestBody = {
          sessionId: testCase.sessionId,
          pares: 'success_pares'
        }

        const request = {
          json: jest.fn().mockResolvedValue(requestBody)
        } as any

        await POST(request)

        expect(consoleSpy).toHaveBeenCalledWith(`3D Secure tamamlandı: Session ${testCase.expected} - Transaction TXN_SANITIZE_TEST`)
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty request body', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({})
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Required')
    })

    it('should handle request with extra fields', async () => {
      const mockSession = {
        sessionId: 'extra_session',
        cardToken: 'extra_token',
        amount: 100,
        currency: 'EUR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      const mockResult = {
        success: true,
        transactionId: 'TXN_EXTRA_TEST'
      }

      ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
      ;(complete3DSecure as jest.Mock).mockReturnValue(mockResult)

      const requestBody = {
        sessionId: 'extra_session',
        pares: 'success_pares',
        extraField: 'should be ignored',
        maliciousScript: '<script>alert("xss")</script>',
        anotherField: { nested: 'object' }
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)

      // Extra fields should be ignored
      expect(complete3DSecure).toHaveBeenCalledWith('extra_session', 'success_pares')
    })

    it('should handle very long sessionId and pares', async () => {
      const longSessionId = 'very_long_session_id_' + 'x'.repeat(1000)
      const longPares = 'very_long_pares_data_' + 'y'.repeat(1000)

      const mockSession = {
        sessionId: longSessionId,
        cardToken: 'long_token',
        amount: 100,
        currency: 'EUR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      const mockResult = {
        success: true,
        transactionId: 'TXN_LONG_TEST'
      }

      ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
      ;(complete3DSecure as jest.Mock).mockReturnValue(mockResult)

      const requestBody = {
        sessionId: longSessionId,
        pares: longPares
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)

      expect(complete3DSecure).toHaveBeenCalledWith(longSessionId, longPares)
    })

    it('should handle JSON parsing error', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Invalid JSON')

      expect(consoleErrorSpy).toHaveBeenCalledWith('3D Secure tamamlama hatası:', expect.any(Error))
    })

    it('should handle non-Error exceptions', async () => {
      const request = {
        json: jest.fn().mockRejectedValue('String error')
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('3D Secure doğrulaması tamamlanamadı')
    })

    it('should handle session with missing properties', async () => {
      const incompleteSession = {
        sessionId: 'incomplete_session',
        cardToken: 'incomplete_token',
        // Missing amount and currency
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      const mockResult = {
        success: true,
        transactionId: 'TXN_INCOMPLETE_TEST'
      }

      ;(get3DSecureSession as jest.Mock).mockReturnValue(incompleteSession)
      ;(complete3DSecure as jest.Mock).mockReturnValue(mockResult)

      const requestBody = {
        sessionId: 'incomplete_session',
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.amount).toBeUndefined()
      expect(responseData.currency).toBeUndefined()
      expect(responseData.transactionId).toBe('TXN_INCOMPLETE_TEST')
    })
  })

  describe('API Response Format', () => {
    it('should return correct response structure on success', async () => {
      const mockSession = {
        sessionId: 'format_session',
        cardToken: 'format_token',
        amount: 200,
        currency: 'USD',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      const mockResult = {
        success: true,
        transactionId: 'TXN_FORMAT_TEST'
      }

      ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
      ;(complete3DSecure as jest.Mock).mockReturnValue(mockResult)

      const requestBody = {
        sessionId: 'format_session',
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('transactionId', 'TXN_FORMAT_TEST')
      expect(responseData).toHaveProperty('amount', 200)
      expect(responseData).toHaveProperty('currency', 'USD')
      expect(responseData).toHaveProperty('message', '3D Secure doğrulaması başarıyla tamamlandı')
      expect(responseData).not.toHaveProperty('error')
    })

    it('should return correct response structure on validation error', async () => {
      const requestBody = {
        sessionId: '',
        pares: 'success_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('error')
      expect(responseData).not.toHaveProperty('transactionId')
      expect(responseData).not.toHaveProperty('amount')
      expect(responseData).not.toHaveProperty('currency')
      expect(responseData).not.toHaveProperty('message')
    })

    it('should return correct response structure on service error', async () => {
      const mockSession = {
        sessionId: 'error_session',
        cardToken: 'error_token',
        amount: 100,
        currency: 'EUR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        status: 'pending' as const
      }

      ;(get3DSecureSession as jest.Mock).mockReturnValue(mockSession)
      ;(complete3DSecure as jest.Mock).mockReturnValue({
        success: false,
        error: 'Service error'
      })

      const requestBody = {
        sessionId: 'error_session',
        pares: 'error_pares'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('error', 'Service error')
      expect(responseData).not.toHaveProperty('transactionId')
      expect(responseData).not.toHaveProperty('amount')
      expect(responseData).not.toHaveProperty('currency')
      expect(responseData).not.toHaveProperty('message')
    })
  })
})

describe('GET /api/payment/3d-secure/complete', () => {
  it('should reject GET requests with 405 status', async () => {
    const response = await GET()
    const responseData = await response.json()

    expect(response.status).toBe(405)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('Bu endpoint sadece POST method ile kullanılabilir.')
  })
})