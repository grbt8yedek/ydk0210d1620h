const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('yeni123', 10);
  await prisma.user.upsert({
    where: { email: 'yeni@deneme.com' },
    update: {},
    create: {
      email: 'yeni@deneme.com',
      password: hashedPassword,
      firstName: 'Yeni',
      lastName: 'Kullanıcı',
      status: 'active'
    },
  });
  console.log('Yeni kullanıcı eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 