import { NextRequest, NextResponse } from 'next/server';

// Rotas internas de administração — inacessíveis para ROLE_USUARIO
const ROTAS_ADMIN = [
  '/dashboard',
  '/veiculo-admin',
  '/administrador',
  '/formularios',
  '/profile-ls',
  '/crm',
  '/gestao',
];

// Rotas externas que qualquer um pode ver (mesmo sem cookie)
const ROTAS_PUBLICAS = [
  '/externo',
  '/login',
  '/register',
  '/confirmar-email',
  '/forgot-password',
  '/redefinir-senha',
  '/home',
  '/institucional',
  '/noticias',
  '/faq',
  '/termos',
  '/privacy',
  '/help',
  '/avaliacao',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const ehRotaAdmin = ROTAS_ADMIN.some((r) => pathname.startsWith(r));
  if (!ehRotaAdmin) return NextResponse.next();

  const rawRoles = request.cookies.get('userRoles')?.value ?? '';
  const roles = decodeURIComponent(rawRoles)
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);

  // Só bloqueia se o cookie existir e indicar exclusivamente ROLE_USUARIO.
  // Sem cookie → sessão admin anterior ainda válida, deixa passar (o backend rejeita requisições indevidas).
  if (roles.length === 0) return NextResponse.next();

  const somenteUsuario = roles.every((r) => r === 'ROLE_USUARIO');

  if (somenteUsuario) {
    const url = request.nextUrl.clone();
    url.pathname = '/externo';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/veiculo-admin/:path*',
    '/administrador/:path*',
    '/formularios/:path*',
    '/profile-ls/:path*',
    '/crm/:path*',
    '/gestao/:path*',
  ],
};
