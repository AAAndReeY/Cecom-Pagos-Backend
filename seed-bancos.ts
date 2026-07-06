import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const bancos = [
  "BANCO DE LA NACION",
  "BCP",
  "BBVA",
  "INTERBANK",
  "SCOTIABANK",
  "BANBIF",
  "PICHINCHA",
  "MIBANCO",
  "FALABELLA",
  "RIPLEY",
  "CAJA AREQUIPA",
  "CAJA HUANCAYO",
  "CAJA PIURA",
  "CAJA CUSCO",
  "CREDISCOTIA",
  "OTRO"
];

async function main() {
  for (const nombre of bancos) {
    await prisma.banco.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }
  console.log('Bancos seed complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
