import prisma from "@/lib/prisma"
import CategoriesClient from "./CategoriesClient"

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-2 text-slate-800">Categorías Maestras</h1>
      <p className="text-slate-600 mb-8">
        Administra las categorías principales de tu catálogo aquí. 
        Estas categorías aparecerán como opciones seleccionables al momento de editar o agregar productos.
      </p>

      <CategoriesClient initialCategories={categories} />
    </div>
  )
}
