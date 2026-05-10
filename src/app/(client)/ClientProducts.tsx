"use client"
import { useCart } from "@/context/CartContext"
import { useState, useEffect, useCallback } from "react"
import { Minus, Plus, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Image from "next/image"

interface ClientProductsProps {
  products: any[]
  categories: string[]
  totalCount: number
  currentPage: number
  itemsPerPage: number
  initialCategory: string
  initialSearch: string
  initialSort: string
}

export default function ClientProducts({ 
  products, 
  categories,
  totalCount, 
  currentPage, 
  itemsPerPage,
  initialCategory,
  initialSearch,
  initialSort
}: ClientProductsProps) {
  const { items, addToCart, updateQuantity } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(initialSearch)

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'Todos' || (key === 'page' && value === 1)) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      })
 
      return newSearchParams.toString()
    },
    [searchParams]
  )

  const handlePageChange = (page: number) => {
    router.push(`${pathname}?${createQueryString({ page })}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterChange = useCallback((newFilters: Record<string, string | number | null>) => {
    router.push(`${pathname}?${createQueryString({ ...newFilters, page: 1 })}`)
  }, [pathname, createQueryString, router])

  // Sync searchTerm with initialSearch when it changes (e.g. navigation)
  useEffect(() => {
    setSearchTerm(initialSearch)
  }, [initialSearch])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== initialSearch) {
        handleFilterChange({ search: searchTerm })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, initialSearch, handleFilterChange])

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <main className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
              type="text" 
              placeholder="Buscar golosinas, bebidas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-200 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-slate-800 transition-all font-medium"
           />
        </div>
        <div className="flex items-center gap-2 px-2">
          <span className="text-sm font-bold text-slate-500 whitespace-nowrap">Ordenar por:</span>
          <select 
            value={initialSort}
            onChange={(e) => handleFilterChange({ sort: e.target.value })}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
          >
            <option value="name-asc">Nombre (A-Z)</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => handleFilterChange({ cat })}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors snap-start ${initialCategory === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
            {cat}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-medium">No se encontraron productos.</div>
      ) : (
        <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const cartItem = items.find(i => i.id === product.id);

            return (
            <div key={product.id} className={`bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden flex flex-col hover:shadow-md transition-all group ${!product.inStock ? 'opacity-70' : 'hover:border-pink-200'}`}>
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
                 {product.imageUrl ? (
                    <Image 
                      src={product.imageUrl} 
                      alt={product.name} 
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className={`object-cover transition-transform duration-300 ${product.inStock ? 'group-hover:scale-105' : 'grayscale'}`} 
                    />
                 ) : (
                    <span className="text-4xl filter drop-shadow-sm transition-transform duration-300">
                      {product.category === 'Bebidas' ? '🥤' : product.category === 'Snacks' ? '🥔' : product.category === 'Cigarrillos' ? '🚬' : '🍫'}
                    </span>
                 )}
                 {product.category && (
                   <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-extrabold text-slate-600 px-2 py-1 rounded tracking-wider shadow-sm z-10">
                     {product.category}
                   </div>
                 )}
                 {!product.inStock ? (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/80 text-white px-4 py-2 font-black tracking-widest text-sm rounded shadow-xl backdrop-blur-sm -rotate-12 w-11/12 text-center border-2 border-slate-700">
                     SIN STOCK
                   </div>
                 ) : product.isPromo ? (
                   <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] uppercase font-black px-2 py-1.5 rounded tracking-widest shadow-md z-10 transform rotate-3">
                     🔥 Oferta
                   </div>
                 ) : null}
              </div>
              <div className="p-4 flex-1 flex flex-col border-t border-slate-50 relative">
                {product.brand && <span className="text-xs text-pink-600 font-black tracking-wide uppercase mb-1">{product.brand}</span>}
                <h3 className="font-semibold text-slate-800 text-sm leading-snug flex-1 mb-2">{product.name}</h3>
                
                <div className="mb-4">
                  {product.isPromo && product.oldPrice && (
                    <span className="text-xs text-slate-400 line-through tracking-tight mr-2 block -mb-0.5">
                       {formatPrice(product.oldPrice)}
                    </span>
                  )}
                  <div className="font-black text-xl text-slate-900 flex items-center gap-2">
                     {formatPrice(product.price)}
                  </div>
                </div>

                {!product.inStock ? (
                  <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-3 rounded-xl text-sm flex items-center justify-center">
                    Agotado
                  </button>
                ) : cartItem ? (
                  <div className="flex bg-pink-100 rounded-xl overflow-hidden shadow-sm border border-pink-200">
                    <button 
                      onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                      className="p-3 text-pink-700 hover:bg-pink-200 transition-colors active:scale-95 touch-manipulation"
                    >
                      {cartItem.quantity === 1 ? <Trash2 size={18} /> : <Minus size={18} />}
                    </button>
                    <div className="flex-1 flex items-center justify-center font-bold text-pink-900">
                      {cartItem.quantity}
                    </div>
                    <button 
                      onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                      className="p-3 text-pink-700 hover:bg-pink-200 transition-colors active:scale-95 touch-manipulation"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart({ ...product, imageUrl: product.imageUrl || undefined })}
                    className="w-full bg-pink-50 text-pink-700 hover:bg-pink-600 hover:text-white font-bold py-3 rounded-xl transition-all active:scale-[0.97] text-sm flex items-center justify-center gap-2 group-hover:shadow-sm"
                  >
                    Agregar al carrito
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 py-4">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <div className="flex gap-1 overflow-x-auto max-w-[200px] hide-scrollbar items-center">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // Show a limited range of pages if there are many
                if (totalPages > 7) {
                    if (pageNum !== 1 && pageNum !== totalPages && (pageNum < currentPage - 1 || pageNum > currentPage + 1)) {
                        if (pageNum === currentPage - 2 || pageNum === currentPage + 2) return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                        return null;
                    }
                }

                return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg text-sm font-bold transition ${currentPage === pageNum ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                    >
                      {pageNum}
                    </button>
                );
              })}
            </div>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        )}
        </>
      )}
    </main>
  );
}
