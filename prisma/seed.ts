// Script rápido para recuperar las fotos en la rama main
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser'; // npm install csv-parser

const prisma = new PrismaClient();

async function main() {
  const results: any[] = [];
  fs.createReadStream('backup_fotos.csv') // Tu backup de Neon
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      for (const row of results) {
        await prisma.product.upsert({
          where: { code: row.code },
          update: { imageUrl: row.imageUrl },
          create: {
            code: row.code,
            name: row.name,
            imageUrl: row.imageUrl,
            price: 0, // Precio temporal
            category: row.category || "Otros",
            isActive: false
          }
        });
      }
      console.log('¡Fotos recuperadas en Main!');
    });
}

main();