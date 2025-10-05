import { prisma } from '@/lib/prisma-optimized';
import { logger } from '@/lib/logger';

// Optimized query functions
export class QueryOptimizer {
  // Batch user queries
  static async getUsersWithReservations(userIds: string[]) {
    const [users, reservations] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }),
      prisma.reservation.findMany({
        where: { userId: { in: userIds } },
        select: {
          id: true,
          userId: true,
          status: true,
          createdAt: true
        }
      })
    ]);

    // Combine data
    return users.map((user: any) => ({
      ...user,
      reservations: reservations.filter((r: any) => r.userId === user.id)
    }));
  }

  // Optimized dashboard data
  static async getDashboardData() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalReservations,
      recentReservations,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { lastLoginAt: { gte: last24h } }
      }),
      prisma.reservation.count(),
      prisma.reservation.count({
        where: { createdAt: { gte: last24h } }
      }),
      prisma.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      })
    ]);

    return {
      totalUsers,
      activeUsers,
      totalReservations,
      recentReservations,
      totalRevenue: totalRevenue._sum.amount || 0
    };
  }

  // Optimized monitoring data
  static async getMonitoringData(timeframe: string = '24h') {
    const now = new Date();
    const hours = timeframe === '1h' ? 1 : timeframe === '7d' ? 168 : 24;
    const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));

    const [
      systemLogs,
      errors,
      payments,
      users
    ] = await Promise.all([
      prisma.systemLog.findMany({
        where: { timestamp: { gte: startTime } },
        select: { level: true, message: true, timestamp: true },
        orderBy: { timestamp: 'desc' },
        take: 100
      }),
      prisma.systemLog.count({
        where: { 
          timestamp: { gte: startTime },
          level: 'ERROR'
        }
      }),
      prisma.payment.count({
        where: { createdAt: { gte: startTime } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: startTime } }
      })
    ]);

    return {
      systemLogs,
      errorCount: errors,
      paymentCount: payments,
      userCount: users,
      timeframe
    };
  }
}

export default QueryOptimizer;
