const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' }, take: 1 });
  if (users.length > 0) {
    const user = users[0];
    await prisma.user.update({
      where: { id: user.id },
      data: { rol: 'ADMIN' },
    });
    console.log(`Usuario ${user.username} ha sido actualizado a ADMIN.`);
  } else {
    console.log('No hay usuarios en la base de datos.');
  }
}

makeAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
