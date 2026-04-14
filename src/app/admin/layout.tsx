import Link from "next/link";
import { logout } from "./login/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-2">
          <Link href="/admin" className="block p-3 rounded hover:bg-slate-800 transition-colors">
            📊 Dashboard
          </Link>
          <Link href="/admin/import" className="block p-3 rounded hover:bg-slate-800 transition-colors">
            📄 Importar Excel
          </Link>
          <Link href="/admin/import-cigarettes" className="block p-3 rounded hover:bg-slate-800 transition-colors">
            🚬 Cargar Cigarrillos
          </Link>
          <Link href="/admin/staging" className="block p-3 rounded hover:bg-slate-800 transition-colors">
            📦 Preparación
          </Link>
          <Link href="/admin/products" className="block p-3 rounded hover:bg-slate-800 transition-colors">
            📚 Catálogo General
          </Link>
          <Link href="/admin/categories" className="block p-3 rounded hover:bg-slate-800 transition-colors">
            📂 Categorías
          </Link>
          <Link href="/admin/carousel" className="block p-3 rounded hover:bg-slate-800 transition-colors">
            🖼️ Carrusel Principal
          </Link>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800">
          <form action={logout}>
            <button type="submit" className="w-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded transition-colors font-medium text-sm flex items-center justify-center gap-2">
              <span className="text-lg">🚪</span> Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
