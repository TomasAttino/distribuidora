import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';

// FORZAMOS la URL antes de que Prisma intente hacer cualquier cosa
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_5WO3DvaFtRyI@ep-cool-band-am2hfmgt-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const prisma = new PrismaClient();

async function migrar() {
  const productos: any[] = [];
  
  // Asegurate que el archivo se llame exactamente así en la carpeta
  if (!fs.existsSync('backup_fotos.csv')) {
    console.error("❌ ERROR: No encontré el archivo 'backup_fotos.csv'. Fijate el nombre.");
    process.exit(1);
  }

  fs.createReadStream('backup_fotos.csv') 
    .pipe(csv())
    .on('data', (data) => productos.push(data))
    .on('end', async () => {
      console.log(`🚀 Iniciando carga de ${productos.length} productos en la rama main...`);
      
      for (const p of productos) {
        try {
          await prisma.product.upsert({
            where: { code: p.code },
            update: { imageUrl: p.imageUrl },
            create: {
              code: p.code,
              name: p.name,
              imageUrl: p.imageUrl,
              price: 0,
              category: p.category || "Otros",
              isActive: false
            }
          });
        } catch (err) {
          console.error(`❌ Error en el código ${p.code}:`, err);
        }
      }
      console.log('✅ ¡TERMINAMOS! Las fotos están en Main. Ya podés cerrar todo.');
      await prisma.$disconnect();
      process.exit(0);
    });
}

migrar();