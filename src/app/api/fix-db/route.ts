import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Reseteamos la secuencia del ID de la tabla Product
    // Probamos varios nombres posibles por si acaso
    try {
      await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), (SELECT MAX(id) FROM "Product") + 1, false)`);
    } catch (e1) {
      try {
        await prisma.$executeRawUnsafe(`SELECT setval('product_id_seq', (SELECT MAX(id) FROM "Product") + 1, false)`);
      } catch (e2) {
        console.error("Fallo al resetear Product seq", e1, e2);
      }
    }

    // También por las dudas para Category
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('"Category"', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM "Category";
    `);

    return NextResponse.json({ 
      success: true, 
      message: "Las secuencias de la base de datos han sido corregidas. Ahora deberías poder crear productos sin errores." 
    });
  } catch (error: any) {
    console.error("Error al corregir DB:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
