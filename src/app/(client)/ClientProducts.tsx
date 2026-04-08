"use client"
import { useCart } from "@/context/CartContext"
import { useState, useMemo, useEffect } from "react"
import { Minus, Plus, Trash2, Search } from "lucide-react"
import { useSearchParams } from "next/navigation"
import type { Product } from "@prisma/client"

export default function ClientProducts({ products }: { products: Product[] }) {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState(searchParams.get("cat") || "Todos")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean))
    return ["Todos", "⭐ Favoritos", "🆕 Novedades", "🔥 Promos", ...Array.from(cats)] as string[]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchesCategory = false;
      if (activeCategory === "Todos") matchesCategory = true;
      else if (activeCategory === "⭐ Favoritos") matchesCategory = !!p.isFeatured;
      else if (activeCategory === "🆕 Novedades") matchesCategory = !!p.isNewArrival;
      else if (activeCategory === "🔥 Promos") matchesCategory = !!p.isPromo;
      else matchesCategory = p.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <main className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
         <input 
            type="text" 
            placeholder="Buscar golosinas, bebidas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-200 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-slate-800 transition-all font-medium"
         />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors snap-start ${activeCategory === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-medium">No se encontraron productos.</div>
      ) : (
        <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {currentProducts.map((product) => {
            const cartItem = items.find(i => i.id === product.id);

            return (
            <div key={product.id} className={`bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden flex flex-col hover:shadow-md transition-all group ${!product.inStock ? 'opacity-70' : 'hover:border-pink-200'}`}>
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
                 {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className={`w-full h-full object-cover transition-transform duration-300 ${product.inStock ? 'group-hover:scale-105' : 'grayscale'}`} />
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
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Anterior
            </button>
            <div className="flex gap-1 overflow-x-auto max-w-[200px] hide-scrollbar">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg text-sm font-bold transition ${currentPage === i + 1 ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Siguiente
            </button>
          </div>
        )}
        </>
      )}
    </main>
  );
}
