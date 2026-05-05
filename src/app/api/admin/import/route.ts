import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    
    const parsedProducts = [];

    // 1. LEER Y LIMPIAR DATOS
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 12) continue; 
        
        // El .trim() es por si el Excel trae espacios invisibles
        const code = String(row[1] || '').trim(); 
        const name = String(row[2] || '').trim();
        const priceRaw = row[11]; // Columna L
        let price = NaN;
        
        if (typeof priceRaw === 'number') {
            price = Math.round(priceRaw * 1.21);
        } else if (typeof priceRaw === 'string') {
            const rawVal = parseFloat(priceRaw.replace(',', '.').replace(/[^0-9.-]+/g,""));
            if (!isNaN(rawVal)) {
                price = Math.round(rawVal * 1.21);
            }
        }
        
        if (code && name && !isNaN(price)) {
            parsedProducts.push({ code, name, price });
        }
    }

    if (action === 'preview') {
        return NextResponse.json({ success: true, products: parsedProducts });
    }

    let created = 0;
    let updated = 0;

    // 2. PROCESO QUIRÚRGICO: UNO POR UNO
    for (const prod of parsedProducts) {
        // Buscamos si existe en la base que tiene las fotos
        const existingProduct = await prisma.product.findUnique({
            where: { code: prod.code },
            select: { id: true, price: true }
        });

        if (existingProduct) {
            // SI EXISTE: Solo actualizamos el precio. 
            // Prisma NO toca imageUrl ni category porque no se las pasamos.
            await prisma.product.update({
                where: { code: prod.code },
                data: { price: prod.price }
            });
            updated++;
        } else {
            // SI NO EXISTE: Va a fase de preparación
            await prisma.product.create({
                data: {
                    code: prod.code,
                    name: prod.name,
                    price: prod.price,
                    category: "Otros",
                    isActive: false // Oculto hasta que le pongas foto
                }
            });
            created++;
        }
    }

    return NextResponse.json({ success: true, created, updated });

  } catch (error: unknown) {
    console.error('Error procesando excel:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}