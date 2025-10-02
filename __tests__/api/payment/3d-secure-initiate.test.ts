import { POST, GET } from '@/app/api/payment/3d-secure/initiate/route'
import { initiate3DSecure } from '@/lib/threeDSecure'
import { getCardFromToken, getSecureCardInfo } from '@/lib/cardTokenization'

// Mock dependencies
jest.mock('@/lib/threeDSecure', () => ({
  initiate3DSecure: jest.fn()
}))

jest.mock('@/lib/cardTokenization', () => ({
  getCardFromToken: jest.fn(),
  getSecureCardInfo: jest.fn()
}))

// Mock console methods
const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

describe('POST /api/payment/3d-secure/initiate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('Başarılı 3D Secure Başlatma', () => {
    it('should initiate 3D Secure successfully', async () => {
      const mockCardData = {
        number: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        name: 'John Doe'
      }

      const mockSecureCardInfo = {
        lastFour: '1111',
        brand: 'Visa',
        expiryMonth: '12',
        expiryYear: '2025',
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000
      }

      const mock3DResult = {
        success: true,
        sessionId: '3ds_abc123_def456_789',
        acsUrl: 'https://3dsecure-demo.biletdukkani.com/acs',
        pareq: 'base64-encoded-pareq-data',
        md: 'base64-encoded-md-data'
      }

      ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
      ;(getSecureCardInfo as jest.Mock).mockReturnValue(mockSecureCardInfo)
      ;(initiate3DSecure as jest.Mock).mockReturnValue(mock3DResult)

      const requestBody = {
        cardToken: 'card_token_123',
        amount: 150.50,
        currency: 'EUR',
        orderId: 'order_123',
        description: 'Flight booking payment'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.sessionId).toBe('3ds_abc123_def456_789')
      expect(responseData.acsUrl).toBe('https://3dsecure-demo.biletdukkani.com/acs')
      expect(responseData.pareq).toBe('base64-encoded-pareq-data')
      expect(responseData.md).toBe('base64-encoded-md-data')
      expect(responseData.message).toBe('3D Secure işlemi başlatıldı. Kullanıcıyı ACS sayfasına yönlendirin.')

      expect(getCardFromToken).toHaveBeenCalledWith('card_token_123')
      expect(getSecureCardInfo).toHaveBeenCalledWith('card_token_123')
      expect(initiate3DSecure).toHaveBeenCalledWith({
        cardToken: 'card_token_123',
        amount: 150.50,
        currency: 'EUR',
        orderId: 'order_123',
        description: 'Flight booking payment'
      })

      expect(consoleSpy).toHaveBeenCalledWith('3D Secure başlatıldı: 150.5 EUR - Visa ****1111')
    })

    it('should work with minimal required fields', async () => {
      const mockCardData = { number: '5555555555554444', name: 'Jane Doe' }
      const mockSecureCardInfo = { lastFour: '4444', brand: 'MasterCard' }
      const mock3DResult = {
        success: true,
        sessionId: '3ds_minimal_test',
        acsUrl: 'https://3ds-demo.com/acs',
        pareq: 'minimal-pareq',
        md: 'minimal-md'
      }

      ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
      ;(getSecureCardInfo as jest.Mock).mockReturnValue(mockSecureCardInfo)
      ;(initiate3DSecure as jest.Mock).mockReturnValue(mock3DResult)

      const requestBody = {
        cardToken: 'minimal_token',
        amount: 100,
        currency: 'USD'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.sessionId).toBe('3ds_minimal_test')

      expect(initiate3DSecure).toHaveBeenCalledWith({
        cardToken: 'minimal_token',
        amount: 100,
        currency: 'USD',
        orderId: undefined,
        description: undefined
      })

      expect(consoleSpy).toHaveBeenCalledWith('3D Secure başlatıldı: 100 USD - MasterCard ****4444')
    })

    it('should handle different currencies', async () => {
      const mockCardData = { number: '378282246310005', name: 'Test User' }
      const mockSecureCardInfo = { lastFour: '0005', brand: 'American Express' }
      const mock3DResult = {
        success: true,
        sessionId: '3ds_currency_test',
        acsUrl: 'https://3ds-demo.com/acs',
        pareq: 'currency-pareq',
        md: 'currency-md'
      }

      const currencies = ['EUR', 'USD', 'GBP', 'TRY', 'JPY']

      for (const currency of currencies) {
        ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
        ;(getSecureCardInfo as jest.Mock).mockReturnValue(mockSecureCardInfo)
        ;(initiate3DSecure as jest.Mock).mockReturnValue(mock3DResult)

        const requestBody = {
          cardToken: 'currency_token',
          amount: 200,
          currency: currency
        }

        const request = {
          json: jest.fn().mockResolvedValue(requestBody)
        } as any

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)

        expect(initiate3DSecure).toHaveBeenCalledWith({
          cardToken: 'currency_token',
          amount: 200,
          currency: currency,
          orderId: undefined,
          description: undefined
        })
      }
    })

    it('should handle decimal amounts correctly', async () => {
      const mockCardData = { number: '4111111111111111', name: 'Decimal User' }
      const mockSecureCardInfo = { lastFour: '1111', brand: 'Visa' }
      const mock3DResult = {
        success: true,
        sessionId: '3ds_decimal_test',
        acsUrl: 'https://3ds-demo.com/acs',
        pareq: 'decimal-pareq',
        md: 'decimal-md'
      }

      const amounts = [0.01, 99.99, 1234.56, 9999.99]

      for (const amount of amounts) {
        ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
        ;(getSecureCardInfo as jest.Mock).mockReturnValue(mockSecureCardInfo)
        ;(initiate3DSecure as jest.Mock).mockReturnValue(mock3DResult)

        const requestBody = {
          cardToken: 'decimal_token',
          amount: amount,
          currency: 'EUR'
        }

        const request = {
          json: jest.fn().mockResolvedValue(requestBody)
        } as any

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)

        expect(initiate3DSecure).toHaveBeenCalledWith({
          cardToken: 'decimal_token',
          amount: amount,
          currency: 'EUR',
          orderId: undefined,
          description: undefined
        })
      }
    })
  })

  describe('Validasyon Hataları', () => {
    it('should reject request without cardToken', async () => {
      const requestBody = {
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Kart token gerekli')
    })

    it('should reject request without amount', async () => {
      const requestBody = {
        cardToken: 'test_token',
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Required')
    })

    it('should reject request without currency', async () => {
      const requestBody = {
        cardToken: 'test_token',
        amount: 100
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Required')
    })

    it('should reject empty cardToken', async () => {
      const requestBody = {
        cardToken: '',
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Kart token gerekli')
    })

    it('should reject zero or negative amount', async () => {
      const invalidAmounts = [0, -1, -100.50]

      for (const amount of invalidAmounts) {
        const requestBody = {
          cardToken: 'test_token',
          amount: amount,
          currency: 'EUR'
        }

        const request = {
          json: jest.fn().mockResolvedValue(requestBody)
        } as any

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(400)
        expect(responseData.success).toBe(false)
        expect(responseData.error).toContain('Geçerli bir tutar girin')
      }
    })

    it('should reject invalid currency format', async () => {
      const invalidCurrencies = ['E', 'EU', 'EURO', '123', '', 'eur']

      for (const currency of invalidCurrencies) {
        const requestBody = {
          cardToken: 'test_token',
          amount: 100,
          currency: currency
        }

        const request = {
          json: jest.fn().mockResolvedValue(requestBody)
        } as any

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(400)
        expect(responseData.success).toBe(false)
        expect(responseData.error).toContain('Geçerli bir para birimi girin')
      }
    })

    it('should reject non-string cardToken', async () => {
      const requestBody = {
        cardToken: 123,
        amount: 100,
        currency: 'EUR'
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

    it('should reject non-number amount', async () => {
      const requestBody = {
        cardToken: 'test_token',
        amount: '100',
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Expected number, received string')
    })
  })

  describe('Token Doğrulama', () => {
    it('should reject invalid card token', async () => {
      ;(getCardFromToken as jest.Mock).mockReturnValue(null)

      const requestBody = {
        cardToken: 'invalid_token',
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Geçersiz veya süresi dolmuş kart token')

      expect(getCardFromToken).toHaveBeenCalledWith('invalid_token')
    })

    it('should reject expired card token', async () => {
      ;(getCardFromToken as jest.Mock).mockReturnValue(null) // Expired token returns null

      const requestBody = {
        cardToken: 'expired_token',
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Geçersiz veya süresi dolmuş kart token')

      expect(getCardFromToken).toHaveBeenCalledWith('expired_token')
    })

    it('should handle getCardFromToken throwing error', async () => {
      ;(getCardFromToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token validation error')
      })

      const requestBody = {
        cardToken: 'error_token',
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Token validation error')

      expect(consoleErrorSpy).toHaveBeenCalledWith('3D Secure başlatma hatası:', expect.any(Error))
    })
  })

  describe('3D Secure Service Hataları', () => {
    it('should handle 3D Secure service failure', async () => {
      const mockCardData = { number: '4111111111111111', name: 'Test User' }
      const mockSecureCardInfo = { lastFour: '1111', brand: 'Visa' }

      ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
      ;(getSecureCardInfo as jest.Mock).mockReturnValue(mockSecureCardInfo)
      ;(initiate3DSecure as jest.Mock).mockReturnValue({
        success: false,
        error: '3D Secure service unavailable'
      })

      const requestBody = {
        cardToken: 'valid_token',
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('3D Secure service unavailable')

      expect(initiate3DSecure).toHaveBeenCalledWith({
        cardToken: 'valid_token',
        amount: 100,
        currency: 'EUR',
        orderId: undefined,
        description: undefined
      })
    })

    it('should handle 3D Secure service throwing error', async () => {
      const mockCardData = { number: '4111111111111111', name: 'Test User' }
      const mockSecureCardInfo = { lastFour: '1111', brand: 'Visa' }

      ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
      ;(getSecureCardInfo as jest.Mock).mockReturnValue(mockSecureCardInfo)
      ;(initiate3DSecure as jest.Mock).mockImplementation(() => {
        throw new Error('3D Secure initialization failed')
      })

      const requestBody = {
        cardToken: 'valid_token',
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('3D Secure initialization failed')

      expect(consoleErrorSpy).toHaveBeenCalledWith('3D Secure başlatma hatası:', expect.any(Error))
    })

    it('should handle missing secure card info', async () => {
      const mockCardData = { number: '4111111111111111', name: 'Test User' }

      ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
      ;(getSecureCardInfo as jest.Mock).mockReturnValue(null) // No secure info
      ;(initiate3DSecure as jest.Mock).mockReturnValue({
        success: true,
        sessionId: '3ds_test',
        acsUrl: 'https://test.com',
        pareq: 'test',
        md: 'test'
      })

      const requestBody = {
        cardToken: 'valid_token',
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)

      // Should handle null secureCardInfo gracefully
      expect(consoleSpy).toHaveBeenCalledWith('3D Secure başlatıldı: 100 EUR - undefined ****undefined')
    })
  })

  describe('Güvenlik Kontrolleri', () => {
    it('should not expose card token in response', async () => {
      const mockCardData = { number: '4111111111111111', name: 'Test User' }
      const mockSecureCardInfo = { lastFour: '1111', brand: 'Visa' }
      const mock3DResult = {
        success: true,
        sessionId: '3ds_security_test',
        acsUrl: 'https://3ds-demo.com/acs',
        pareq: 'security-pareq',
        md: 'security-md'
      }

      ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
      ;(getSecureCardInfo as jest.Mock).mockReturnValue(mockSecureCardInfo)
      ;(initiate3DSecure as jest.Mock).mockReturnValue(mock3DResult)

      const requestBody = {
        cardToken: 'sensitive_token_12345',
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      const responseString = JSON.stringify(responseData)
      expect(responseString).not.toContain('sensitive_token_12345')
      expect(responseString).not.toContain('cardToken')
    })

    it('should not expose full card number in logs', async () => {
      const mockCardData = { number: '4111111111111111', name: 'Test User' }
      const mockSecureCardInfo = { lastFour: '1111', brand: 'Visa' }
      const mock3DResult = {
        success: true,
        sessionId: '3ds_log_test',
        acsUrl: 'https://3ds-demo.com/acs',
        pareq: 'log-pareq',
        md: 'log-md'
      }

      ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
      ;(getSecureCardInfo as jest.Mock).mockReturnValue(mockSecureCardInfo)
      ;(initiate3DSecure as jest.Mock).mockReturnValue(mock3DResult)

      const requestBody = {
        cardToken: 'log_token',
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith('3D Secure başlatıldı: 100 EUR - Visa ****1111')
      
      // Check that full card number is not logged
      const allCalls = consoleSpy.mock.calls.flat()
      const loggedText = allCalls.join(' ')
      expect(loggedText).not.toContain('4111111111111111')
    })

    it('should sanitize sensitive data in different scenarios', async () => {
      const testCases = [
        { brand: 'MasterCard', lastFour: '5544' },
        { brand: 'American Express', lastFour: '0005' },
        { brand: 'Discover', lastFour: '1117' }
      ]

      const mockCardData = { number: '1234567890123456', name: 'Test User' }
      const mock3DResult = {
        success: true,
        sessionId: '3ds_sanitize_test',
        acsUrl: 'https://3ds-demo.com/acs',
        pareq: 'sanitize-pareq',
        md: 'sanitize-md'
      }

      for (const testCase of testCases) {
        ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
        ;(getSecureCardInfo as jest.Mock).mockReturnValue(testCase)
        ;(initiate3DSecure as jest.Mock).mockReturnValue(mock3DResult)

        const requestBody = {
          cardToken: 'sanitize_token',
          amount: 100,
          currency: 'EUR'
        }

        const request = {
          json: jest.fn().mockResolvedValue(requestBody)
        } as any

        await POST(request)

        expect(consoleSpy).toHaveBeenCalledWith(`3D Secure başlatıldı: 100 EUR - ${testCase.brand} ****${testCase.lastFour}`)
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
      const mockCardData = { number: '4111111111111111', name: 'Test User' }
      const mockSecureCardInfo = { lastFour: '1111', brand: 'Visa' }
      const mock3DResult = {
        success: true,
        sessionId: '3ds_extra_test',
        acsUrl: 'https://3ds-demo.com/acs',
        pareq: 'extra-pareq',
        md: 'extra-md'
      }

      ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
      ;(getSecureCardInfo as jest.Mock).mockReturnValue(mockSecureCardInfo)
      ;(initiate3DSecure as jest.Mock).mockReturnValue(mock3DResult)

      const requestBody = {
        cardToken: 'extra_token',
        amount: 100,
        currency: 'EUR',
        orderId: 'order_123',
        description: 'Test payment',
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
      expect(initiate3DSecure).toHaveBeenCalledWith({
        cardToken: 'extra_token',
        amount: 100,
        currency: 'EUR',
        orderId: 'order_123',
        description: 'Test payment'
      })
    })

    it('should handle very large amounts', async () => {
      const mockCardData = { number: '4111111111111111', name: 'Test User' }
      const mockSecureCardInfo = { lastFour: '1111', brand: 'Visa' }
      const mock3DResult = {
        success: true,
        sessionId: '3ds_large_test',
        acsUrl: 'https://3ds-demo.com/acs',
        pareq: 'large-pareq',
        md: 'large-md'
      }

      ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
      ;(getSecureCardInfo as jest.Mock).mockReturnValue(mockSecureCardInfo)
      ;(initiate3DSecure as jest.Mock).mockReturnValue(mock3DResult)

      const requestBody = {
        cardToken: 'large_token',
        amount: 999999999.99,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)

      expect(initiate3DSecure).toHaveBeenCalledWith({
        cardToken: 'large_token',
        amount: 999999999.99,
        currency: 'EUR',
        orderId: undefined,
        description: undefined
      })
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

      expect(consoleErrorSpy).toHaveBeenCalledWith('3D Secure başlatma hatası:', expect.any(Error))
    })

    it('should handle non-Error exceptions', async () => {
      const request = {
        json: jest.fn().mockRejectedValue('String error')
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('3D Secure işlemi başlatılamadı')
    })
  })

  describe('API Response Format', () => {
    it('should return correct response structure on success', async () => {
      const mockCardData = { number: '4111111111111111', name: 'Test User' }
      const mockSecureCardInfo = { lastFour: '1111', brand: 'Visa' }
      const mock3DResult = {
        success: true,
        sessionId: '3ds_format_test',
        acsUrl: 'https://3ds-demo.com/acs',
        pareq: 'format-pareq',
        md: 'format-md'
      }

      ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
      ;(getSecureCardInfo as jest.Mock).mockReturnValue(mockSecureCardInfo)
      ;(initiate3DSecure as jest.Mock).mockReturnValue(mock3DResult)

      const requestBody = {
        cardToken: 'format_token',
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('sessionId', '3ds_format_test')
      expect(responseData).toHaveProperty('acsUrl', 'https://3ds-demo.com/acs')
      expect(responseData).toHaveProperty('pareq', 'format-pareq')
      expect(responseData).toHaveProperty('md', 'format-md')
      expect(responseData).toHaveProperty('message')
      expect(responseData).not.toHaveProperty('error')
    })

    it('should return correct response structure on validation error', async () => {
      const requestBody = {
        cardToken: '',
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('error')
      expect(responseData).not.toHaveProperty('sessionId')
      expect(responseData).not.toHaveProperty('acsUrl')
      expect(responseData).not.toHaveProperty('pareq')
      expect(responseData).not.toHaveProperty('md')
      expect(responseData).not.toHaveProperty('message')
    })

    it('should return correct response structure on service error', async () => {
      const mockCardData = { number: '4111111111111111', name: 'Test User' }
      const mockSecureCardInfo = { lastFour: '1111', brand: 'Visa' }

      ;(getCardFromToken as jest.Mock).mockReturnValue(mockCardData)
      ;(getSecureCardInfo as jest.Mock).mockReturnValue(mockSecureCardInfo)
      ;(initiate3DSecure as jest.Mock).mockReturnValue({
        success: false,
        error: 'Service error'
      })

      const requestBody = {
        cardToken: 'error_token',
        amount: 100,
        currency: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('error', 'Service error')
      expect(responseData).not.toHaveProperty('sessionId')
      expect(responseData).not.toHaveProperty('acsUrl')
      expect(responseData).not.toHaveProperty('pareq')
      expect(responseData).not.toHaveProperty('md')
      expect(responseData).not.toHaveProperty('message')
    })
  })
})

describe('GET /api/payment/3d-secure/initiate', () => {
  it('should reject GET requests with 405 status', async () => {
    const response = await GET()
    const responseData = await response.json()

    expect(response.status).toBe(405)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('Bu endpoint sadece POST method ile kullanılabilir.')
  })
})