import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    
    // header: 1 devuelve un array de arrays (índices 0, 1, 2...)
    const rows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    
    let created = 0;
    let updated = 0;
    
    // Saltamos la fila de cabecera asumiendo que es la fila 0
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 13) continue; // Al menos debe tener hasta la col 13 (índice 12)
        
        // Columna 2 = Índice 1 (Código)
        const code = String(row[1] || '').trim();
        // Columna 3 = Índice 2 (Nombre)
        const name = String(row[2] || '').trim();
        // Columna 13 = Índice 12 (Precio)
        const priceRaw = row[12];
        let price = NaN;
        
        if (typeof priceRaw === 'number') {
            price = priceRaw;
        } else if (typeof priceRaw === 'string') {
            price = parseFloat(priceRaw.replace(',', '.'));
        }
        
        if (!code || !name || isNaN(price)) continue;
        
        const existing = await prisma.product.findUnique({
             where: { code }
        });
        
        if (existing) {
             await prisma.product.update({
                 where: { code },
                 data: { price }
             });
             updated++;
        } else {
             // Nuevo producto: Entra como Inactivo (isActive: false) -> Se activará en Staging
             await prisma.product.create({
                 data: {
                     code,
                     name,
                     price,
                     isActive: false, 
                 }
             });
             created++;
        }
    }

    return NextResponse.json({ success: true, created, updated });
  } catch (error: any) {
    console.error('Error procesando excel:', error);
    return NextResponse.json({ error: error.message || String(error), stack: error.stack }, { status: 500 });
  }
}
