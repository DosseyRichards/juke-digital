import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// The main app domain(s) — requests to these go through normal routing
// Add your Vercel domain and any custom domains here
const APP_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'juke-digital.vercel.app',
]

function isAppDomain(hostname: string): boolean {
  return APP_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))
}

function getSubdomain(hostname: string): string | null {
  // Check for subdomain on known app domains
  // e.g., "my-bar.juke-digital.vercel.app" → "my-bar"
  // e.g., "my-bar.jukedigital.com" → "my-bar"
  for (const domain of APP_DOMAINS) {
    if (hostname.endsWith(`.${domain}`)) {
      const sub = hostname.slice(0, -(domain.length + 1))
      // Ignore www and empty subdomains
      if (sub && sub !== 'www') {
        return sub
      }
    }
  }
  return null
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] ?? ''
  const subdomain = getSubdomain(hostname)

  // If there's a subdomain, treat it as a venue site
  if (subdomain) {
    const url = request.nextUrl.clone()
    const path = url.pathname

    // Rewrite to the venue site pages
    if (path === '/' || path === '') {
      url.pathname = `/site/${subdomain}`
      return NextResponse.rewrite(url)
    }
    // Any other path under the subdomain becomes a page slug
    // e.g., my-bar.domain.com/menu → /site/my-bar/menu
    if (!path.startsWith('/_next') && !path.startsWith('/api') && !path.startsWith('/site')) {
      url.pathname = `/site/${subdomain}${path}`
      return NextResponse.rewrite(url)
    }
  }

  // Check if this is a custom domain (not an app domain at all)
  if (!isAppDomain(hostname) && hostname !== '') {
    // Custom domain — look up venue by domain
    // Rewrite to a special route that resolves the domain
    const url = request.nextUrl.clone()
    const path = url.pathname
    if (!path.startsWith('/_next') && !path.startsWith('/api')) {
      // Pass the custom domain as a header for the page to resolve
      url.pathname = `/site/_custom${path === '/' ? '' : path}`
      const response = NextResponse.rewrite(url)
      response.headers.set('x-custom-domain', hostname)
      return response
    }
  }

  // Normal app routing — handle auth
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
