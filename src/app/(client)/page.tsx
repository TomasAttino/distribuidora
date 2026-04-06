"use client"
import { useCart } from "@/context/CartContext"
import { Search } from "lucide-react"

const mockProducts = [
  { id: 1, name: "Alfajor Águila Minítorta Clásico", price: 850, category: "Golosinas", brand: "Arcor" },
  { id: 2, name: "Coca Cola Sabor Original 1.5L", price: 2100, category: "Bebidas", brand: "Coca Cola" },
  { id: 3, name: "Papas Lays Clásicas 145g", price: 1800, category: "Snacks", brand: "PepsiCo" },
  { id: 4, name: "Gomitas Mogul Ositos 120g", price: 650, category: "Golosinas", brand: "Arcor" },
  { id: 5, name: "Cigarrillos Marlboro Box 20", price: 2400, category: "Cigarrillos", brand: "Philip Morris" },
  { id: 6, name: "Chocolate Block 170g", price: 4200, category: "Golosinas", brand: "Cofler" },
]

export default function ClientHome() {
  const { addToCart } = useCart()

  return (
    <main className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
         <input 
            type="text" 
            placeholder="Buscar golosinas, bebidas..." 
            className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-200 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-slate-800 transition-all font-medium"
         />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {["Todos", "Golosinas", "Bebidas", "Snacks", "Cigarrillos"].map(cat => (
          <button key={cat} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors snap-start ${cat === "Todos" ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {mockProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden flex flex-col hover:shadow-md hover:border-orange-200 transition-all group">
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center relative">
               <span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {product.category === 'Bebidas' ? '🥤' : product.category === 'Snacks' ? '🥔' : product.category === 'Cigarrillos' ? '🚬' : '🍫'}
               </span>
               <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-extrabold text-slate-600 px-2 py-1 rounded tracking-wider shadow-sm">
                 {product.category}
               </div>
            </div>
            <div className="p-4 flex-1 flex flex-col border-t border-slate-50">
              <span className="text-xs text-orange-600 font-black tracking-wide uppercase mb-1">{product.brand}</span>
              <h3 className="font-semibold text-slate-800 text-sm leading-snug flex-1 mb-2">{product.name}</h3>
              <div className="font-black text-xl text-slate-900 mb-4">${product.price.toLocaleString()}</div>
              <button 
                onClick={() => addToCart(product)}
                className="w-full bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white font-bold py-3 rounded-xl transition-all active:scale-[0.97] text-sm flex items-center justify-center gap-2 group-hover:shadow-sm"
              >
                Agregar
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
