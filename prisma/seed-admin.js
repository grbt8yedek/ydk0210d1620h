const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('GRBT8Admin2025!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@grbt8.store' },
    update: {
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      status: 'active'
    },
    create: {
      email: 'admin@grbt8.store',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      status: 'active'
    },
  });
  console.log('Admin kullanıcı eklendi/güncellendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
