import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, price, category, brand, imageUrl, isPromo, oldPrice, isFeatured, isNewArrival, inStock } = body;

    if (!code || !name || price === undefined) {
      return NextResponse.json({ error: "Faltan campos obligatorios (code, name, price)" }, { status: 400 });
    }

    // Verificar si ya existe un producto con ese código (activo o inactivo)
    const existing = await prisma.product.findUnique({
      where: { code }
    });

    if (existing) {
      if (!existing.isActive) {
        // Si existe pero está inactivo, lo actualizamos y activamos
        const updated = await prisma.product.update({
          where: { id: existing.id },
          data: {
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
            isActive: true
          }
        });
        
        revalidatePath('/');
        revalidatePath('/productos');
        revalidatePath('/promociones');
        
        return NextResponse.json(updated);
      }

      return NextResponse.json({ 
        error: `El código "${code}" ya está en uso por el producto activo: "${existing.name}".` 
      }, { status: 400 });
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
    
    // Si el error es de ID duplicado (secuencia desincronizada)
    if (error.code === 'P2002' && error.message?.includes('id')) {
      try {
        console.log("Detectado error de ID duplicado. Intentando corregir secuencias...");
        await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), (SELECT MAX(id) FROM "Product") + 1, false)`);
        return NextResponse.json({ error: "Error de sincronización detectado y corregido. Por favor, intenta de nuevo ahora." }, { status: 409 });
      } catch (fixError) {
        console.error("No se pudo corregir la secuencia automáticamente:", fixError);
      }
    }

    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
