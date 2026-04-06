"use client"

import { useCart, CartProvider } from "@/context/CartContext"
import { useState } from "react"
import { ShoppingCart, X, Plus, Minus } from "lucide-react"

function HeaderWithCart() {
  const { total, items, updateQuantity, removeFromCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const handleCheckout = () => {
    let text = "Hola, soy [Tu Nombre / Kiosco], mi pedido es:\n\n"
    items.forEach(item => {
        text += `- ${item.quantity}x ${item.name} ($${item.price * item.quantity})\n`
    })
    text += `\n*Total Estimado: $${total.toLocaleString()}*`
    
    // Si tuvieras un número fijo, podrías agregarlo en la URL. 
    // Por ahora abre WhatsApp para elegir el contacto o envíalo a uno de prueba (Ej: 5491100000000)
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <>
      <header className="sticky top-0 bg-white border-b shadow-sm z-40 p-4 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-orange-600">
          Distri<span className="text-slate-800">Golosinas</span>
        </h2>
        <button onClick={() => setIsOpen(true)} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-orange-200 transition">
          <ShoppingCart size={18} />
          {items.reduce((sum, i) => sum + i.quantity, 0)} | ${total.toLocaleString()}
        </button>
      </header>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b bg-orange-50">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <ShoppingCart className="text-orange-600" />
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
                      <p className="text-orange-600 font-bold mt-1">${item.price}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 active:bg-slate-300 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 active:bg-orange-300 transition-colors">
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
                <div className="flex justify-between items-center mb-4 text-lg">
                  <span className="font-medium text-slate-600">Total:</span>
                  <span className="font-extrabold text-2xl text-slate-900">${total.toLocaleString()}</span>
                </div>
                <button onClick={handleCheckout} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  Enviar a WhatsApp
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
      </div>
    </CartProvider>
  )
}
