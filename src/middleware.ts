import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const adminPath = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'
  
  if (adminPath && !isLoginPage) {
    const authCookie = request.cookies.get('admin_token')
    
    // Contraseña estática simple u oculta (en este caso verificamos un valor simple de la cookie)
    // El valor de la cookie se podría validar mejor, pero es una protección básica por ahora.
    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Si está autenticado y trata de ir a login, enviarlo a admin
  if (isLoginPage) {
    const authCookie = request.cookies.get('admin_token')
    if (authCookie && authCookie.value === 'authenticated') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
