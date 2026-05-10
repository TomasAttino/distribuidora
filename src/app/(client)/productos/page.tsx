import prisma from '@/lib/prisma'
import ClientProducts from '../ClientProducts'
import { Suspense } from 'react'

export const revalidate = false;

export default async function ProductsRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const cat = resolvedParams.cat as string || 'Todos';
  const search = resolvedParams.search as string || '';
  const sort = resolvedParams.sort as string || 'name-asc';
  
  const itemsPerPage = 20;

  // Build where clause
  const where: any = { isActive: true };
  
  if (cat !== 'Todos') {
    if (cat === "⭐ Favoritos") where.isFeatured = true;
    else if (cat === "🆕 Novedades") where.isNewArrival = true;
    else if (cat === "🔥 Promos") where.isPromo = true;
    else where.category = cat;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { brand: { contains: search } }
    ];
  }

  // Build orderBy
  let orderBy: any = { name: 'asc' };
  if (sort === 'price-asc') orderBy = { price: 'asc' };
  else if (sort === 'price-desc') orderBy = { price: 'desc' };

  // Fetch data in parallel
  const [products, totalCount, categoriesData] = await Promise.all([
    prisma.product.findMany({
      where,
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
      orderBy,
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ select: { name: true }, orderBy: { name: 'asc' } })
  ]);

  const categories = ["Todos", "⭐ Favoritos", "🆕 Novedades", "🔥 Promos", ...categoriesData.map(c => c.name)];

  return (
    <div className="pt-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800">Catálogo Completo</h1>
        <p className="text-slate-500 mt-2">Explorá y filtrá todos nuestros productos.</p>
      </div>
      <Suspense fallback={<div className="text-center p-12 text-slate-500 font-bold">Cargando catálogo...</div>}>
        <ClientProducts 
            products={products} 
            categories={categories}
            totalCount={totalCount} 
            currentPage={page} 
            itemsPerPage={itemsPerPage}
            initialCategory={cat}
            initialSearch={search}
            initialSort={sort}
        />
      </Suspense>
    </div>
  )
}
