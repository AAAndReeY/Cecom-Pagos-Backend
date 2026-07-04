"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminExists = await prisma.user.findUnique({
        where: { username: 'admin' },
    });
    if (!adminExists) {
        await prisma.user.create({
            data: {
                username: 'admin',
                password: 'admin123',
            },
        });
        console.log('Admin user created: admin / admin123');
    }
    else {
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
//# sourceMappingURL=seed.js.map