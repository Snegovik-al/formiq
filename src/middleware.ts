import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'formiq-dev-secret-change-in-production'
)

const PUBLIC_PATHS = ['/', '/auth', '/api/auth', '/offline.html', '/_next', '/icons', '/screenshots', '/sw.js', '/manifest.json']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublic = PUBLIC_PATHS.some(p => path.startsWith(p)) ||
    path.match(/\.(png|jpg|jpeg|gif|svg|ico|woff2|css|js)$/)

  if (isPublic) return NextResponse.next()

  const token = request.cookies.get('formiq_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.delete('formiq_token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
