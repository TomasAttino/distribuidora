"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GripVertical, Plus, Trash2, Edit2, Save, X } from "lucide-react"

type Slide = {
  id: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  order: number;
}

export default function CarouselClient({ initialSlides }: { initialSlides: Slide[] }) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [form, setForm] = useState<Partial<Slide>>({
    title: "", imageUrl: "", linkUrl: "", isActive: true, order: 0
  })
  
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleAddSubmit = async () => {
    if (!form.imageUrl) return alert("Se requiere la URL de la imagen")
    setIsProcessing(true)
    try {
      const res = await fetch("/api/admin/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        const newSlide = await res.json()
        setSlides(prev => [...prev, newSlide].sort((a,b) => a.order - b.order))
        setIsAdding(false)
        setForm({ title: "", imageUrl: "", linkUrl: "", isActive: true, order: 0 })
        router.refresh()
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!editingId) return;
    setIsProcessing(true)
    try {
      const res = await fetch("/api/admin/carousel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form })
      })
      if (res.ok) {
        const updated = await res.json()
        setSlides(prev => prev.map(s => s.id === editingId ? updated : s).sort((a,b) => a.order - b.order))
        setEditingId(null)
        setForm({ title: "", imageUrl: "", linkUrl: "", isActive: true, order: 0 })
        router.refresh()
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Borrar slide del carrusel?")) return;
    setIsProcessing(true)
    try {
      const res = await fetch("/api/admin/carousel", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setSlides(prev => prev.filter(s => s.id !== id))
        router.refresh()
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const startEdit = (slide: Slide) => {
    setEditingId(slide.id)
    setIsAdding(false)
    setForm(slide)
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="font-bold text-lg">Banners Actuales</h2>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); setForm({ title: "", imageUrl: "", linkUrl: "", isActive: true, order: slides.length }); }}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-pink-700 transition"
        >
          <Plus size={18} /> Agregar Slide
        </button>
      </div>

      {(isAdding || editingId !== null) && (
        <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-pink-200">
          <h3 className="font-bold text-pink-700 mb-4">{isAdding ? "Nuevo Slide" : "Editar Slide"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="URL de la Imagen (requerido)" value={form.imageUrl || ''} onChange={e => setForm({...form, imageUrl: e.target.value})} className="p-2 border rounded w-full text-sm" />
            <input type="text" placeholder="Título (Opcional)" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className="p-2 border rounded w-full text-sm" />
            <input type="text" placeholder="Link (URL al hacer clic - Opcional)" value={form.linkUrl || ''} onChange={e => setForm({...form, linkUrl: e.target.value})} className="p-2 border rounded w-full text-sm" />
            <div className="flex gap-4">
               <input type="number" placeholder="Orden (Ej: 0, 1, 2)" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="p-2 border rounded w-1/2 text-sm" />
               <label className="flex items-center gap-2 bg-white px-4 rounded border w-1/2 text-sm">
                 <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
                 Activo
               </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button disabled={isProcessing} onClick={isAdding ? handleAddSubmit : handleEditSubmit} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 flex gap-2"><Save size={18} /> Guardar</button>
            <button disabled={isProcessing} onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-slate-300 text-slate-800 px-6 py-2 rounded font-bold hover:bg-slate-400 flex gap-2"><X size={18} /> Cancelar</button>
          </div>
        </div>
      )}

      {slides.length === 0 ? (
        <p className="text-slate-500 text-center py-10">No hay slides en tu carrusel actual. Haz clic en "Agregar" para comenzar.</p>
      ) : (
        <div className="space-y-4">
          {slides.map(slide => (
            <div key={slide.id} className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-xl hover:bg-slate-50 transition">
              <div className="cursor-grab text-slate-400 p-2"><GripVertical /></div>
              <div className="w-48 h-24 bg-slate-200 rounded overflow-hidden flex-shrink-0 relative border border-slate-300">
                 {slide.imageUrl && <img src={slide.imageUrl} alt="banner" className="w-full h-full object-cover" />}
                 {!slide.isActive && <div className="absolute inset-0 bg-white/60 flex items-center justify-center font-bold text-red-600">INACTIVO</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate">{slide.title || "Sin título"}</h4>
                <p className="text-xs text-slate-500 mt-1 truncate">Vínculo: {slide.linkUrl || "Ninguno"}</p>
                <div className="text-xs mt-2 font-mono bg-slate-100 inline-block px-2 py-1 rounded">Orden: {slide.order}</div>
              </div>
              <div className="flex gap-2 p-2">
                <button onClick={() => startEdit(slide)} className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"><Edit2 size={18}/></button>
                <button onClick={() => handleDelete(slide.id)} className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
