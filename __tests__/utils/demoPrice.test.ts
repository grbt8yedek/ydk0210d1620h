import { getDemoPrices, fetchPricesFromAPI } from '@/utils/demoPrice'

jest.mock('date-fns', () => ({
  addDays: jest.fn((date, days) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }),
  subDays: jest.fn((date, days) => {
    const result = new Date(date)
    result.setDate(result.getDate() - days)
    return result
  }),
}))

describe('getDemoPrices', () => {
  it('should return 10 price entries', () => {
    const prices = getDemoPrices(new Date('2025-06-15'))
    expect(prices).toHaveLength(10)
  })

  it('should return prices with date, price, currency', () => {
    const prices = getDemoPrices(new Date('2025-06-15'))
    prices.forEach(entry => {
      expect(entry).toHaveProperty('date')
      expect(entry).toHaveProperty('price')
      expect(entry).toHaveProperty('currency')
    })
  })

  it('should use EUR as default currency', () => {
    const prices = getDemoPrices(new Date('2025-06-15'))
    prices.forEach(entry => {
      expect(entry.currency).toBe('EUR')
    })
  })

  it('should support custom currency', () => {
    const prices = getDemoPrices(new Date('2025-06-15'), 'USD')
    prices.forEach(entry => {
      expect(entry.currency).toBe('USD')
    })
  })

  it('should handle invalid date gracefully', () => {
    const invalidDate = new Date('invalid')
    const prices = getDemoPrices(invalidDate)
    expect(prices).toHaveLength(10)
  })

  it('should generate prices between 90-150', () => {
    const prices = getDemoPrices(new Date('2025-06-15'))
    prices.forEach(entry => {
      expect(entry.price).toBeGreaterThanOrEqual(90)
      expect(entry.price).toBeLessThanOrEqual(150)
    })
  })
})

describe('fetchPricesFromAPI', () => {
  jest.useFakeTimers()

  it('should return demo prices after delay', async () => {
    const promise = fetchPricesFromAPI('IST', 'FRA', new Date('2025-06-15'))
    
    jest.advanceTimersByTime(1000)
    
    const prices = await promise
    expect(prices).toHaveLength(10)
  })

  it('should return prices with correct structure', async () => {
    const promise = fetchPricesFromAPI('IST', 'FRA', new Date('2025-06-15'))
    jest.advanceTimersByTime(1000)
    
    const prices = await promise
    prices.forEach(entry => {
      expect(entry).toHaveProperty('date')
      expect(entry).toHaveProperty('price')
      expect(entry).toHaveProperty('currency')
    })
  })

  it('should support custom currency', async () => {
    const promise = fetchPricesFromAPI('IST', 'FRA', new Date('2025-06-15'), 'TRY')
    jest.advanceTimersByTime(1000)
    
    const prices = await promise
    prices.forEach(entry => {
      expect(entry.currency).toBe('TRY')
    })
  })

  afterAll(() => {
    jest.useRealTimers()
  })
})

