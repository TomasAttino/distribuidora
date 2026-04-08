import prisma from "@/lib/prisma"
import ProductsClient from "./ProductsClient"

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const activeProducts = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-2 text-slate-800">Catálogo General</h1>
      <p className="text-slate-600 mb-8">
        Gestiona los productos que están actualmente visibles para tus clientes.
        Puedes cambiar sus nombres, precios e imágenes (por URL).
      </p>

      <ProductsClient initialProducts={activeProducts} />
    </div>
  )
}
