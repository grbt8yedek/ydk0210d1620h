import { ApiClient, API_ENDPOINTS } from '@/utils/api'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET method', () => {
    it('should make GET request with correct parameters', async () => {
      const mockResponse = { data: 'test' }
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.get('/test-endpoint')

      expect(mockFetch).toHaveBeenCalledWith('/api/test-endpoint', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error for non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404
      })

      await expect(ApiClient.get('/not-found')).rejects.toThrow('API Error: 404')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/not-found', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })

    it('should handle different status codes', async () => {
      const statusCodes = [400, 401, 403, 404, 500, 502, 503]

      for (const status of statusCodes) {
        mockFetch.mockResolvedValue({
          ok: false,
          status: status
        })

        await expect(ApiClient.get('/error-endpoint')).rejects.toThrow(`API Error: ${status}`)
      }
    })

    it('should handle fetch network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(ApiClient.get('/network-error')).rejects.toThrow('Network error')
    })

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      })

      await expect(ApiClient.get('/invalid-json')).rejects.toThrow('Invalid JSON')
    })

    it('should handle empty endpoint', async () => {
      const mockResponse = { data: 'empty' }
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.get('')

      expect(mockFetch).toHaveBeenCalledWith('/api', expect.any(Object))
      expect(result).toEqual(mockResponse)
    })

    it('should handle endpoint with leading slash', async () => {
      const mockResponse = { data: 'slash' }
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.get('/users')

      expect(mockFetch).toHaveBeenCalledWith('/api/users', expect.any(Object))
      expect(result).toEqual(mockResponse)
    })

    it('should handle endpoint without leading slash', async () => {
      const mockResponse = { data: 'no-slash' }
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.get('users')

      expect(mockFetch).toHaveBeenCalledWith('/api/users', expect.any(Object))
      expect(result).toEqual(mockResponse)
    })
  })

  describe('POST method', () => {
    it('should make POST request with correct parameters and data', async () => {
      const mockResponse = { success: true }
      const requestData = { name: 'John', email: 'john@example.com' }
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.post('/users', requestData)

      expect(mockFetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle null data', async () => {
      const mockResponse = { success: true }
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.post('/test', null)

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'null'
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle undefined data', async () => {
      const mockResponse = { success: true }
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.post('/test', undefined)

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'undefined'
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle complex nested objects', async () => {
      const complexData = {
        user: { name: 'John', details: { age: 30, hobbies: ['reading', 'coding'] } },
        metadata: { timestamp: Date.now(), version: '1.0' }
      }
      const mockResponse = { success: true }
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.post('/complex', complexData)

      expect(mockFetch).toHaveBeenCalledWith('/api/complex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(complexData)
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error for non-ok response', async () => {
      const requestData = { test: 'data' }
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400
      })

      await expect(ApiClient.post('/error', requestData)).rejects.toThrow('API Error: 400')
    })
  })

  describe('PUT method', () => {
    it('should make PUT request with correct parameters and data', async () => {
      const mockResponse = { updated: true }
      const updateData = { id: 1, name: 'Updated Name' }
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.put('/users/1', updateData)

      expect(mockFetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty update data', async () => {
      const mockResponse = { updated: true }
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.put('/users/1', {})

      expect(mockFetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: '{}'
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error for non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 422
      })

      await expect(ApiClient.put('/users/1', {})).rejects.toThrow('API Error: 422')
    })
  })

  describe('DELETE method', () => {
    it('should make DELETE request with correct parameters', async () => {
      const mockResponse = { deleted: true }
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.delete('/users/1')

      expect(mockFetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error for non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403
      })

      await expect(ApiClient.delete('/forbidden')).rejects.toThrow('API Error: 403')
    })

    it('should handle endpoints with query parameters', async () => {
      const mockResponse = { deleted: true }
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.delete('/users/1?force=true')

      expect(mockFetch).toHaveBeenCalledWith('/api/users/1?force=true', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Base URL Handling', () => {
    it('should always use /api as base URL', async () => {
      const endpoints = ['/users', '/payments', '/flights', '/reservations']
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })

      for (const endpoint of endpoints) {
        await ApiClient.get(endpoint)
        expect(mockFetch).toHaveBeenCalledWith(`/api${endpoint}`, expect.any(Object))
      }
    })

    it('should handle double slashes correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })

      await ApiClient.get('//users')
      expect(mockFetch).toHaveBeenCalledWith('/api//users', expect.any(Object))
    })

    it('should handle endpoints with special characters', async () => {
      const specialEndpoints = ['/users%20test', '/users?id=1&name=test', '/users#section']
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })

      for (const endpoint of specialEndpoints) {
        await ApiClient.get(endpoint)
        expect(mockFetch).toHaveBeenCalledWith(`/api${endpoint}`, expect.any(Object))
      }
    })
  })

  describe('Error Handling', () => {
    it('should preserve original error messages from fetch', async () => {
      const networkError = new Error('Connection refused')
      mockFetch.mockRejectedValue(networkError)

      await expect(ApiClient.get('/test')).rejects.toThrow('Connection refused')
    })

    it('should handle response.json() errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Malformed JSON'))
      })

      await expect(ApiClient.post('/test', {})).rejects.toThrow('Malformed JSON')
    })

    it('should handle fetch timeout errors', async () => {
      mockFetch.mockRejectedValue(new Error('Request timeout'))

      await expect(ApiClient.put('/test', {})).rejects.toThrow('Request timeout')
      await expect(ApiClient.delete('/test')).rejects.toThrow('Request timeout')
    })
  })

  describe('Type Safety', () => {
    it('should return typed responses for GET', async () => {
      interface User { id: number; name: string }
      const mockUser: User = { id: 1, name: 'John' }
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUser)
      })

      const result = await ApiClient.get<User>('/users/1')
      
      expect(result).toEqual(mockUser)
      expect(result.id).toBe(1)
      expect(result.name).toBe('John')
    })

    it('should return typed responses for POST', async () => {
      interface CreateResponse { success: boolean; id: number }
      const mockResponse: CreateResponse = { success: true, id: 123 }
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await ApiClient.post<CreateResponse>('/users', { name: 'John' })
      
      expect(result).toEqual(mockResponse)
      expect(result.success).toBe(true)
      expect(result.id).toBe(123)
    })

    it('should handle any data type for request bodies', async () => {
      const testData = [
        { string: 'test' },
        { number: 123 },
        { boolean: true },
        { array: [1, 2, 3] },
        { nested: { deep: { value: 'test' } } }
      ]

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })

      for (const data of testData) {
        await ApiClient.post('/test', data)
        expect(mockFetch).toHaveBeenCalledWith('/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long endpoints', async () => {
      const longEndpoint = '/very/long/endpoint/with/many/segments/' + 'x'.repeat(1000)
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })

      await ApiClient.get(longEndpoint)
      expect(mockFetch).toHaveBeenCalledWith(`/api${longEndpoint}`, expect.any(Object))
    })

    it('should handle endpoints with Unicode characters', () => {
      const unicodeEndpoint = '/üçüş/bilği/测试'
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })

      expect(async () => {
        await ApiClient.get(unicodeEndpoint)
      }).not.toThrow()
    })

    it('should handle circular reference in POST data', async () => {
      const circularData: any = { name: 'test' }
      circularData.self = circularData

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })

      // JSON.stringify should throw for circular references
      await expect(ApiClient.post('/test', circularData)).rejects.toThrow()
    })

    it('should handle response with no content', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(null)
      })

      const result = await ApiClient.get('/empty')
      expect(result).toBe(null)
    })

    it('should handle response with empty object', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })

      const result = await ApiClient.get('/empty-object')
      expect(result).toEqual({})
    })
  })

  describe('HTTP Methods Coverage', () => {
    it('should use correct HTTP methods', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })

      await ApiClient.get('/test')
      await ApiClient.post('/test', {})
      await ApiClient.put('/test', {})
      await ApiClient.delete('/test')

      expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/test', expect.objectContaining({ method: 'GET' }))
      expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/test', expect.objectContaining({ method: 'POST' }))
      expect(mockFetch).toHaveBeenNthCalledWith(3, '/api/test', expect.objectContaining({ method: 'PUT' }))
      expect(mockFetch).toHaveBeenNthCalledWith(4, '/api/test', expect.objectContaining({ method: 'DELETE' }))
    })

    it('should include Content-Type header in all methods', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })

      await ApiClient.get('/test')
      await ApiClient.post('/test', {})
      await ApiClient.put('/test', {})
      await ApiClient.delete('/test')

      const expectedHeaders = { 'Content-Type': 'application/json' }

      expect(mockFetch).toHaveBeenNthCalledWith(1, expect.any(String), expect.objectContaining({ headers: expectedHeaders }))
      expect(mockFetch).toHaveBeenNthCalledWith(2, expect.any(String), expect.objectContaining({ headers: expectedHeaders }))
      expect(mockFetch).toHaveBeenNthCalledWith(3, expect.any(String), expect.objectContaining({ headers: expectedHeaders }))
      expect(mockFetch).toHaveBeenNthCalledWith(4, expect.any(String), expect.objectContaining({ headers: expectedHeaders }))
    })
  })
})

