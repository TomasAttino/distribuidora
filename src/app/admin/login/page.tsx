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
            <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
            <input 
              type="text" 
              name="username"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
              placeholder="Ej: admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              name="password"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-pink-600 text-white font-bold rounded-lg py-3 hover:bg-pink-700 transition">
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  )
}
