"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const username = formData.get("username")
  const password = formData.get("password")
  
  if (username === "admin" && password === "admin123") {
    const cookieStore = await cookies()
    cookieStore.set("admin_token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    })
    redirect("/admin")
  } else {
    return { error: "Usuario o contraseña incorrectos" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_token")
  redirect("/admin/login")
}
