"use client"
import { useState } from "react"
import { UploadCloud, CheckCircle, AlertCircle, Loader2, Eye, Database } from "lucide-react"

type PreviewProduct = {
  code: string;
  name: string;
  price: number;
};

export default function ImportExcelPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{created: number, updated: number} | null>(null)
  const [error, setError] = useState("")
  const [previewData, setPreviewData] = useState<PreviewProduct[] | null>(null)

  const handlePreview = async () => {
    if (!file) return;
    setIsLoading(true);
    setError("");
    setResult(null);
    setPreviewData(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", "preview");

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setPreviewData(data.products);
      } else {
        setError(data.error || "Ocurrió un error al previsualizar el archivo.");
      }
    } catch (err) {
      setError("Error de red al intentar subir el archivo.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleConfirmImport = async () => {
    if (!file) return;
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", "import");

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setResult({ created: data.created, updated: data.updated });
        setPreviewData(null);
        setFile(null); 
      } else {
        setError(data.error || "Ocurrió un error al importar el archivo.");
      }
    } catch (err) {
      setError("Error de red al intentar importar el archivo.");
    } finally {
      setIsLoading(false);
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Importador de Precios (Excel)</h1>
      
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-600 mb-6 font-medium">
          Sube tu archivo Excel con la lista de precios para hacer una previsualización antes de guardar. 
          <br/><span className="inline-block mt-2 font-mono text-sm bg-slate-100 px-2 py-1 rounded">Columna B: Código</span>
          <br/><span className="inline-block mt-1 font-mono text-sm bg-slate-100 px-2 py-1 rounded">Columna C: Nombre</span>
          <br/><span className="inline-block mt-1 font-mono text-sm bg-slate-100 px-2 py-1 rounded">Columna L: Precio</span>
        </p>
        
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50 relative group hover:border-blue-400 transition-colors">
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                  setFile(e.target.files?.[0] || null)
                  setResult(null)
                  setError("")
                  setPreviewData(null)
              }}
            />
            <UploadCloud className="text-slate-400 group-hover:text-blue-500 mb-4 transition-colors duration-300 group-hover:scale-110" size={48} />
            {file ? (
                <p className="text-slate-800 font-bold">{file.name}</p>
            ) : (
                <>
                  <p className="text-slate-600 font-semibold mb-1">Haz clic o arrastra tu Excel aquí</p>
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
                  <p className="font-bold text-green-800 mb-1">¡Importación Exitosa Completada!</p>
                  <p className="text-sm font-medium">Nuevos productos guardados: <span className="font-bold">{result.created}</span></p>
                  <p className="text-sm font-medium">Precios actualizados: <span className="font-bold">{result.updated}</span></p>
               </div>
            </div>
        )}

        {!previewData && !result && (
          <button 
            onClick={handlePreview} 
            disabled={!file || isLoading}
            className="w-full mt-8 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center gap-2 shadow-sm"
          >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLoading ? "Procesando archivo..." : <><Eye size={20}/> Previsualizar Productos</>}
          </button>
        )}

        {previewData && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4 mb-4">
               <div>
                 <h2 className="text-xl font-bold text-slate-800">Previsualización</h2>
                 <p className="text-slate-500 font-medium">Se detectaron {previewData.length} productos válidos en el archivo</p>
               </div>
               
               <button 
                  onClick={handleConfirmImport} 
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-slate-300"
                >
                  {isLoading && <Loader2 className="animate-spin" size={18} />}
                  {isLoading ? "Importando..." : <><Database size={18}/> Confirmar y Guardar</>}
               </button>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden max-h-[400px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 sticky top-0 text-slate-600 font-medium">
                  <tr>
                    <th className="p-3 border-b border-slate-200">Código</th>
                    <th className="p-3 border-b border-slate-200">Nombre</th>
                    <th className="p-3 border-b border-slate-200 text-right">Precio Detectado</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((prod, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                      <td className="p-3 font-mono text-xs text-slate-500">{prod.code}</td>
                      <td className="p-3 font-medium text-slate-700">{prod.name}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatPrice(prod.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
