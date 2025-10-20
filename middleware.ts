// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const start = Date.now()

  // Log method, path and timestamp
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.nextUrl.pathname}`
  )

  // Continue request chain
  const res = NextResponse.next()

  // When response finishes, log elapsed time
  res.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  console.log(
    `→ ${req.method} ${req.nextUrl.pathname} completed in ${
      Date.now() - start
    } ms`
  )

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
