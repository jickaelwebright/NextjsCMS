import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;

  // Skip static files and API auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Resolve tenant from path prefix (/sites/[slug]) for MVP
  const siteMatch = pathname.match(/^\/sites\/([^/]+)(\/.*)?$/);
  if (siteMatch) {
    const tenantSlug = siteMatch[1];
    const response = NextResponse.next();
    response.headers.set("x-tenant-slug", tenantSlug);
    return response;
  }

  // Resolve tenant from subdomain
  const parts = host.split(":")[0].split(".");
  if (parts.length >= 3 && parts[0] !== "www") {
    const tenantSlug = parts[0];
    const response = NextResponse.next();
    response.headers.set("x-tenant-slug", tenantSlug);
    return response;
  }

  // For the root domain, inject a default tenant slug from query or cookie
  const tenantFromQuery = request.nextUrl.searchParams.get("tenant");
  if (tenantFromQuery) {
    const response = NextResponse.next();
    response.headers.set("x-tenant-slug", tenantFromQuery);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
