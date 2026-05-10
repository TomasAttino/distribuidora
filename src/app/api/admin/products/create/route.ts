import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, price, category, brand, imageUrl, isPromo, oldPrice, isFeatured, isNewArrival, inStock } = body;

    if (!code || !name || price === undefined) {
      return NextResponse.json({ error: "Faltan campos obligatorios (code, name, price)" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        code,
        name,
        price: parseFloat(price),
        category,
        brand,
        imageUrl,
        isPromo: !!isPromo,
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        isFeatured: !!isFeatured,
        isNewArrival: !!isNewArrival,
        inStock: inStock !== undefined ? !!inStock : true,
        isActive: true, // Se crea activo por defecto si es manual
      },
    });

    revalidatePath('/');
    revalidatePath('/productos');
    revalidatePath('/promociones');

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error creando producto:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "El código de producto ya existe" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
