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

    // Parse data first
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 13) continue;
        
        const code = String(row[1] || '').trim();
        const name = String(row[2] || '').trim();
        // L is the 12th column -> index 11
        const priceRaw = row[11];
        let price = NaN;
        
        if (typeof priceRaw === 'number') {
            price = priceRaw;
        } else if (typeof priceRaw === 'string') {
            price = parseFloat(priceRaw.replace(',', '.').replace(/[^0-9.-]+/g,""));
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
    
    const codes = parsedProducts.map(p => p.code);
    const existingProductsList = await prisma.product.findMany({
        where: { code: { in: codes } },
        select: { code: true }
    });
    const existingSet = new Set(existingProductsList.map(p => p.code));

    const toCreate = parsedProducts.filter(p => !existingSet.has(p.code));
    const toUpdate = parsedProducts.filter(p => existingSet.has(p.code));

    if (toCreate.length > 0) {
        await prisma.product.createMany({
            data: toCreate.map(p => ({
                code: p.code,
                name: p.name,
                price: p.price,
                isActive: false
            })),
            skipDuplicates: true
        });
        created = toCreate.length;
    }

    // Prisma doesn't have bulk update syntax for differently parameterized rows easily, 
    // so we iterate the updates. Usually this is fast enough.
    for (const prod of toUpdate) {
        await prisma.product.update({
            where: { code: prod.code },
            data: { name: prod.name, price: prod.price }
        });
        updated++;
    }

    return NextResponse.json({ success: true, created, updated });
  } catch (error: any) {
    console.error('Error procesando excel:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
