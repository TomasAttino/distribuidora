import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const all = await prisma.product.findMany();
        const dupes = all.filter(p => p.name.toLowerCase().includes('gula'));
        return NextResponse.json(dupes);
    } catch(err: any) {
        return NextResponse.json({error: String(err)});
    }
}
