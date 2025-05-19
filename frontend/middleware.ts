import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes and their allowed roles
const protectedRoutes = {
  '/admin': ['admin'],
  '/user': ['user'],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for auth-related routes and static files
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get user data from localStorage
  const userStr = request.cookies.get('auth_user')?.value
  const user = userStr ? JSON.parse(userStr) : null

  // Handle root path redirection
  if (pathname === '/') {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Redirect based on user role
    if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else if (user.role === 'user') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }
  }

  // Check protected routes
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      // If no user or user's role is not allowed, redirect to auth
      if (!user || !allowedRoles.includes(user.role)) {
        return NextResponse.redirect(new URL('/auth', request.url))
      }
      break
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 