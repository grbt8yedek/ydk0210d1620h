import { POST, GET } from '@/app/api/payment/tokenize/route'
import { NextRequest } from 'next/server'
import { tokenizeCard } from '@/lib/cardTokenization'
import {
  validateCardNumber,
  validateCVV,
  validateExpiryDate,
  pciRateLimit,
  auditLog
} from '@/lib/pciCompliance'
import { createMockCard } from '@/__tests__/helpers/mockData'

// Mock dependencies
jest.mock('@/lib/cardTokenization')
jest.mock('@/lib/pciCompliance')

const mockTokenizeCard = tokenizeCard as jest.MockedFunction<typeof tokenizeCard>
const mockValidateCardNumber = validateCardNumber as jest.MockedFunction<typeof validateCardNumber>
const mockValidateCVV = validateCVV as jest.MockedFunction<typeof validateCVV>
const mockValidateExpiryDate = validateExpiryDate as jest.MockedFunction<typeof validateExpiryDate>
const mockPciRateLimit = pciRateLimit as jest.Mocked<typeof pciRateLimit>
const mockAuditLog = auditLog as jest.MockedFunction<typeof auditLog>

describe('POST /api/payment/tokenize', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mocks
    mockPciRateLimit.isAllowed = jest.fn().mockReturnValue(true)
    mockValidateCardNumber.mockReturnValue(true)
    mockValidateCVV.mockReturnValue(true)
    mockValidateExpiryDate.mockReturnValue(true)
    mockTokenizeCard.mockReturnValue('mock-token-123456789')
  })

  describe('✅ Başarılı Senaryolar', () => {
    it('should tokenize card successfully', async () => {
      const mockCard = createMockCard()

      const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
        method: 'POST',
        body: JSON.stringify({
          number: mockCard.number,
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: mockCard.cvv,
          name: mockCard.holderName,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.token).toBe('mock-token-123456789')
      expect(data.cardInfo).toBeDefined()
      expect(data.cardInfo.lastFour).toBe('4242')
      expect(data.cardInfo.brand).toBe('Visa')
      expect(data.expiresIn).toBe(3600)
      expect(mockAuditLog).toHaveBeenCalledWith('CARD_TOKENIZED', expect.any(Object))
    })

    it('should handle card number with spaces', async () => {
      mockValidateCardNumber.mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
        method: 'POST',
        body: JSON.stringify({
          number: '4242 4242 4242 4242',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          name: 'TEST USER',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockTokenizeCard).toHaveBeenCalledWith(
        expect.objectContaining({
          number: '4242424242424242', // Boşluklar temizlenmeli
        })
      )
    })

    it('should detect different card brands correctly', async () => {
      const testCases = [
        { number: '4242424242424242', expectedBrand: 'Visa' },
        { number: '5555555555554444', expectedBrand: 'MasterCard' },
        { number: '378282246310005', expectedBrand: 'American Express' },
        { number: '6011111111111117', expectedBrand: 'Discover' },
      ]

      for (const testCase of testCases) {
        const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
          method: 'POST',
          body: JSON.stringify({
            number: testCase.number,
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '123',
            name: 'TEST USER',
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(data.cardInfo.brand).toBe(testCase.expectedBrand)
      }
    })
  })

  describe('❌ Validation Hataları', () => {
    it('should return error for missing card number', async () => {
      const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
        method: 'POST',
        body: JSON.stringify({
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          name: 'TEST USER',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(mockAuditLog).toHaveBeenCalledWith('VALIDATION_ERROR', expect.any(Object))
    })

    it('should return error for invalid card number (Luhn check)', async () => {
      mockValidateCardNumber.mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
        method: 'POST',
        body: JSON.stringify({
          number: '1234567890123456',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          name: 'TEST USER',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(mockAuditLog).toHaveBeenCalledWith('INVALID_CARD_NUMBER', expect.any(Object))
    })

    it('should return error for invalid CVV', async () => {
      mockValidateCVV.mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
        method: 'POST',
        body: JSON.stringify({
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '12', // Too short
          name: 'TEST USER',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(mockAuditLog).toHaveBeenCalledWith('INVALID_CVV', expect.any(Object))
    })

    it('should return error for expired card', async () => {
      mockValidateExpiryDate.mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
        method: 'POST',
        body: JSON.stringify({
          number: '4242424242424242',
          expiryMonth: '01',
          expiryYear: '2020', // Expired
          cvv: '123',
          name: 'TEST USER',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(mockAuditLog).toHaveBeenCalledWith('INVALID_EXPIRY', expect.any(Object))
    })

    it('should return error for missing cardholder name', async () => {
      const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
        method: 'POST',
        body: JSON.stringify({
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          name: 'A', // Too short
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('🔒 Güvenlik Testleri', () => {
    it('should enforce rate limiting', async () => {
      mockPciRateLimit.isAllowed = jest.fn().mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
        method: 'POST',
        body: JSON.stringify({
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          name: 'TEST USER',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
      expect(mockAuditLog).toHaveBeenCalledWith('RATE_LIMIT_EXCEEDED', expect.any(Object))
    })

    it('should not expose full card number in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
        method: 'POST',
        body: JSON.stringify({
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          name: 'TEST USER',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.cardInfo.maskedNumber).toContain('****')
      expect(data.cardInfo.maskedNumber).not.toContain('4242424242424242')
      expect(JSON.stringify(data)).not.toContain('4242424242424242')
    })

    it('should not expose CVV in response or logs', async () => {
      const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
        method: 'POST',
        body: JSON.stringify({
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          name: 'TEST USER',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(JSON.stringify(data)).not.toContain('123')
      expect(data.cardInfo.cvv).toBeUndefined()
    })

    it('should log only masked card data for audit', async () => {
      const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
        method: 'POST',
        body: JSON.stringify({
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          name: 'TEST USER',
        }),
      })

      await POST(request)

      expect(mockAuditLog).toHaveBeenCalledWith('CARD_TOKENIZED', {
        ip: expect.any(String),
        brand: 'Visa',
        bin: '424242',
        token: expect.stringContaining('...'), // Token should be truncated
      })
    })
  })

  describe('⏱️ Token Expiry', () => {
    it('should include token expiry time in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/payment/tokenize', {
        method: 'POST',
        body: JSON.stringify({
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          name: 'TEST USER',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.expiresIn).toBe(3600) // 1 hour in seconds
    })
  })
})

describe('GET /api/payment/tokenize', () => {
  it('should return 405 Method Not Allowed', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(405)
    expect(data.success).toBe(false)
    expect(data.error).toContain('POST')
  })
})