describe('API_ENDPOINTS', () => {
  describe('Endpoint Constants', () => {
    it('should have all expected endpoints defined', () => {
      const expectedEndpoints = [
        'CAMPAIGNS',
        'SURVEY', 
        'USER_PROFILE',
        'USER_UPDATE',
        'PASSENGERS',
        'RESERVATIONS',
        'PRICE_ALERTS',
        'SEARCH_FAVORITES',
        'AGENCY_BALANCE',
        'REPORTS_SALES',
        'PAYMENT_BIN_INFO',
        'EURO_RATE',
        'LOOKUPS_PROVIDERS'
      ]

      expectedEndpoints.forEach(endpoint => {
        expect(API_ENDPOINTS).toHaveProperty(endpoint)
      })
    })

    it('should have correct endpoint paths', () => {
      expect(API_ENDPOINTS.CAMPAIGNS).toBe('/campaigns')
      expect(API_ENDPOINTS.SURVEY).toBe('/survey')
      expect(API_ENDPOINTS.USER_PROFILE).toBe('/user/profile')
      expect(API_ENDPOINTS.USER_UPDATE).toBe('/user/update')
      expect(API_ENDPOINTS.PASSENGERS).toBe('/passengers')
      expect(API_ENDPOINTS.RESERVATIONS).toBe('/reservations')
      expect(API_ENDPOINTS.PRICE_ALERTS).toBe('/price-alerts')
      expect(API_ENDPOINTS.SEARCH_FAVORITES).toBe('/search-favorites')
      expect(API_ENDPOINTS.AGENCY_BALANCE).toBe('/agency-balance/detail')
      expect(API_ENDPOINTS.REPORTS_SALES).toBe('/reports/sales')
      expect(API_ENDPOINTS.PAYMENT_BIN_INFO).toBe('/payment/bin-info')
      expect(API_ENDPOINTS.EURO_RATE).toBe('/euro-rate')
      expect(API_ENDPOINTS.LOOKUPS_PROVIDERS).toBe('/lookups/providers')
    })

    it('should have string values for all endpoints', () => {
      Object.values(API_ENDPOINTS).forEach(endpoint => {
        expect(typeof endpoint).toBe('string')
        expect(endpoint.length).toBeGreaterThan(0)
      })
    })

    it('should have endpoints starting with slash', () => {
      Object.values(API_ENDPOINTS).forEach(endpoint => {
        expect(endpoint).toMatch(/^\//)
      })
    })

    it('should not have trailing slashes', () => {
      Object.values(API_ENDPOINTS).forEach(endpoint => {
        expect(endpoint).not.toMatch(/\/$/)
      })
    })

    it('should have unique endpoint paths', () => {
      const paths = Object.values(API_ENDPOINTS)
      const uniquePaths = [...new Set(paths)]
      
      expect(paths.length).toBe(uniquePaths.length)
    })

    it('should be immutable (readonly)', () => {
      // TypeScript should prevent this, but test runtime behavior
      expect(() => {
        (API_ENDPOINTS as any).NEW_ENDPOINT = '/new'
      }).toThrow()
    })
  })

  describe('Integration with ApiClient', () => {
    it('should work correctly with ApiClient.get', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'campaigns' })
      })

      await ApiClient.get(API_ENDPOINTS.CAMPAIGNS)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/campaigns', expect.any(Object))
    })

    it('should work correctly with ApiClient.post', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      })

      await ApiClient.post(API_ENDPOINTS.USER_UPDATE, { name: 'John' })
      
      expect(mockFetch).toHaveBeenCalledWith('/api/user/update', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'John' })
      }))
    })

    it('should work correctly with all HTTP methods', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })

      await ApiClient.get(API_ENDPOINTS.PASSENGERS)
      await ApiClient.post(API_ENDPOINTS.PASSENGERS, {})
      await ApiClient.put(API_ENDPOINTS.USER_PROFILE, {})
      await ApiClient.delete(API_ENDPOINTS.RESERVATIONS)

      expect(mockFetch).toHaveBeenCalledTimes(4)
    })
  })
})