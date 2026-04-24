import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const data = await request.json();

    if (data.activateAll) {
      // Activate either specific codes or all pending
      const where = data.codes ? { code: { in: data.codes } } : { isActive: false };
      
      const updated = await prisma.product.updateMany({
        where,
        data: { isActive: true }
      });
      return NextResponse.json({ success: true, count: updated.count });
    }

    if (data.code) {
      // Activate single product
      await prisma.product.update({
        where: { code: data.code },
        data: { isActive: true }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  } catch (error: any) {
    console.error('SERVER ERROR IN ACTIVATE PATCH:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
