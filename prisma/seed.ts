import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        username: 'admin',
        password: 'admin123', // In a real app we would hash this (bcrypt)
      },
    });
    console.log('Admin user created: admin / admin123');
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
