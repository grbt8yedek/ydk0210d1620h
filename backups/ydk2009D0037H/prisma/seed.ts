import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('test123', 10);
  await prisma.user.upsert({
    where: { email: 'test@gurbet.biz' },
    update: {},
    create: {
      email: 'test@gurbet.biz',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Kullanıcı',
    },
  });
  console.log('Test kullanıcısı eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 