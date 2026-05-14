import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
        if (!row || row.length < 2) continue; // Al menos código y nombre
        
        // El .trim() es por si el Excel trae espacios invisibles
        const code = String(row[1] || '').trim(); 
        const name = String(row[2] || '').trim();
        
        // El precio puede estar en varias columnas si el formato varía, 
        // pero por defecto buscamos en la L (índice 11).
        // Si no está ahí, probamos en otras comunes o simplemente lo que haya.
        const priceRaw = row[11] !== undefined ? row[11] : row[3]; // L o D
        let price = NaN;
        
        if (typeof priceRaw === 'number') {
            price = Math.round(priceRaw * 1.21);
        } else if (typeof priceRaw === 'string') {
            // Limpieza de precio para formatos latinos (1.200,50) o standard (1,200.50)
            let cleaned = priceRaw.trim();
            if (cleaned.includes(',') && cleaned.includes('.')) {
                // Si tiene ambos, asumimos que el último es el decimal
                if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
                    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
                } else {
                    cleaned = cleaned.replace(/,/g, '');
                }
            } else if (cleaned.includes(',')) {
                // Si solo tiene coma, ¿es decimal o miles? 
                // En Argentina suele ser decimal. Pero si hay 3 dígitos después, podría ser miles.
                const parts = cleaned.split(',');
                if (parts[1].length === 3) {
                    cleaned = cleaned.replace(',', '');
                } else {
                    cleaned = cleaned.replace(',', '.');
                }
            }
            const rawVal = parseFloat(cleaned.replace(/[^0-9.-]+/g,""));
            if (!isNaN(rawVal)) {
                price = Math.round(rawVal * 1.21);
            }
        }
        
        if (code && name) {
            parsedProducts.push({ 
                code, 
                name, 
                price: isNaN(price) ? 0 : price 
            });
        }
    }

    if (parsedProducts.length === 0) {
        return NextResponse.json({ 
            error: 'No se encontraron productos válidos. Asegúrate de que el código esté en la columna B y el nombre en la columna C.' 
        }, { status: 400 });
    }

    if (action === 'preview') {
        return NextResponse.json({ success: true, products: parsedProducts });
    }

    let created = 0;
    let updated = 0;

    // 2. PROCESO QUIRÚRGICO: UNO POR UNO
    for (const prod of parsedProducts) {
        try {
            // Buscamos si existe en la base que tiene las fotos
            const existingProduct = await prisma.product.findUnique({
                where: { code: prod.code },
                select: { id: true, price: true }
            });

            if (existingProduct) {
                // SI EXISTE: Solo actualizamos el precio. 
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
                        isActive: false, // Oculto hasta que le pongas foto
                        isNewArrival: true
                    }
                });
                created++;
            }
        } catch (err) {
            console.error(`Error procesando producto individual (código: ${prod.code}):`, err);
            // No cortamos la ejecución, seguimos con el siguiente
        }
    }

    revalidatePath('/');
    revalidatePath('/productos');
    revalidatePath('/promociones');

    return NextResponse.json({ success: true, created, updated });

  } catch (error: unknown) {
    console.error('Error procesando excel:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}