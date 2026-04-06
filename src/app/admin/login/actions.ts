"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const password = formData.get("password")
  
  // Aquí usamos la contraseña hardcodeada temporalmente como se solicitó
  // Puedes cambiar "admin123" por cualquier otra, o moverla a .env
  if (password === "admin123") {
    const cookieStore = await cookies()
    cookieStore.set("admin_token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    })
    redirect("/admin")
  } else {
    return { error: "Contraseña incorrecta" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_token")
  redirect("/admin/login")
}
