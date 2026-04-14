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
    
    const parsedProducts: {name: string, price: number}[] = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !Array.isArray(row)) continue;
        
        for (let j = 0; j < row.length; j++) {
            const val = row[j];
            if (typeof val === 'string' && val.trim().length > 2) {
                const name = val.trim();
                
                let price = NaN;
                let foundAt = -1;
                
                for (let k = j + 1; k < row.length; k++) {
                    const priceRaw = row[k];
                    
                    if (priceRaw === '$' || (typeof priceRaw === 'string' && priceRaw.trim() === '$')) continue;
                    if (priceRaw === undefined || priceRaw === null || priceRaw === '') continue;

                    if (typeof priceRaw === 'number') {
                        price = priceRaw;
                        foundAt = k;
                        break;
                    } else if (typeof priceRaw === 'string') {
                        const clean = priceRaw.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]+/g,"");
                        const parsed = parseFloat(clean);
                        if (!isNaN(parsed) && parsed > 0 && /\d/.test(clean)) {
                           price = parsed;
                           foundAt = k;
                           break;
                        } else {
                           break; 
                        }
                    }
                }
                
                if (!isNaN(price) && price > 0 && foundAt !== -1) {
                    parsedProducts.push({ name, price: Math.round(price) });
                    j = foundAt; // Skip the price cells so we don't parse them again
                }
            }
        }
    }

    if (action === 'preview') {
        return NextResponse.json({ success: true, products: parsedProducts });
    }

    let created = 0;
    let updated = 0;
    let unchanged = 0;

    const names = parsedProducts.map(p => p.name);
    // As cigarettes don't have codes in the excel, we search and match by name.
    // Also, when creating, we might want to flag them as isCigarette: true so they are easily identifiable, 
    // and generate a random code since code is required and unique.
    
    const existingProductsList = await prisma.product.findMany({
        where: { name: { in: names } },
        select: { id: true, code: true, name: true, price: true }
    });
    
    const existingMap = new Map(existingProductsList.map(p => [p.name.toLowerCase(), p]));

    for (const prod of parsedProducts) {
        const existing = existingMap.get(prod.name.toLowerCase());
        if (existing) {
            // Update if price is different
            if (existing.price !== prod.price) {
                await prisma.product.update({
                    where: { id: existing.id },
                    data: { price: prod.price }
                });
                updated++;
            } else {
                unchanged++;
            }
        } else {
            // Create new
            const baseSlug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            // We append a random string to avoid potential collisions if just baseSlug exists for something else 
            // (although unlikely since name was unique enough that it didn't match existingMap)
            const randomTail = Math.random().toString(36).substring(2, 6);
            const newCode = `CIG-${baseSlug}-${randomTail}`.substring(0, 50);

            await prisma.product.create({
                data: {
                    code: newCode,
                    name: prod.name,
                    price: prod.price,
                    isActive: true, // Assume cigarettes are active upon creation? The user said "cree el cigarrillo... a 6000 pesos", normally it might be active immediately. We'll set true.
                    isCigarette: true
                }
            });
            created++;
            
            // Add to map to prevent duplicates within the same excel if it has duplicate rows somehow
            existingMap.set(prod.name.toLowerCase(), { id: 0, code: newCode, name: prod.name, price: prod.price });
        }
    }

    return NextResponse.json({ success: true, created, updated, unchanged });
  } catch (error: any) {
    console.error('Error procesando excel de cigarrillos:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
