import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
  const token = request.cookies.get('_token')?.value
  const { pathname } = request.nextUrl

  const isAuthPage = pathname === '/login'

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow the request to proceed
  return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/profile/:path*', '/login'],
  }