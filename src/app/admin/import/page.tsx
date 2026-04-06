"use client"
import { useState } from "react"
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function ImportExcelPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{created: number, updated: number} | null>(null)
  const [error, setError] = useState("")

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        setResult({ created: data.created, updated: data.updated });
        setFile(null); // Reseteamos
      } else {
        setError(data.error || "Ocurrió un error al subir el archivo.");
      }
    } catch (err) {
      setError("Error de red al intentar subir el archivo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Importador de Productos</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-600 mb-6 font-medium">
          Sube tu archivo Excel con la lista de precios. El sistema buscará:
          <br/><span className="inline-block mt-2 font-mono text-sm bg-slate-100 px-2 py-1 rounded">Columna B (2): Código</span>
          <br/><span className="inline-block mt-1 font-mono text-sm bg-slate-100 px-2 py-1 rounded">Columna C (3): Nombre</span>
          <br/><span className="inline-block mt-1 font-mono text-sm bg-slate-100 px-2 py-1 rounded">Columna M (13): Precio</span>
        </p>
        
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50 relative group hover:border-orange-400 transition-colors">
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                  setFile(e.target.files?.[0] || null)
                  setResult(null)
                  setError("")
              }}
            />
            <UploadCloud className="text-slate-400 group-hover:text-orange-500 mb-4 transition-colors duration-300 group-hover:scale-110" size={48} />
            {file ? (
                <p className="text-slate-800 font-bold">{file.name}</p>
            ) : (
                <>
                  <p className="text-slate-600 font-semibold mb-1">Haz clic o arrastra un archivo aquí</p>
                  <p className="text-slate-400 text-sm">Formatos admitidos: XLSX, XLS</p>
                </>
            )}
        </div>

        {error && (
            <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
               <AlertCircle size={20} className="mt-0.5 shrink-0" />
               <p className="font-medium">{error}</p>
            </div>
        )}

        {result && (
            <div className="mt-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-start gap-3 border border-green-100 animate-in fade-in slide-in-from-bottom-2">
               <CheckCircle size={20} className="mt-0.5 shrink-0 text-green-600" />
               <div>
                  <p className="font-bold text-green-800 mb-1">¡Importación Exitosa!</p>
                  <p className="text-sm font-medium">Nuevos productos enviados a preparación: <span className="font-bold">{result.created}</span></p>
                  <p className="text-sm font-medium">Precios actualizados automáticamente: <span className="font-bold">{result.updated}</span></p>
               </div>
            </div>
        )}

        <button 
          onClick={handleUpload} 
          disabled={!file || isLoading}
          className="w-full mt-8 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center gap-2 shadow-sm"
        >
            {isLoading && <Loader2 className="animate-spin" size={20} />}
            {isLoading ? "Procesando el archivo..." : "Subir e Importar"}
        </button>
      </div>
    </div>
  )
}
