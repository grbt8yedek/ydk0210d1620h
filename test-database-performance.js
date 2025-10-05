// Database Performance Test
const { PrismaClient } = require('@prisma/client');

async function testPerformance() {
  const prisma = new PrismaClient();
  
  console.log('🚀 Database Performance Test Başlatılıyor...');
  
  try {
    // Test 1: User count
    console.time('User Count');
    const userCount = await prisma.user.count();
    console.timeEnd('User Count');
    console.log(`✅ User Count: ${userCount}`);
    
    // Test 2: Active users (with index)
    console.time('Active Users');
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    console.timeEnd('Active Users');
    console.log(`✅ Active Users: ${activeUsers}`);
    
    // Test 3: Recent reservations
    console.time('Recent Reservations');
    const recentReservations = await prisma.reservation.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    console.timeEnd('Recent Reservations');
    console.log(`✅ Recent Reservations: ${recentReservations}`);
    
    console.log('🎉 Performance test tamamlandı!');
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPerformance();
