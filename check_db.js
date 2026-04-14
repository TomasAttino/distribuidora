const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const prods = await prisma.product.findMany({
        where: { name: { contains: 'gula' } } // sqlite query doesn't support 'insensitive' mode flag if it's sqlite, wait the schema says db is postgresql but there was a comment saying SQLite.
    });
    console.log(prods);
}
main().finally(() => prisma.$disconnect());
