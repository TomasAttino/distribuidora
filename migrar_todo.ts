import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import csv from 'csv-parser';
import 'dotenv/config';

// Inicializamos Prisma con el adaptador de PG (requerido en Prisma 7 para Neon)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helpers para parsear datos de CSV
const parseBool = (val: string): boolean => {
  if (!val) return false;
  const lower = val.toLowerCase();
  return lower === 't' || lower === 'true' || lower === '1';
};

const parseNum = (val: string): number | null => {
  if (val === undefined || val === null || val === '') return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

const parseDate = (val: string): Date => {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

async function readCSV(filePath: string): Promise<any[]> {
  const results: any[] = [];
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Archivo no encontrado: ${filePath}`);
      return resolve([]);
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

async function main() {
  console.log("🚀 Iniciando migración de datos a Neon (Main)...");

  // 1. Procesar Categorías
  const categoriesRaw = await readCSV('backup-data/category_backup.csv');
  console.log(`📂 Procesando ${categoriesRaw.length} categorías...`);
  for (const c of categoriesRaw) {
    try {
      await prisma.category.upsert({
        where: { name: c.name },
        update: {
            createdAt: parseDate(c.createdAt)
        },
        create: {
          id: parseInt(c.id),
          name: c.name,
          createdAt: parseDate(c.createdAt)
        }
      });
    } catch (err) {
      console.error(`❌ Error en categoría ${c.name}:`, err);
    }
  }

  // 2. Procesar Banners (CarouselSlide)
  const bannersRaw = await readCSV('backup-data/banner_backup.csv');
  console.log(`📂 Procesando ${bannersRaw.length} slides del carrusel...`);
  for (const b of bannersRaw) {
    try {
      const id = parseInt(b.id);
      await prisma.carouselSlide.upsert({
        where: { id: id },
        update: {
          title: b.title || null,
          imageUrl: b.imageUrl,
          linkUrl: b.linkUrl || null,
          isActive: parseBool(b.isActive),
          order: parseInt(b.order) || 0,
          updatedAt: parseDate(b.updatedAt)
        },
        create: {
          id: id,
          title: b.title || null,
          imageUrl: b.imageUrl,
          linkUrl: b.linkUrl || null,
          isActive: parseBool(b.isActive),
          order: parseInt(b.order) || 0,
          createdAt: parseDate(b.createdAt),
          updatedAt: parseDate(b.updatedAt)
        }
      });
    } catch (err) {
      console.error(`❌ Error en slide ID ${b.id}:`, err);
    }
  }

  // 3. Procesar Productos
  const productsRaw = await readCSV('backup-data/products_backup.csv');
  console.log(`📂 Procesando ${productsRaw.length} productos...`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const p of productsRaw) {
    try {
      await prisma.product.upsert({
        where: { code: p.code },
        update: {
          name: p.name,
          description: p.description || null,
          price: parseNum(p.price) || 0,
          // Solo actualizamos categoría si el CSV trae algo
          ...(p.category ? { category: p.category } : {}),
          brand: p.brand || null,
          imageUrl: p.imageUrl || null,
          isActive: parseBool(p.isActive),
          isCigarette: parseBool(p.isCigarette),
          isPromo: parseBool(p.isPromo),
          oldPrice: parseNum(p.oldPrice),
          isFeatured: parseBool(p.isFeatured),
          isNewArrival: parseBool(p.isNewArrival),
          inStock: parseBool(p.inStock),
          updatedAt: parseDate(p.updatedAt)
        },
        create: {
          id: parseInt(p.id),
          code: p.code,
          name: p.name,
          description: p.description || null,
          price: parseNum(p.price) || 0,
          category: p.category || null,
          brand: p.brand || null,
          imageUrl: p.imageUrl || null,
          isActive: parseBool(p.isActive),
          isCigarette: parseBool(p.isCigarette),
          isPromo: parseBool(p.isPromo),
          oldPrice: parseNum(p.oldPrice),
          isFeatured: parseBool(p.isFeatured),
          isNewArrival: parseBool(p.isNewArrival),
          inStock: parseBool(p.inStock),
          createdAt: parseDate(p.createdAt),
          updatedAt: parseDate(p.updatedAt)
        }
      });
      successCount++;
      if (successCount % 100 === 0) console.log(`... ${successCount} productos procesados`);
    } catch (err) {
      errorCount++;
      console.error(`❌ Error en producto ${p.code}:`, err);
    }
  }

  console.log(`\n✨ Migración finalizada.`);
  console.log(`✅ Productos exitosos: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
}

main()
  .catch((e) => {
    console.error("💥 Error fatal en el script de migración:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
