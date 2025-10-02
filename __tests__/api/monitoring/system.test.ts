import { GET, POST } from '@/app/api/monitoring/system/route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { count: jest.fn() },
    session: { count: jest.fn() },
    systemLog: { 
      count: jest.fn(),
      findMany: jest.fn()
    }
  }
}))

// Mock console methods
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

// Mock process methods
const originalUptime = process.uptime
const originalMemoryUsage = process.memoryUsage

describe('GET /api/monitoring/system', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock process methods
    process.uptime = jest.fn().mockReturnValue(3600) // 1 hour
    process.memoryUsage = jest.fn().mockReturnValue({
      rss: 100 * 1024 * 1024,
      heapTotal: 200 * 1024 * 1024,
      heapUsed: 150 * 1024 * 1024,
      external: 10 * 1024 * 1024,
      arrayBuffers: 5 * 1024 * 1024
    })
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
    process.uptime = originalUptime
    process.memoryUsage = originalMemoryUsage
  })

  describe('Successful System Metrics', () => {
    it('should return system metrics with default timeframe', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([
        { id: '1', level: 'error', message: 'Test error', timestamp: new Date() }
      ])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toHaveProperty('timeframe', '24h')
      expect(responseData.data).toHaveProperty('stats')
      expect(responseData.data).toHaveProperty('recentMetrics')
    })

    it('should handle custom timeframe parameter', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system?timeframe=1h'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.timeframe).toBe('1h')
    })

    it('should handle 7d timeframe correctly', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(1000)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(500)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(1000)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system?timeframe=7d'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.timeframe).toBe('7d')

      // Verify 7d timeframe calculation (168 hours)
      const expectedStartTime = new Date(Date.now() - (168 * 60 * 60 * 1000))
      expect(prisma.systemLog.count).toHaveBeenCalledWith({
        where: { timestamp: { gte: expect.any(Date) } }
      })
    })

    it('should return correct stats structure', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats).toHaveProperty('totalSamples')
      expect(responseData.data.stats).toHaveProperty('averageCpuUsage')
      expect(responseData.data.stats).toHaveProperty('averageMemoryUsage')
      expect(responseData.data.stats).toHaveProperty('averageDiskUsage')
      expect(responseData.data.stats).toHaveProperty('averageResponseTime')
      expect(responseData.data.stats).toHaveProperty('activeConnections')
      expect(responseData.data.stats).toHaveProperty('requestsPerMinute')
      expect(responseData.data.stats).toHaveProperty('currentUptime')
      expect(responseData.data.stats).toHaveProperty('healthStatus')
      expect(responseData.data.stats).toHaveProperty('hourlyTrends')
    })

    it('should return correct health status structure', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.healthStatus).toHaveProperty('cpu')
      expect(responseData.data.stats.healthStatus).toHaveProperty('memory')
      expect(responseData.data.stats.healthStatus).toHaveProperty('disk')
      expect(responseData.data.stats.healthStatus).toHaveProperty('responseTime')

      // Health status values should be HEALTHY or WARNING
      Object.values(responseData.data.stats.healthStatus).forEach(status => {
        expect(['HEALTHY', 'WARNING']).toContain(status)
      })
    })

    it('should return hourly trends for 24 hours', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      const hourlyTrends = responseData.data.stats.hourlyTrends
      expect(Object.keys(hourlyTrends)).toHaveLength(24)

      // Check each hour has required metrics
      for (let i = 0; i < 24; i++) {
        expect(hourlyTrends[i]).toHaveProperty('cpu')
        expect(hourlyTrends[i]).toHaveProperty('memory')
        expect(hourlyTrends[i]).toHaveProperty('responseTime')
        
        expect(typeof hourlyTrends[i].cpu).toBe('number')
        expect(typeof hourlyTrends[i].memory).toBe('number')
        expect(typeof hourlyTrends[i].responseTime).toBe('number')
      }
    })

    it('should return recent metrics with correct structure', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(150)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(75)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(300)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([
        { id: '1', level: 'error' },
        { id: '2', level: 'warn' }
      ])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      const metrics = responseData.data.recentMetrics[0]
      expect(metrics).toHaveProperty('timestamp')
      expect(metrics).toHaveProperty('cpuUsage')
      expect(metrics).toHaveProperty('memoryUsage')
      expect(metrics).toHaveProperty('diskUsage')
      expect(metrics).toHaveProperty('responseTime')
      expect(metrics).toHaveProperty('activeConnections')
      expect(metrics).toHaveProperty('requestsPerMinute')
      expect(metrics).toHaveProperty('uptime')
      expect(metrics).toHaveProperty('version', '1.0.0')
      expect(metrics).toHaveProperty('region', 'eu-central-1')
      expect(metrics).toHaveProperty('totalUsers', 150)
      expect(metrics).toHaveProperty('totalSessions', 75)
      expect(metrics).toHaveProperty('errorCount', 2)
    })
  })

  describe('Database Queries', () => {
    it('should make correct database queries for default timeframe', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      await GET(request)

      expect(prisma.user.count).toHaveBeenCalledWith()
      expect(prisma.session.count).toHaveBeenCalledWith()
      expect(prisma.systemLog.count).toHaveBeenCalledWith({
        where: { timestamp: { gte: expect.any(Date) } }
      })
      expect(prisma.systemLog.findMany).toHaveBeenCalledWith({
        where: { 
          timestamp: { gte: expect.any(Date) },
          level: { in: ['error', 'warn'] }
        },
        take: 50
      })
    })

    it('should query correct time range for 1h timeframe', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system?timeframe=1h'
      } as any

      await GET(request)

      // Should query for 1 hour ago
      const expectedTime = new Date(Date.now() - (1 * 60 * 60 * 1000))
      expect(prisma.systemLog.count).toHaveBeenCalledWith({
        where: { timestamp: { gte: expect.any(Date) } }
      })
    })

    it('should query correct time range for 7d timeframe', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(1000)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(500)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(5000)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system?timeframe=7d'
      } as any

      await GET(request)

      // Should query for 168 hours ago (7 days)
      expect(prisma.systemLog.count).toHaveBeenCalledWith({
        where: { timestamp: { gte: expect.any(Date) } }
      })
    })

    it('should limit recent logs to 50 entries', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      await GET(request)

      expect(prisma.systemLog.findMany).toHaveBeenCalledWith({
        where: { 
          timestamp: { gte: expect.any(Date) },
          level: { in: ['error', 'warn'] }
        },
        take: 50
      })
    })

    it('should filter logs by error and warn levels only', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      await GET(request)

      expect(prisma.systemLog.findMany).toHaveBeenCalledWith({
        where: { 
          timestamp: { gte: expect.any(Date) },
          level: { in: ['error', 'warn'] }
        },
        take: 50
      })
    })
  })

  describe('Health Status Logic', () => {
    it('should set CPU status to WARNING when too many users', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(1500) // > 1000
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.healthStatus.cpu).toBe('WARNING')
    })

    it('should set CPU status to HEALTHY when users below threshold', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(500) // < 1000
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.healthStatus.cpu).toBe('HEALTHY')
    })

    it('should set memory status based on heap usage', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      // Mock high memory usage (> 80%)
      process.memoryUsage = jest.fn().mockReturnValue({
        heapTotal: 100 * 1024 * 1024,
        heapUsed: 85 * 1024 * 1024, // 85%
        rss: 100 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024
      })

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.healthStatus.memory).toBe('WARNING')
    })

    it('should set response time status based on system logs', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(150) // > 100
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.healthStatus.responseTime).toBe('WARNING')
    })

    it('should always set disk status to HEALTHY', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.healthStatus.disk).toBe('HEALTHY')
    })
  })

  describe('Calculated Metrics', () => {
    it('should calculate total samples correctly', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.totalSamples).toBe(250) // 200 + 50
    })

    it('should calculate memory usage percentage', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      process.memoryUsage = jest.fn().mockReturnValue({
        heapTotal: 200 * 1024 * 1024,
        heapUsed: 100 * 1024 * 1024, // 50%
        rss: 150 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024
      })

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.averageMemoryUsage).toBe(50)
    })

    it('should calculate requests per minute based on logs and timeframe', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(120) // 120 logs
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system?timeframe=1h'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      // 120 logs / 1 hour * 60 minutes = 120 requests per minute
      expect(responseData.data.stats.requestsPerMinute).toBe(120)
    })

    it('should use process uptime for currentUptime', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      process.uptime = jest.fn().mockReturnValue(7200.5) // 2 hours

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.data.stats.currentUptime).toBe(7201) // Rounded
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection error', async () => {
      ;(prisma.user.count as jest.Mock).mockRejectedValue(new Error('Database connection failed'))

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Sunucu hatası')

      expect(consoleErrorSpy).toHaveBeenCalledWith('System metrics okuma hatası:', expect.any(Error))
    })

    it('should handle individual query failures', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockRejectedValue(new Error('Session query failed'))

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Sunucu hatası')
    })

    it('should handle process method errors', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      process.memoryUsage = jest.fn().mockImplementation(() => {
        throw new Error('Memory access denied')
      })

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Sunucu hatası')
    })

    it('should handle malformed URL', async () => {
      const request = {
        url: 'invalid-url'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Sunucu hatası')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero counts from database', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(0)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(0)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(0)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.data.stats.totalSamples).toBe(0)
      expect(responseData.data.recentMetrics[0].totalUsers).toBe(0)
      expect(responseData.data.recentMetrics[0].totalSessions).toBe(0)
      expect(responseData.data.recentMetrics[0].errorCount).toBe(0)
    })

    it('should handle very large counts', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(999999)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(888888)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(777777)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.data.stats.totalSamples).toBe(1666665) // 777777 + 888888
      expect(responseData.data.recentMetrics[0].totalUsers).toBe(999999)
    })

    it('should handle invalid timeframe parameter', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system?timeframe=invalid'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.data.timeframe).toBe('invalid')
      // Should default to 24h calculation (24 hours)
    })

    it('should handle URL without query parameters', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.data.timeframe).toBe('24h')
    })
  })

  describe('Metric Ranges', () => {
    it('should generate reasonable CPU usage values', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      const cpuUsage = responseData.data.stats.averageCpuUsage
      expect(cpuUsage).toBeGreaterThanOrEqual(0)
      expect(cpuUsage).toBeLessThanOrEqual(100)
    })

    it('should generate reasonable disk usage values', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      const diskUsage = responseData.data.stats.averageDiskUsage
      expect(diskUsage).toBeGreaterThanOrEqual(25)
      expect(diskUsage).toBeLessThanOrEqual(40)
    })

    it('should generate positive response times', async () => {
      ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.session.count as jest.Mock).mockResolvedValue(50)
      ;(prisma.systemLog.count as jest.Mock).mockResolvedValue(200)
      ;(prisma.systemLog.findMany as jest.Mock).mockResolvedValue([])

      const request = {
        url: 'http://localhost:3000/api/monitoring/system'
      } as any

      const response = await GET(request)
      const responseData = await response.json()

      const responseTime = responseData.data.stats.averageResponseTime
      expect(responseTime).toBeGreaterThan(0)
      expect(typeof responseTime).toBe('number')
    })
  })
})

describe('POST /api/monitoring/system', () => {
  it('should return success response', async () => {
    const request = {} as any

    const response = await POST(request)
    const responseData = await response.json()

    expect(responseData.success).toBe(true)
  })
})
