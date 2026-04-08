import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'Falta el ID del producto' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: data.id },
      data: {
        name: data.name,
        price: data.price,
        category: data.category,
        imageUrl: data.imageUrl,
        isPromo: data.isPromo,
        oldPrice: data.oldPrice,
        isFeatured: data.isFeatured,
        isNewArrival: data.isNewArrival,
        inStock: data.inStock
      }
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
