"use client"

import { useCart, CartProvider } from "@/context/CartContext"
import { useState } from "react"
import { ShoppingCart, X, Plus, Minus } from "lucide-react"

function HeaderWithCart() {
  const { total, items, updateQuantity, removeFromCart, clearCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState("")

  const handleCheckout = () => {
    let text = "Hola, soy [Tu Nombre / Kiosco], mi pedido es:\n\n"
    items.forEach(item => {
      text += `- ${item.quantity}x ${item.name} ($${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(item.price * item.quantity)})\n`
    })
    text += `\n*Total Estimado: $${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(total)}*`

    if (notes.trim() !== "") {
      text += `\n\n*Aclaraciones:*\n${notes}`
    }

    const url = `https://wa.me/5491145285953?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <>
      {/* Top Header Contact Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center hidden md:flex">
        <span>📍 Dir: Av. San Martín 1324, Ramos Mejía | 🕒 Lun a Vie: 8 a 14hs - Sab: 8 a 13.30hs</span>
        <a href="https://wa.me/5491145285953" target="_blank" rel="noreferrer" className="hover:text-white transition">Ventas por WhatsApp: 11 4528-5953</a>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 bg-white border-b shadow-sm z-40 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-pink-600 w-full md:w-auto text-center md:text-left flex items-center gap-2 justify-center md:justify-start">
          <ShoppingCart size={24} className="text-pink-600" /> Bring<span className="text-slate-800">Shop</span>
        </h2>

        {/* Navigation Tabs */}
        <nav className="flex gap-4 md:gap-6 text-sm font-bold text-slate-600 w-full md:w-auto justify-center overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <a href="/" className="hover:text-pink-600 transition whitespace-nowrap">INICIO</a>
          <a href="/productos" className="hover:text-pink-600 transition whitespace-nowrap">PRODUCTOS</a>
          <a href="/promociones" className="hover:text-pink-600 transition whitespace-nowrap">PROMOCIONES</a>
          <a href="/contacto" className="hover:text-pink-600 transition whitespace-nowrap">CONTACTO</a>
        </nav>

        <button onClick={() => setIsOpen(true)} className="w-full md:w-auto justify-center bg-pink-100 text-pink-700 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-pink-200 transition">
          <ShoppingCart size={18} />
          {items.reduce((sum, i) => sum + i.quantity, 0)} | ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(total)}
        </button>
      </header>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b bg-pink-50">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <ShoppingCart className="text-pink-600" />
                Tu Pedido
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {items.length === 0 ? (
                <div className="text-center text-slate-400 mt-10">
                  <ShoppingCart size={48} className="mx-auto text-slate-200 mb-4" />
                  <p>Tu carrito está vacío.</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-3 border-b border-slate-100 pb-4">
                    <div className="w-16 h-16 bg-slate-50 rounded flex-shrink-0 border border-slate-100 flex justify-center items-center text-2xl">
                      {item.imageUrl ? <img src={item.imageUrl} className="max-h-full" alt={item.name} /> : "🍬"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm leading-tight text-slate-800">{item.name}</h4>
                      <p className="text-pink-600 font-bold mt-1">${item.price}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 active:bg-slate-300 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 active:bg-pink-300 transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Aclaraciones (Sabores, etc.)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej: Del combo alfajores quiero 5 jorgito y 5 guaymallen..."
                    className="w-full text-sm border border-slate-200 rounded p-2 focus:outline-none focus:border-pink-500 min-h-[60px]"
                  />
                </div>
                <div className="flex justify-between items-center mb-4 text-lg">
                  <span className="font-medium text-slate-600">Total:</span>
                  <span className="font-extrabold text-2xl text-slate-900">${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(total)}</span>
                </div>
                <button onClick={handleCheckout} className="w-full mb-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  Enviar a WhatsApp
                </button>
                <button onClick={clearCart} className="w-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                  Vaciar carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <HeaderWithCart />
        <div className="flex-1 w-full pb-20">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-12 px-4 shadow-inner mt-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2"><ShoppingCart size={20} className="text-pink-500" /> Bring<span className="text-pink-500">Shop</span></h3>
              <p className="mb-2">Mayorista & Minorista. Todo para tu kiosco en un solo lugar.</p>
              <p>Buenos Aires, Argentina</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contacto y Ubicación</h4>
              <p className="mb-2">📍 Dirección: Av. San Martín 1324, Ramos Mejía</p>
              <p className="mb-2">📞 WhatsApp: 11 4528-5953</p>
              <p>🕒 Lun a Vie: 8 a 14hs - Sab: 8 a 13.30hs</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Redes Sociales</h4>
              <a href="#" className="block hover:text-pink-500 mb-2 transition">📸 Instagram: @bringshop</a>
              <a href="#" className="block hover:text-pink-500 transition">👍 Facebook: BringShop Oficial</a>
            </div>
          </div>
          {/* Cambiamos justify-between por justify-center y nos aseguramos que el texto sea center */}
          <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col items-center justify-center gap-4 text-[10px] uppercase tracking-widest text-center">

            <div className="text-slate-500">
              © {new Date().getFullYear()} BringShop. Todos los derechos reservados.
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <span>Desarrollado por</span>
              <a
                href="https://wa.me/5491137684212"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-pink-500 transition-colors font-bold border-b border-slate-700 hover:border-pink-500 pb-0.5"
              >
                Tomás Attino
              </a>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}
