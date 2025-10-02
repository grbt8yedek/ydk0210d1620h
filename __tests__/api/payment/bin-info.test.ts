import { POST, GET } from '@/app/api/payment/bin-info/route'
import { getCardBinInfo } from '@/services/paymentApi'

// Mock dependencies
jest.mock('@/services/paymentApi', () => ({
  getCardBinInfo: jest.fn()
}))

// Mock console methods
const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

describe('POST /api/payment/bin-info', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('Başarılı BIN Bilgisi Alma', () => {
    it('should return BIN info successfully', async () => {
      const mockBinInfo = {
        memberNo: 111,
        memberName: 'QNB FINANSBANK A.S.',
        prefixNo: 415565,
        cardType: 'CREDIT CARD',
        brand: 'CardFinans',
        schema: 'VISA',
        schemaRule: {
          panMinDigitCount: 16,
          panMaxDigitCount: 16,
          cvvDigitCount: 3,
          format: '#### #### #### ####'
        },
        logoUrl: 'https://example.com/logo.png',
        installments: [
          { id: 55, count: 1, enable: true, vposId: 0, interestRate: 1, commissionRate: 1, discountRate: 1, otherBankRate: 1 },
          { id: 56, count: 2, enable: true, vposId: 0, interestRate: 2, commissionRate: 1, discountRate: 1, otherBankRate: 1 }
        ],
        businessCard: false,
        directPaymentActive: true,
        secure3dPaymentActive: true,
        isThreeD: false
      }

      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: '4155650000000001',
        price: 100,
        productType: 'flight',
        currencyCode: 'EUR'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockBinInfo)

      expect(getCardBinInfo).toHaveBeenCalledWith('4155650000000001', {
        withInstallment: true,
        price: 100,
        productType: 'flight',
        currencyCode: 'EUR'
      })

      expect(consoleSpy).toHaveBeenCalledWith('BIN bilgisi isteniyor: 415565**** (16 hane)')
    })

    it('should handle card number with spaces', async () => {
      const mockBinInfo = {
        memberNo: 46,
        memberName: 'AKBANK T.A.S.',
        prefixNo: 435508,
        cardType: 'CREDIT CARD',
        brand: 'AXESS',
        schema: 'VISA',
        installments: [],
        businessCard: false,
        directPaymentActive: true,
        secure3dPaymentActive: true,
        isThreeD: false
      }

      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: '4355 0800 0000 0001'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockBinInfo)

      expect(getCardBinInfo).toHaveBeenCalledWith('4355 0800 0000 0001', {
        withInstallment: true,
        price: undefined,
        productType: undefined,
        currencyCode: undefined
      })

      expect(consoleSpy).toHaveBeenCalledWith('BIN bilgisi isteniyor: 435508**** (16 hane)')
    })

    it('should work with minimal request data', async () => {
      const mockBinInfo = {
        memberNo: 999,
        memberName: 'DEMO BANK',
        prefixNo: 123456,
        cardType: 'CREDIT CARD',
        brand: 'DemoCard',
        schema: 'VISA',
        installments: [],
        businessCard: false,
        directPaymentActive: true,
        secure3dPaymentActive: true,
        isThreeD: false
      }

      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: '1234567890123456'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockBinInfo)

      expect(getCardBinInfo).toHaveBeenCalledWith('1234567890123456', {
        withInstallment: true,
        price: undefined,
        productType: undefined,
        currencyCode: undefined
      })
    })

    it('should handle different card number lengths', async () => {
      const testCases = [
        { cardNumber: '123456', expectedLength: 6 },
        { cardNumber: '1234567890123', expectedLength: 13 },
        { cardNumber: '1234567890123456', expectedLength: 16 },
        { cardNumber: '12345678901234567', expectedLength: 17 },
        { cardNumber: '123456789012345678', expectedLength: 18 },
        { cardNumber: '1234567890123456789', expectedLength: 19 }
      ]

      const mockBinInfo = { memberNo: 999, installments: [], businessCard: false, directPaymentActive: true, secure3dPaymentActive: true, isThreeD: false }

      for (const testCase of testCases) {
        ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

        const requestBody = { cardNumber: testCase.cardNumber }
        const request = { json: jest.fn().mockResolvedValue(requestBody) } as any

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)

        const expectedBin = testCase.cardNumber.substring(0, 6)
        expect(consoleSpy).toHaveBeenCalledWith(`BIN bilgisi isteniyor: ${expectedBin}**** (${testCase.expectedLength} hane)`)
      }
    })
  })

  describe('Validasyon Hataları', () => {
    it('should reject request without cardNumber', async () => {
      const requestBody = {
        price: 100,
        productType: 'flight'
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

    it('should reject card number shorter than 6 digits', async () => {
      const requestBody = {
        cardNumber: '12345'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('En az 6 hane gerekli')
    })

    it('should reject card number longer than 19 digits', async () => {
      const requestBody = {
        cardNumber: '12345678901234567890'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Geçersiz kart numarası')
    })

    it('should reject empty card number', async () => {
      const requestBody = {
        cardNumber: ''
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('En az 6 hane gerekli')
    })

    it('should reject null card number', async () => {
      const requestBody = {
        cardNumber: null
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

    it('should reject non-string card number', async () => {
      const requestBody = {
        cardNumber: 1234567890123456
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

    it('should handle invalid price type', async () => {
      const requestBody = {
        cardNumber: '1234567890123456',
        price: 'invalid'
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

    it('should handle negative price', async () => {
      const mockBinInfo = { memberNo: 999, installments: [], businessCard: false, directPaymentActive: true, secure3dPaymentActive: true, isThreeD: false }
      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: '1234567890123456',
        price: -100
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      // Negative price is allowed by schema, should succeed
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)

      expect(getCardBinInfo).toHaveBeenCalledWith('1234567890123456', {
        withInstallment: true,
        price: -100,
        productType: undefined,
        currencyCode: undefined
      })
    })
  })

  describe('Güvenlik Kontrolleri', () => {
    it('should not expose full card number in logs', async () => {
      const mockBinInfo = { memberNo: 999, installments: [], businessCard: false, directPaymentActive: true, secure3dPaymentActive: true, isThreeD: false }
      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: '4111111111111111'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith('BIN bilgisi isteniyor: 411111**** (16 hane)')
      
      // Check that full card number is not logged
      const allCalls = consoleSpy.mock.calls.flat()
      const loggedText = allCalls.join(' ')
      expect(loggedText).not.toContain('4111111111111111')
    })

    it('should not expose full card number in response', async () => {
      const mockBinInfo = { memberNo: 999, installments: [], businessCard: false, directPaymentActive: true, secure3dPaymentActive: true, isThreeD: false }
      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: '4111111111111111'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      const responseString = JSON.stringify(responseData)
      expect(responseString).not.toContain('4111111111111111')
      expect(responseString).not.toContain('cardNumber')
    })

    it('should handle card numbers with special characters', async () => {
      const mockBinInfo = { memberNo: 999, installments: [], businessCard: false, directPaymentActive: true, secure3dPaymentActive: true, isThreeD: false }
      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: '4111-1111-1111-1111'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)

      expect(getCardBinInfo).toHaveBeenCalledWith('4111-1111-1111-1111', expect.any(Object))
      expect(consoleSpy).toHaveBeenCalledWith('BIN bilgisi isteniyor: 411111**** (19 hane)')
    })

    it('should sanitize BIN in logs for different card formats', async () => {
      const testCases = [
        { cardNumber: '4111 1111 1111 1111', expectedBin: '411111' },
        { cardNumber: '5555555555554444', expectedBin: '555555' },
        { cardNumber: '378282246310005', expectedBin: '378282' },
        { cardNumber: '6011111111111117', expectedBin: '601111' }
      ]

      const mockBinInfo = { memberNo: 999, installments: [], businessCard: false, directPaymentActive: true, secure3dPaymentActive: true, isThreeD: false }

      for (const testCase of testCases) {
        ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

        const requestBody = { cardNumber: testCase.cardNumber }
        const request = { json: jest.fn().mockResolvedValue(requestBody) } as any

        await POST(request)

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(`BIN bilgisi isteniyor: ${testCase.expectedBin}****`)
        )
      }
    })
  })

  describe('Hata Durumları', () => {
    it('should handle getCardBinInfo service error', async () => {
      ;(getCardBinInfo as jest.Mock).mockRejectedValue(new Error('Service unavailable'))

      const requestBody = {
        cardNumber: '4111111111111111'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Service unavailable')

      expect(consoleErrorSpy).toHaveBeenCalledWith('BIN bilgisi alınırken hata:', expect.any(Error))
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

      expect(consoleErrorSpy).toHaveBeenCalledWith('BIN bilgisi alınırken hata:', expect.any(Error))
    })

    it('should handle non-Error exceptions', async () => {
      ;(getCardBinInfo as jest.Mock).mockRejectedValue('String error')

      const requestBody = {
        cardNumber: '4111111111111111'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Bilinmeyen hata')
    })

    it('should handle null error', async () => {
      ;(getCardBinInfo as jest.Mock).mockRejectedValue(null)

      const requestBody = {
        cardNumber: '4111111111111111'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Bilinmeyen hata')
    })

    it('should handle undefined error', async () => {
      ;(getCardBinInfo as jest.Mock).mockRejectedValue(undefined)

      const requestBody = {
        cardNumber: '4111111111111111'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Bilinmeyen hata')
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
      const mockBinInfo = { memberNo: 999, installments: [], businessCard: false, directPaymentActive: true, secure3dPaymentActive: true, isThreeD: false }
      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: '4111111111111111',
        price: 100,
        productType: 'flight',
        currencyCode: 'EUR',
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
      expect(responseData.data).toEqual(mockBinInfo)

      // Extra fields should be ignored
      expect(getCardBinInfo).toHaveBeenCalledWith('4111111111111111', {
        withInstallment: true,
        price: 100,
        productType: 'flight',
        currencyCode: 'EUR'
      })
    })

    it('should handle very long card number (edge of validation)', async () => {
      const longCardNumber = '1234567890123456789' // 19 digits (max allowed)
      const mockBinInfo = { memberNo: 999, installments: [], businessCard: false, directPaymentActive: true, secure3dPaymentActive: true, isThreeD: false }
      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: longCardNumber
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockBinInfo)

      expect(consoleSpy).toHaveBeenCalledWith('BIN bilgisi isteniyor: 123456**** (19 hane)')
    })

    it('should handle minimum card number length (edge of validation)', async () => {
      const shortCardNumber = '123456' // 6 digits (min allowed)
      const mockBinInfo = { memberNo: 999, installments: [], businessCard: false, directPaymentActive: true, secure3dPaymentActive: true, isThreeD: false }
      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: shortCardNumber
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockBinInfo)

      expect(consoleSpy).toHaveBeenCalledWith('BIN bilgisi isteniyor: 123456**** (6 hane)')
    })

    it('should handle zero price', async () => {
      const mockBinInfo = { memberNo: 999, installments: [], businessCard: false, directPaymentActive: true, secure3dPaymentActive: true, isThreeD: false }
      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: '4111111111111111',
        price: 0
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)

      expect(getCardBinInfo).toHaveBeenCalledWith('4111111111111111', {
        withInstallment: true,
        price: 0,
        productType: undefined,
        currencyCode: undefined
      })
    })

    it('should handle very large price', async () => {
      const mockBinInfo = { memberNo: 999, installments: [], businessCard: false, directPaymentActive: true, secure3dPaymentActive: true, isThreeD: false }
      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: '4111111111111111',
        price: 999999999.99
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)

      expect(getCardBinInfo).toHaveBeenCalledWith('4111111111111111', {
        withInstallment: true,
        price: 999999999.99,
        productType: undefined,
        currencyCode: undefined
      })
    })
  })

  describe('API Response Format', () => {
    it('should return correct response structure on success', async () => {
      const mockBinInfo = {
        memberNo: 111,
        memberName: 'TEST BANK',
        prefixNo: 411111,
        cardType: 'CREDIT CARD',
        brand: 'TestCard',
        schema: 'VISA',
        installments: [],
        businessCard: false,
        directPaymentActive: true,
        secure3dPaymentActive: true,
        isThreeD: false
      }

      ;(getCardBinInfo as jest.Mock).mockResolvedValue(mockBinInfo)

      const requestBody = {
        cardNumber: '4111111111111111'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('data')
      expect(responseData.data).toEqual(mockBinInfo)
      expect(responseData).not.toHaveProperty('error')
    })

    it('should return correct response structure on validation error', async () => {
      const requestBody = {
        cardNumber: '123'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('error')
      expect(responseData).not.toHaveProperty('data')
      expect(typeof responseData.error).toBe('string')
    })

    it('should return correct response structure on service error', async () => {
      ;(getCardBinInfo as jest.Mock).mockRejectedValue(new Error('Service error'))

      const requestBody = {
        cardNumber: '4111111111111111'
      }

      const request = {
        json: jest.fn().mockResolvedValue(requestBody)
      } as any

      const response = await POST(request)
      const responseData = await response.json()

      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('error')
      expect(responseData).not.toHaveProperty('data')
      expect(typeof responseData.error).toBe('string')
    })
  })
})

describe('GET /api/payment/bin-info', () => {
  it('should reject GET requests with 405 status', async () => {
    const request = {} as any

    const response = await GET(request)
    const responseData = await response.json()

    expect(response.status).toBe(405)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('Bu endpoint sadece POST method ile kullanılabilir. Güvenlik nedeniyle GET method devre dışıdır.')
  })

  it('should not accept any parameters in GET request', async () => {
    const request = {
      url: 'https://example.com/api/payment/bin-info?cardNumber=4111111111111111',
      nextUrl: {
        searchParams: new URLSearchParams('cardNumber=4111111111111111')
      }
    } as any

    const response = await GET(request)
    const responseData = await response.json()

    expect(response.status).toBe(405)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('Bu endpoint sadece POST method ile kullanılabilir. Güvenlik nedeniyle GET method devre dışıdır.')
  })
})