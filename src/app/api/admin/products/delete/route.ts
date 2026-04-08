import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const data = await request.json();

    if (data.code) {
      await prisma.product.delete({
        where: { code: data.code }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
