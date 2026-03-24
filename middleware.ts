export const runtime = 'nodejs'

import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((request) => {
  const isLoggedIn = !!request.auth
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isHomePage = request.nextUrl.pathname === '/'

  // Allow API routes and auth pages to pass through
  if (isApiRoute || isAuthPage || isHomePage) {
    return NextResponse.next()
  }

  // If not logged in and trying to access a protected page,
  // redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
})

// This tells Next.js which paths the middleware should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}