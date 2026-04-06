import Link from "next/link";

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
          <Link href="/admin/staging" className="block p-3 rounded hover:bg-slate-800 transition-colors">
            📦 Preparación
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
