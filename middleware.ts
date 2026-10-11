import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Solo proteger rutas que empiecen con /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Si van a /admin/login, permitir el acceso
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    // Verificar cookie de sesión
    const authCookie = request.cookies.get('suavecito_auth');
    if (authCookie?.value !== 'authenticated') {
      // Redirigir al login si no está autenticado
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
