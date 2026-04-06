"use client"

import { useState } from "react"
import { login } from "./actions"

export default function LoginPage() {
  const [error, setError] = useState("")

  async function handleSubmit(formData: FormData) {
    const res = await login(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 absolute inset-0 z-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Acceso Admin</h1>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              name="password"
              className="w-full border rounded p-2 focus:ring focus:ring-orange-200 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-slate-900 text-white font-semibold rounded py-2 hover:bg-slate-800 transition">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
