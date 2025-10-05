import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection Pool Optimizasyonları
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Connection pool ayarları
  __internal: {
    engine: {
      // Connection pool size
      connectionLimit: 20,
      // Connection timeout
      connectionTimeout: 10000,
      // Query timeout
      queryTimeout: 30000,
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
