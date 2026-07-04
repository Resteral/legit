import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export default async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');

  // Define our main domains (treating local IPs as main domain for dev testing)
  const isLocalIP = hostname?.startsWith('127.0.0.1') || 
                     hostname?.startsWith('192.168.') || 
                     hostname?.startsWith('10.') || 
                     hostname?.startsWith('172.') || 
                     hostname?.includes('localhost');

  const isMainDomain = isLocalIP || 
                       hostname?.includes('resolve.bet') || 
                       hostname?.includes('vercel.app');

  // If this is a custom domain, rewrite to our domain route handler
  if (!isMainDomain && hostname) {
    // We rewrite the request to /domain/[hostname]
    // The user's requested path (e.g. /about) is technically lost here since the route handler just serves the HTML.
    // Since these are single page HTML files, that's fine for now.
    return NextResponse.rewrite(new URL(`/domain/${hostname}`, request.url));
  }

  // If it's a main domain request, enforce session auth
  return await updateSession(request)
}
