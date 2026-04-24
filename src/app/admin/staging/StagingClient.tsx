"use client"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Check, Trash2, CheckCircle2, Loader2, Search } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

type Product = {
  id: number
  code: string
  name: string
  price: number
  category: string | null
  brand: string | null
}

interface StagingClientProps {
  initialProducts: Product[]
  currentPage: number
  totalPages: number
  totalCount: number
  searchQuery: string
}

export default function StagingClient({ 
  initialProducts, 
  currentPage, 
  totalPages, 
  totalCount,
  searchQuery 
}: StagingClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState(searchQuery)
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

  const handleActivateAll = async () => {
    if (!confirm(`¿Estás seguro de dar de alta los ${products.length} productos de esta página?`)) return
    
    setIsProcessing(true)
    try {
      // Pasamos los códigos de la página actual para que el backend sepa qué activar
      const res = await fetch("/api/admin/products/activate", {
        method: "PATCH",
        body: JSON.stringify({ 
            activateAll: true,
            codes: products.map(p => p.code)
        })
      })
      if (res.ok) {
        setProducts([])
        router.refresh()
      } else {
        const errData = await res.json()
        alert('Error al aprobar: ' + (errData.error || res.statusText))
      }
    } catch (e: any) {
      console.error(e)
      alert('Error de red: ' + e.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleActivate = async (code: string) => {
    setIsProcessing(true)
    try {
      const res = await fetch("/api/admin/products/activate", {
        method: "PATCH",
        body: JSON.stringify({ code })
      })
      if (res.ok) {
        setProducts(p => p.filter(prod => prod.code !== code))
        router.refresh()
      } else {
        const errData = await res.json()
        alert('Error al activar: ' + (errData.error || res.statusText))
      }
    } catch (e: any) {
      console.error(e)
      alert('Error de red al activar: ' + e.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async (code: string) => {
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

  if (initialProducts.length === 0 && !searchQuery) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
           <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Todo al día</h2>
        <p className="text-slate-500 mt-2 max-w-md">No hay productos en etapa de preparación. Cualquier producto nuevo importado aparecerá aquí.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Pendientes de Alta ({totalCount})</h2>
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
        <button 
          onClick={handleActivateAll}
          disabled={isProcessing || products.length === 0}
          className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 transition active:scale-95 flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
          Aprobar página
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold">
            <tr>
              <th className="p-4">Código</th>
              <th className="p-4">Nombre</th>
              <th className="p-4 text-right">Precio</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">No se encontraron productos coincidentes en esta página.</td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr key={prod.code} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-500 whitespace-nowrap">{prod.code}</td>
                  <td className="p-4 font-medium text-slate-800">{prod.name}</td>
                  <td className="p-4 text-right font-bold text-slate-900 whitespace-nowrap">{formatPrice(prod.price)}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleActivate(prod.code)}
                        disabled={isProcessing}
                        title="Dar de Alta"
                        className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                      >
                         <Check size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(prod.code)}
                        disabled={isProcessing}
                        title="Descartar"
                        className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                         <Trash2 size={18} />
                      </button>
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
