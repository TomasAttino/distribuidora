import prisma from "@/lib/prisma"
import StagingClient from "./StagingClient"

export const dynamic = 'force-dynamic';

export default async function StagingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1');
  const search = resolvedParams.search || '';
  const pageSize = 20;

  const where = {
    isActive: false,
    OR: search ? [
      { name: { contains: search, mode: 'insensitive' as const } },
      { code: { contains: search, mode: 'insensitive' as const } },
    ] : undefined,
  };

  // Fetch total count for pagination
  const totalCount = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalCount / pageSize);

  // Fetch pending products optimized with select
  const pendingProducts = await prisma.product.findMany({
    where,
    take: pageSize,
    skip: (page - 1) * pageSize,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      name: true,
      price: true,
      category: true,
      brand: true,
    }
  })

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-2 text-slate-800">Preparación de Catálogo</h1>
      <p className="text-slate-600 mb-8">
        Aquí se encuentran los productos recién detectados desde el Excel. 
        Revisalos antes de darlos de alta definitivamente para que aparezcan en la tienda.
      </p>

      <StagingClient 
        initialProducts={pendingProducts} 
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        searchQuery={search}
      />
    </div>
  )
}
