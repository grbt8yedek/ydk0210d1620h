import { POST, GET } from '@/app/api/payment/process/route'
import { NextRequest } from 'next/server'
import { tokenizeCard, getCardFromToken, invalidateToken } from '@/lib/cardTokenization'
import { getCardBinInfo } from '@/services/paymentApi'
import { createMockCard } from '@/__tests__/helpers/mockData'

// Mock dependencies
jest.mock('@/lib/cardTokenization')
jest.mock('@/services/paymentApi')

const mockTokenizeCard = tokenizeCard as jest.MockedFunction<typeof tokenizeCard>
const mockGetCardFromToken = getCardFromToken as jest.MockedFunction<typeof getCardFromToken>
const mockInvalidateToken = invalidateToken as jest.MockedFunction<typeof invalidateToken>
const mockGetCardBinInfo = getCardBinInfo as jest.MockedFunction<typeof getCardBinInfo>

describe('POST /api/payment/process', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Başarılı Senaryolar', () => {
    it('should process payment successfully without 3D Secure', async () => {
      const mockCard = createMockCard()
      const mockToken = 'mock-card-token-123'

      mockGetCardFromToken.mockReturnValue({
        number: mockCard.number,
        expiry: mockCard.expiry,
        cvv: mockCard.cvv,
        holderName: mockCard.holderName,
      })

      mockGetCardBinInfo.mockResolvedValue({
        isThreeD: false,
        secure3dPaymentActive: false,
        brand: 'VISA',
        bank: 'Test Bank',
      } as any)

      const request = new NextRequest('http://localhost:3000/api/payment/process', {
        method: 'POST',
        body: JSON.stringify({
          cardToken: mockToken,
          amount: 1000,
          currency: 'TRY',
          description: 'Test payment',
          requires3D: false,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.transactionId).toBeDefined()
      expect(data.amount).toBe(1000)
      expect(data.currency).toBe('TRY')
      expect(mockInvalidateToken).toHaveBeenCalledWith(mockToken)
    })
  })

  describe('❌ Hatalı Senaryolar', () => {
    it('should return error for missing cardToken', async () => {
      const request = new NextRequest('http://localhost:3000/api/payment/process', {
        method: 'POST',
        body: JSON.stringify({
          amount: 1000,
          currency: 'TRY',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('token')
    })

    it('should return error for invalid amount', async () => {
      const request = new NextRequest('http://localhost:3000/api/payment/process', {
        method: 'POST',
        body: JSON.stringify({
          cardToken: 'token-123',
          amount: -100,
          currency: 'TRY',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('tutar')
    })

    it('should return error for invalid/expired token', async () => {
      mockGetCardFromToken.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/payment/process', {
        method: 'POST',
        body: JSON.stringify({
          cardToken: 'invalid-token',
          amount: 1000,
          currency: 'TRY',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Geçersiz')
    })

    it('should return error when 3D Secure required but not supported', async () => {
      const mockCard = createMockCard()
      mockGetCardFromToken.mockReturnValue({
        number: mockCard.number,
        expiry: mockCard.expiry,
        cvv: mockCard.cvv,
        holderName: mockCard.holderName,
      })

      mockGetCardBinInfo.mockResolvedValue({
        isThreeD: true,
        secure3dPaymentActive: false,
        brand: 'VISA',
        bank: 'Test Bank',
      } as any)

      const request = new NextRequest('http://localhost:3000/api/payment/process', {
        method: 'POST',
        body: JSON.stringify({
          cardToken: 'token-123',
          amount: 1000,
          currency: 'TRY',
          requires3D: true,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('3D Secure')
    })
  })

  describe('🔒 Güvenlik Testleri', () => {
    it('should not expose card details in error messages', async () => {
      const mockCard = createMockCard()
      mockGetCardFromToken.mockReturnValue({
        number: mockCard.number,
        expiry: mockCard.expiry,
        cvv: mockCard.cvv,
        holderName: mockCard.holderName,
      })

      mockGetCardBinInfo.mockRejectedValue(new Error('BIN service error'))

      const request = new NextRequest('http://localhost:3000/api/payment/process', {
        method: 'POST',
        body: JSON.stringify({
          cardToken: 'token-123',
          amount: 1000,
          currency: 'TRY',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.error).not.toContain(mockCard.number)
      expect(data.error).not.toContain(mockCard.cvv)
    })

    it('should invalidate token after successful payment', async () => {
      const mockCard = createMockCard()
      const mockToken = 'token-to-invalidate'

      mockGetCardFromToken.mockReturnValue({
        number: mockCard.number,
        expiry: mockCard.expiry,
        cvv: mockCard.cvv,
        holderName: mockCard.holderName,
      })

      mockGetCardBinInfo.mockResolvedValue({
        isThreeD: false,
        secure3dPaymentActive: false,
        brand: 'VISA',
        bank: 'Test Bank',
      } as any)

      const request = new NextRequest('http://localhost:3000/api/payment/process', {
        method: 'POST',
        body: JSON.stringify({
          cardToken: mockToken,
          amount: 500,
          currency: 'TRY',
        }),
      })

      await POST(request)

      expect(mockInvalidateToken).toHaveBeenCalledWith(mockToken)
      expect(mockInvalidateToken).toHaveBeenCalledTimes(1)
    })
  })
})

describe('GET /api/payment/process', () => {
  it('should return 405 Method Not Allowed', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(405)
    expect(data.success).toBe(false)
    expect(data.error).toContain('POST')
  })
})

