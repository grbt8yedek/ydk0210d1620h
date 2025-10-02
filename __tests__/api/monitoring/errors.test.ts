import { GET, POST } from '@/app/api/monitoring/errors/route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    systemLog: {
      findMany: jest.fn()
    },
    user: {
      findMany: jest.fn()
    }
  }
}))

// Mock console methods
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

describe('GET /api/monitoring/errors', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('Successful Error Monitoring', () => {
    it('should return error statistics with default timeframe', async () => {
      const mockErrorLogs = [
        { id: '1', level: 'error', source: 'payment', message: 'Payment failed', timestamp: new Date('2024-01-15T10:00:00Z') },
        { id: '2', level: 'warn', source: 'auth', message: 'Login attempt', timestamp: new Date('2024-01-15T11:00:00Z') },
        { id: '3', level: 'fatal', source: 'database', message: 'Connection lost', timestamp: new Date('2024-01-15T12:00:00Z') }
      ]

      const mockCriticalLogs = [
        { id: '3', level: 'fatal', source: 'database', message: 'Connection lost', timestamp: new Date('2024-01-15T12:00:00Z') }
      ]

      const mockUsers = [
        { id: 'user1' },
        { id: 'user2' }
      ]

      ;(prisma.systemLog.findMany as jest.Mock)
        .mockResolvedValueOnce(mockErrorLogs) // First call for errorLogs
        .mockResolvedValueOnce(mockCriticalLogs) // Second call for criticalLogs
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toHaveProperty('timeframe', '24h')
      expect(responseData.data).toHaveProperty('stats')
      expect(responseData.data).toHaveProperty('recentErrors')
    })

    it('should handle custom timeframe parameter', async () => {
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors?timeframe=1h'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.timeframe).toBe('1h')
    })

    it('should calculate error statistics correctly', async () => {
      const mockErrorLogs = [
        { id: '1', level: 'error', source: 'payment', message: 'Error 1', timestamp: new Date() },
        { id: '2', level: 'error', source: 'payment', message: 'Error 2', timestamp: new Date() },
        { id: '3', level: 'warn', source: 'auth', message: 'Warning 1', timestamp: new Date() },
        { id: '4', level: 'fatal', source: 'database', message: 'Fatal error', timestamp: new Date() },
        { id: '5', level: 'info', source: 'system', message: 'Info log', timestamp: new Date() }
      ]

      const mockCriticalLogs = [
        { id: '4', level: 'fatal', source: 'database', message: 'Fatal error', timestamp: new Date() }
      ]

      ;(prisma.systemLog.findMany as jest.Mock)
        .mockResolvedValueOnce(mockErrorLogs)
        .mockResolvedValueOnce(mockCriticalLogs)
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.totalErrors).toBe(5)
      expect(responseData.data.stats.criticalErrors).toBe(1)
      expect(responseData.data.stats.highErrors).toBe(2)
      expect(responseData.data.stats.mediumErrors).toBe(1)
      expect(responseData.data.stats.lowErrors).toBe(1)
    })

    it('should group errors by type correctly', async () => {
      const mockErrorLogs = [
        { id: '1', level: 'error', source: 'payment', message: 'Error 1', timestamp: new Date() },
        { id: '2', level: 'error', source: 'payment', message: 'Error 2', timestamp: new Date() },
        { id: '3', level: 'warn', source: 'auth', message: 'Warning 1', timestamp: new Date() },
        { id: '4', level: 'fatal', source: null, message: 'Unknown error', timestamp: new Date() }
      ]

      ;(prisma.systemLog.findMany as jest.Mock)
        .mockResolvedValueOnce(mockErrorLogs)
        .mockResolvedValueOnce([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.errorsByType).toEqual({
        'payment': 2,
        'auth': 1,
        'Unknown': 1
      })
    })

    it('should group errors by severity correctly', async () => {
      const mockErrorLogs = [
        { id: '1', level: 'fatal', source: 'db', message: 'Fatal', timestamp: new Date() },
        { id: '2', level: 'fatal', source: 'db', message: 'Fatal 2', timestamp: new Date() },
        { id: '3', level: 'error', source: 'api', message: 'Error', timestamp: new Date() },
        { id: '4', level: 'warn', source: 'api', message: 'Warning', timestamp: new Date() },
        { id: '5', level: 'debug', source: 'sys', message: 'Debug', timestamp: new Date() }
      ]

      ;(prisma.systemLog.findMany as jest.Mock)
        .mockResolvedValueOnce(mockErrorLogs)
        .mockResolvedValueOnce([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.errorsBySeverity).toEqual({
        'CRITICAL': 2,
        'HIGH': 1,
        'MEDIUM': 1,
        'LOW': 1
      })
    })

    it('should calculate hourly distribution correctly', async () => {
      const mockErrorLogs = [
        { id: '1', level: 'error', source: 'api', message: 'Error at 10', timestamp: new Date('2024-01-15T10:30:00Z') },
        { id: '2', level: 'error', source: 'api', message: 'Error at 10', timestamp: new Date('2024-01-15T10:45:00Z') },
        { id: '3', level: 'error', source: 'api', message: 'Error at 14', timestamp: new Date('2024-01-15T14:15:00Z') }
      ]

      ;(prisma.systemLog.findMany as jest.Mock)
        .mockResolvedValueOnce(mockErrorLogs)
        .mockResolvedValueOnce([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      const hourlyDistribution = responseData.data.stats.hourlyDistribution
      
      expect(hourlyDistribution[10]).toBe(2)
      expect(hourlyDistribution[14]).toBe(1)
      expect(hourlyDistribution[0]).toBe(0)
      expect(Object.keys(hourlyDistribution)).toHaveLength(24)
    })

    it('should format recent critical errors correctly', async () => {
      const mockCriticalLogs = [
        { 
          id: '1', 
          level: 'fatal', 
          source: 'payment', 
          message: 'This is a very long error message that should be truncated to 100 characters maximum length for display purposes',
          timestamp: new Date('2024-01-15T12:00:00Z')
        }
      ]

      ;(prisma.systemLog.findMany as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockCriticalLogs)
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      const recentError = responseData.data.stats.recentCriticalErrors[0]
      expect(recentError.timestamp).toBe('2024-01-15T12:00:00.000Z')
      expect(recentError.errorType).toBe('payment')
      expect(recentError.message).toBe('This is a very long error message that should be truncated to 100 characters maximum length ')
      expect(recentError.message).toHaveLength(100)
      expect(recentError.severity).toBe('CRITICAL')
      expect(recentError.page).toBe('/unknown')
    })

    it('should generate top error pages with correct percentages', async () => {
      const mockErrorLogs = Array(100).fill(null).map((_, i) => ({
        id: `error_${i}`,
        level: 'error',
        source: 'test',
        message: `Error ${i}`,
        timestamp: new Date()
      }))

      const mockCriticalLogs = Array(10).fill(null).map((_, i) => ({
        id: `critical_${i}`,
        level: 'fatal',
        source: 'critical',
        message: `Critical ${i}`,
        timestamp: new Date()
      }))

      ;(prisma.systemLog.findMany as jest.Mock)
        .mockResolvedValueOnce(mockErrorLogs)
        .mockResolvedValueOnce(mockCriticalLogs)
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      const topPages = responseData.data.stats.topErrorPages
      expect(topPages[0].page).toBe('/flights/search')
      expect(topPages[0].count).toBe(30) // 30% of 100
      expect(topPages[0].criticalCount).toBe(4) // 40% of 10
    })
  })

  describe('Database Queries', () => {
    it('should make correct queries for error logs', async () => {
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors?timeframe=1h'
      } as any

      await GET(request)

      expect(prisma.systemLog.findMany).toHaveBeenCalledWith({
        where: { 
          timestamp: { gte: expect.any(Date) },
          level: { in: ['error', 'warn', 'fatal'] }
        },
        orderBy: { timestamp: 'desc' },
        take: 200
      })
    })

    it('should make correct queries for critical logs', async () => {
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors?timeframe=7d'
      } as any

      await GET(request)

      expect(prisma.systemLog.findMany).toHaveBeenCalledWith({
        where: { 
          timestamp: { gte: expect.any(Date) },
          level: 'fatal'
        },
        orderBy: { timestamp: 'desc' },
        take: 50
      })
    })

    it('should query users created in timeframe', async () => {
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      await GET(request)

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { createdAt: { gte: expect.any(Date) } },
        select: { id: true }
      })
    })

    it('should calculate correct time ranges', async () => {
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const testCases = [
        { timeframe: '1h', expectedHours: 1 },
        { timeframe: '24h', expectedHours: 24 },
        { timeframe: '7d', expectedHours: 168 }
      ]

      for (const { timeframe, expectedHours } of testCases) {
        const request = {
          url: `http://localhost:3000/api/monitoring/errors?timeframe=${timeframe}`
        } as any

        const beforeTime = Date.now()
        await GET(request)
        const afterTime = Date.now()

        // Verify the time calculation
        const call = (prisma.systemLog.findMany as jest.Mock).mock.calls[0][0]
        const queryTime = call.where.timestamp.gte
        const expectedStartTime = beforeTime - (expectedHours * 60 * 60 * 1000)
        const expectedEndTime = afterTime - (expectedHours * 60 * 60 * 1000)

        expect(queryTime.getTime()).toBeGreaterThanOrEqual(expectedStartTime)
        expect(queryTime.getTime()).toBeLessThanOrEqual(expectedEndTime)
      }
    })
  })

  describe('Error Analysis', () => {
    it('should handle empty error logs', async () => {
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.totalErrors).toBe(0)
      expect(responseData.data.stats.criticalErrors).toBe(0)
      expect(responseData.data.stats.errorsByType).toEqual({})
      expect(responseData.data.stats.errorsBySeverity).toEqual({
        'CRITICAL': 0,
        'HIGH': 0,
        'MEDIUM': 0,
        'LOW': 0
      })
    })

    it('should handle logs without source', async () => {
      const mockErrorLogs = [
        { id: '1', level: 'error', source: null, message: 'No source error', timestamp: new Date() },
        { id: '2', level: 'error', source: undefined, message: 'Undefined source', timestamp: new Date() }
      ]

      ;(prisma.systemLog.findMany as jest.Mock)
        .mockResolvedValueOnce(mockErrorLogs)
        .mockResolvedValueOnce([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.errorsByType).toEqual({
        'Unknown': 2
      })
    })

    it('should handle different log levels correctly', async () => {
      const mockErrorLogs = [
        { id: '1', level: 'fatal', source: 'db', message: 'Fatal', timestamp: new Date() },
        { id: '2', level: 'error', source: 'api', message: 'Error', timestamp: new Date() },
        { id: '3', level: 'warn', source: 'auth', message: 'Warning', timestamp: new Date() },
        { id: '4', level: 'info', source: 'sys', message: 'Info', timestamp: new Date() },
        { id: '5', level: 'debug', source: 'test', message: 'Debug', timestamp: new Date() },
        { id: '6', level: 'unknown', source: 'unk', message: 'Unknown level', timestamp: new Date() }
      ]

      ;(prisma.systemLog.findMany as jest.Mock)
        .mockResolvedValueOnce(mockErrorLogs)
        .mockResolvedValueOnce([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.errorsBySeverity).toEqual({
        'CRITICAL': 1, // fatal
        'HIGH': 1,     // error
        'MEDIUM': 1,   // warn
        'LOW': 3       // info, debug, unknown
      })
    })

    it('should truncate long error messages to 100 characters', async () => {
      const longMessage = 'This is a very long error message that exceeds the 100 character limit and should be truncated properly without breaking the response format or causing any issues with the frontend display'

      const mockCriticalLogs = [
        { id: '1', level: 'fatal', source: 'test', message: longMessage, timestamp: new Date() }
      ]

      ;(prisma.systemLog.findMany as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockCriticalLogs)
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      const truncatedMessage = responseData.data.stats.recentCriticalErrors[0].message
      expect(truncatedMessage).toHaveLength(100)
      expect(truncatedMessage).toBe(longMessage.substring(0, 100))
    })
  })

  describe('Error Handling', () => {
    it('should handle database error gracefully', async () => {
      ;(prisma.systemLog.findMany as jest.Mock).mockRejectedValue(new Error('Database connection failed'))

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Sunucu hatası')

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error tracking okuma hatası:', expect.any(Error))
    })

    it('should handle individual query failures', async () => {
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValueOnce([])
      ;(prisma.systemLog.findMany as jest.Mock).mockRejectedValueOnce(new Error('Critical logs query failed'))

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Sunucu hatası')
    })

    it('should handle URL parsing errors', async () => {
      const request = {
        url: 'invalid-url'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Sunucu hatası')
    })

    it('should handle Promise.all rejection', async () => {
      ;(prisma.user.findMany as jest.Mock).mockRejectedValue(new Error('User query failed'))

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Sunucu hatası')
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid timeframe parameter', async () => {
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors?timeframe=invalid'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.data.timeframe).toBe('invalid')
      // Should default to 24h calculation
    })

    it('should handle very large number of logs', async () => {
      const largeLogs = Array(1000).fill(null).map((_, i) => ({
        id: `log_${i}`,
        level: 'error',
        source: 'load_test',
        message: `Error ${i}`,
        timestamp: new Date()
      }))

      ;(prisma.systemLog.findMany as jest.Mock)
        .mockResolvedValueOnce(largeLogs)
        .mockResolvedValueOnce([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.data.stats.totalErrors).toBe(1000)
      expect(responseData.data.stats.errorsByType.load_test).toBe(1000)
    })

    it('should handle logs with null timestamps', async () => {
      const mockErrorLogs = [
        { id: '1', level: 'error', source: 'test', message: 'Error', timestamp: null }
      ]

      ;(prisma.systemLog.findMany as jest.Mock)
        .mockResolvedValueOnce(mockErrorLogs)
        .mockResolvedValueOnce([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      // Should not throw error
      const response = await GET(request)
      expect(response.status).toBe(200)
    })

    it('should handle empty database results', async () => {
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/errors'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.data.stats.totalErrors).toBe(0)
      expect(responseData.data.stats.uniqueUsers).toBe(0)
      expect(responseData.data.recentErrors).toEqual([])
    })
  })
})

describe('POST /api/monitoring/errors', () => {
  it('should return success response', async () => {
    const request = {} as any

    const response = await POST(request)
    const responseData = await response.json()

    expect(responseData.success).toBe(true)
  })
})
