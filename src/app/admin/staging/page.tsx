import prisma from "@/lib/prisma"
import StagingClient from "./StagingClient"

export const dynamic = 'force-dynamic';

export default async function StagingPage() {
  // Fetch pending products
  const pendingProducts = await prisma.product.findMany({
    where: { isActive: false },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-2 text-slate-800">Preparación de Catálogo</h1>
      <p className="text-slate-600 mb-8">
        Aquí se encuentran los productos recién detectados desde el Excel. 
        Revisalos antes de darlos de alta definitivamente para que aparezcan en la tienda.
      </p>

      <StagingClient initialProducts={pendingProducts} />
    </div>
  )
}
