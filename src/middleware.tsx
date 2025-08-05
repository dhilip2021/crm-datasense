import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
  const token = request.cookies.get('_token')?.value
  const { pathname } = request.nextUrl

  const isAuthPage = pathname === '/login'

  // 🔒 Auth Redirect
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 🔁 Manual Path Redirects
  if (pathname === '/app/lead-forms') {
    return NextResponse.redirect(new URL('/app/lead-form', request.url))
  }

  if (pathname === '/builder/lead-forms') {
    return NextResponse.redirect(new URL('/builder/lead-form', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/profile/:path*',
    '/users-list',
    '/add-user',
    '/fields/list-fields',
    '/fields/add-field',
    '/leads',
    '/leads/create-lead',
    '/leads/edit-lead/:path*',
    
    '/app/leads',
    '/app/lead-form',
    '/app/customer-form',

    '/builder',
    '/builder/lead-form',
    '/builder/lead-forms',
    '/builder/customer-form',
    
    '/customer',
    '/customer/create-customer',
    '/notes',
    '/tasks',
    '/organization',
    '/calls',
    '/emails',
    '/comments',
    '/deals',
    '/profile-settings'
  ]
}
