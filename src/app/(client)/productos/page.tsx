import prisma from '@/lib/prisma'
import ClientProducts from '../ClientProducts'
import { Suspense } from 'react'

export const revalidate = 10800;

export default async function ProductsRoute() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
      brand: true,
      category: true,
      inStock: true,
      isPromo: true,
      oldPrice: true,
      isFeatured: true,
      isNewArrival: true,
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="pt-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800">Catálogo Completo</h1>
        <p className="text-slate-500 mt-2">Explorá y filtrá todos nuestros productos.</p>
      </div>
      <Suspense fallback={<div className="text-center p-12 text-slate-500 font-bold">Cargando catálogo...</div>}>
        <ClientProducts products={products} />
      </Suspense>
    </div>
  )
}
