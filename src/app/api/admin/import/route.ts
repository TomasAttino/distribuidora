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
    
    const codes = Array.from(new Set(parsedProducts.map(p => p.code)));
    const existingProductsList = await prisma.product.findMany({
        where: { code: { in: codes } },
        select: { code: true }
    });
    const existingSet = new Set(existingProductsList.map(p => p.code));

    // For products in the Excel, we want to group them by code to avoid processing duplicates
    const uniqueParsedProducts = Array.from(
        parsedProducts.reduce((map, prod: { code: string, name: string, price: number }) => {
            map.set(prod.code, prod);
            return map;
        }, new Map<string, { code: string, name: string, price: number }>()).values()
    );

    const toCreate = uniqueParsedProducts.filter(p => !existingSet.has(p.code));
    const toUpdate = uniqueParsedProducts.filter(p => existingSet.has(p.code));

    if (toCreate.length > 0) {
        await prisma.product.createMany({
            data: toCreate.map(p => ({
                code: p.code,
                name: p.name,
                price: p.price,
                isActive: false // Solo nuevos van a false (staging)
            })),
            skipDuplicates: true
        });
        created = toCreate.length;
    }

    // Refactor Atómico: Solo actualizar precio si el producto ya existe
    // PROHIBIDO sobreescribir image, category o isActive si ya existen
    for (const prod of toUpdate) {
        await prisma.product.update({
            where: { code: prod.code },
            data: { 
                price: prod.price
            }
        });
        updated++;
    }

    return NextResponse.json({ success: true, created, updated });
  } catch (error: unknown) {
    console.error('Error procesando excel:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
