"use client"
import { useState } from "react"
import { Trash2, Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

type Category = { id: number, name: string }

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [newName, setNewName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setIsProcessing(true)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setCategories([...categories, data.category].sort((a,b) => a.name.localeCompare(b.name)))
        setNewName("")
        router.refresh()
      } else {
        alert(data.error || "Error al crear categoría")
      }
    } catch(e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro de eliminar esta categoría? Si los productos la usan, perderán su categoría pero no se borrarán.")) return
    
    setIsProcessing(true)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id))
        router.refresh()
      }
    } catch(e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800">Agregar Nueva Categoría</h2>
        <form onSubmit={handleAdd} className="mt-4 flex gap-2">
          <input 
            type="text" 
            value={newName} 
            onChange={e => setNewName(e.target.value)}
            placeholder="Ej: Galletitas de Agua"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            disabled={isProcessing}
          />
          <button 
            type="submit" 
            disabled={isProcessing || !newName.trim()}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Crear
          </button>
        </form>
      </div>

      <div className="p-0">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No hay categorías creadas.</div>
        ) : (
          <ul className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {categories.map(cat => (
              <li key={cat.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                <span className="font-medium text-slate-700">{cat.name}</span>
                <button 
                  onClick={() => handleDelete(cat.id)}
                  disabled={isProcessing}
                  className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
