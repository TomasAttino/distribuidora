"use client"
import { useState, useEffect } from "react"
import { Edit2, Loader2, Save, X, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

type Product = {
  id: number
  code: string
  name: string
  price: number
  category: string | null
  brand: string | null
  imageUrl: string | null
  isPromo: boolean
  oldPrice: number | null
  isFeatured: boolean
  isNewArrival: boolean
  inStock: boolean
}

type Category = {
  id: number
  name: string
}

interface ProductsClientProps {
  initialProducts: Product[]
  categories: Category[]
  currentPage: number
  totalPages: number
  totalCount: number
  searchQuery: string
}

export default function ProductsClient({ 
  initialProducts, 
  categories,
  currentPage,
  totalPages,
  totalCount,
  searchQuery
}: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState(searchQuery)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Product>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Sincronizar estado local con props iniciales cuando cambian (ej. al navegar)
  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set('search', searchTerm)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const startEdit = (prod: Product) => {
    setEditingId(prod.id)
    setEditForm(prod)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async () => {
    if (!editingId) return
    setIsProcessing(true)
    try {
      const res = await fetch("/api/admin/products/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        setProducts(p => p.map(prod => prod.id === editingId ? { ...prod, ...editForm } as Product : prod))
        cancelEdit()
        router.refresh()
      } else {
        alert("Error al actualizar producto.")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async (code: string) => {
    if (!confirm("¿Seguro que deseas eliminar este producto activo?")) return
    setIsProcessing(true)
    try {
      const res = await fetch("/api/admin/products/delete", {
        method: "DELETE",
        body: JSON.stringify({ code })
      })
      if (res.ok) {
        setProducts(p => p.filter(prod => prod.code !== code))
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Productos Activos ({totalCount})</h2>
        </div>
        <div className="flex-1 max-w-md w-full flex gap-2">
          <input 
            type="text" 
            placeholder="Buscar por nombre o código..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
          <button 
            onClick={handleSearch}
            className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold">
            <tr>
              <th className="p-4">Imagen</th>
              <th className="p-4">Código</th>
              <th className="p-4">Detalles</th>
              <th className="p-4 text-right">Precio</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No se encontraron productos en esta página.</td>
              </tr>
            ) : (
             products.map((prod) => (
              <tr key={prod.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${!prod.inStock && 'opacity-60 bg-slate-50'}`}>
                <td className="p-4">
                  <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                    {prod.imageUrl ? (
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-400 text-xs">Sin foto</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-mono text-xs text-slate-500 whitespace-nowrap">{prod.code}</td>
                <td className="p-4">
                  {editingId === prod.id ? (
                    <div className="flex flex-col gap-2 w-full max-w-sm">
                      <input 
                        type="text" 
                        value={editForm.name || ""} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="border p-2 rounded text-sm w-full"
                        placeholder="Nombre completo"
                      />
                      <div className="flex gap-2">
                        <select
                          value={editForm.category || ""}
                          onChange={e => setEditForm({...editForm, category: e.target.value})}
                          className="border p-2 rounded text-sm w-1/2"
                        >
                          <option value="">Sin categoría</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 flex-wrap text-slate-700">
                        <label className="flex items-center gap-2 border p-2 rounded text-sm bg-white cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={editForm.inStock ?? true}
                            onChange={e => setEditForm({...editForm, inStock: e.target.checked})}
                          />
                          📦 En Stock
                        </label>
                        <label className="flex items-center gap-2 border p-2 rounded text-sm bg-white cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={editForm.isPromo || false}
                            onChange={e => setEditForm({...editForm, isPromo: e.target.checked})}
                          />
                          🔥 Oferta
                        </label>
                        <label className="flex items-center gap-2 border p-2 rounded text-sm bg-white cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={editForm.isFeatured || false}
                            onChange={e => setEditForm({...editForm, isFeatured: e.target.checked})}
                          />
                          ⭐ Favorito
                        </label>
                        <label className="flex items-center gap-2 border p-2 rounded text-sm bg-white cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={editForm.isNewArrival || false}
                            onChange={e => setEditForm({...editForm, isNewArrival: e.target.checked})}
                          />
                          🆕 Novedad
                        </label>
                      </div>
                      <input 
                        type="text" 
                        value={editForm.imageUrl || ""} 
                        onChange={e => setEditForm({...editForm, imageUrl: e.target.value})}
                        className="border p-2 rounded text-sm w-full"
                        placeholder="URL de Imagen (http...)"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-slate-800 flex items-center gap-2 flex-wrap">
                        {prod.name}
                        {!prod.inStock && <span className="bg-slate-800 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Sin Stock</span>}
                        {prod.isPromo && <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Promo</span>}
                        {prod.isFeatured && <span className="bg-amber-400 text-amber-900 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Fav</span>}
                        {prod.isNewArrival && <span className="bg-sky-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Nuevo</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{prod.category || 'Sin categoría'}</div>
                    </div>
                  )}
                </td>
                <td className="p-4 text-right">
                  {editingId === prod.id ? (
                    <div className="flex flex-col items-end gap-1">
                      <input 
                        type="number" 
                        value={editForm.price || 0} 
                        onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                        className="border p-2 rounded text-sm w-24 text-right"
                        placeholder="Precio"
                        title="Precio actual"
                      />
                      {editForm.isPromo && (
                        <input 
                          type="number" 
                          value={editForm.oldPrice || ''} 
                          onChange={e => setEditForm({...editForm, oldPrice: Number(e.target.value) || null})}
                          className="border p-2 rounded text-sm w-24 text-right text-slate-500 line-through"
                          placeholder="Old Price"
                          title="Precio anterior"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      {prod.isPromo && prod.oldPrice && (
                        <span className="text-xs text-slate-400 line-through block mb-0.5">{formatPrice(prod.oldPrice)}</span>
                      )}
                      <span className="font-bold text-slate-900">{formatPrice(prod.price)}</span>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    {editingId === prod.id ? (
                      <>
                        <button onClick={handleSave} disabled={isProcessing} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition" title="Guardar">
                           {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        </button>
                        <button onClick={cancelEdit} disabled={isProcessing} className="p-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition" title="Cancelar">
                           <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(prod)} className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition" title="Editar">
                           <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(prod.code)} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition" title="Eliminar">
                           <X size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
             ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Página <span className="font-medium text-slate-800">{currentPage}</span> de <span className="font-medium text-slate-800">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1 || isProcessing}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages || isProcessing}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
