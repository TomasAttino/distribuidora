import prisma from "@/lib/prisma"
import ProductsClient from "./ProductsClient"

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1');
  const search = resolvedParams.search || '';
  const pageSize = 20;

  const where = {
    isActive: true,
    OR: search ? [
      { name: { contains: search, mode: 'insensitive' as const } },
      { code: { contains: search, mode: 'insensitive' as const } },
    ] : undefined,
  };

  // Fetch total count for pagination
  const totalCount = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalCount / pageSize);

  const activeProducts = await prisma.product.findMany({
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
      imageUrl: true,
      isPromo: true,
      oldPrice: true,
      isFeatured: true,
      isNewArrival: true,
      isCigarette: true,
      inStock: true
    }
  })

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-2 text-slate-800">Catálogo General</h1>
      <p className="text-slate-600 mb-8">
        Gestiona los productos que están actualmente visibles para tus clientes.
        Puedes cambiar sus nombres, precios e imágenes (por URL).
      </p>

      <ProductsClient 
        initialProducts={activeProducts} 
        categories={categories}
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        searchQuery={search}
      />
    </div>
  )
}
