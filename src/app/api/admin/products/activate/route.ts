import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const data = await request.json();

    if (data.activateAll) {
      // Activate all pending products
      const updated = await prisma.product.updateMany({
        where: { isActive: false },
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
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
