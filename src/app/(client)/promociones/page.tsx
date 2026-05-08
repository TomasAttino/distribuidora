import prisma from '@/lib/prisma'
import ClientProducts from '../ClientProducts'

export const revalidate = 10800;

export default async function PromosRoute() {
  const products = await prisma.product.findMany({
    where: { isActive: true, isPromo: true },
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
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="pt-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-orange-600">💸 Ofertas Especiales</h1>
        <p className="text-slate-500 mt-2">No dejes pasar estas promociones limitadas.</p>
      </div>
      <ClientProducts products={products} />
    </div>
  )
}
