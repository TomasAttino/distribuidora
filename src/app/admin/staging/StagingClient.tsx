"use client"
import { useState } from "react"
import { Check, Trash2, CheckCircle2, Loader2, PackageX } from "lucide-react"
import { useRouter } from "next/navigation"

type Product = {
  id: number
  code: string
  name: string
  price: number
  category: string | null
  brand: string | null
}

export default function StagingClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleActivateAll = async () => {
    if (!confirm(`¿Estás seguro de dar de alta los ${products.length} productos pendientes?`)) return
    
    setIsProcessing(true)
    try {
      const res = await fetch("/api/admin/products/activate", {
        method: "PATCH",
        body: JSON.stringify({ activateAll: true })
      })
      if (res.ok) {
        setProducts([])
        router.refresh()
      } else {
        const errData = await res.json()
        alert('Error al aprobar todos: ' + (errData.error || res.statusText))
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (products.length === 0) {
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
          <h2 className="text-lg font-bold text-slate-800">Pendientes de Alta ({products.length})</h2>
        </div>
        <div className="flex-1 max-w-md w-full">
          <input 
            type="text" 
            placeholder="Buscar por nombre o código..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        </div>
        <button 
          onClick={handleActivateAll}
          disabled={isProcessing}
          className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 transition active:scale-95 flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
          Aprobar todos
        </button>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white sticky top-0 border-b border-slate-200 text-slate-600 font-bold z-10">
            <tr>
              <th className="p-4">Código</th>
              <th className="p-4">Nombre</th>
              <th className="p-4 text-right">Precio</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">No se encontraron productos coincidentes.</td>
              </tr>
            ) : (
              filteredProducts.map((prod) => (
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
    </div>
  )
}
