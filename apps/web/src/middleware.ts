import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const hostname = req.headers.get("host") ?? "";
  const sessionId = req.cookies.get("session-id")?.value ?? null;

  // Detect proxied admin requests (staging)
  const xOriginalHost = req.headers.get("x-original-host");
  const xProxySource = req.headers.get("x-proxy-source");
  const isProxiedAdmin =
    xProxySource === "admin-subdomain" ||
    (hostname.includes("staging.askremohealth.com") &&
      xOriginalHost?.includes("admin.askremohealth.com"));

  const effectiveHost = isProxiedAdmin ? xOriginalHost ?? hostname : hostname;

  const isAdminDomain = effectiveHost.startsWith("admin.");
  const isDoctorsDomain = effectiveHost.startsWith("doctors.");
  const isProduction =
    hostname === "askremohealth.com" || hostname === "www.askremohealth.com";
  const isStaging = hostname.includes("staging.askremohealth.com");

  // ---------- ADMIN SUBDOMAIN ----------
  if (isAdminDomain || isProxiedAdmin) {
    const loginPage = "/adminAuth";
    const dashboard = "/admin/doctors";

    // If logged in and hits login page or root → go to dashboard
    if (sessionId && (pathname === "/" || pathname === loginPage)) {
      return NextResponse.redirect(new URL(dashboard, req.url));
    }

    // If not logged in and tries to access protected admin routes → go to login
    if (!sessionId && pathname.startsWith("/admin") && pathname !== loginPage) {
      return NextResponse.redirect(new URL(loginPage, req.url));
    }

    // Only rewrite root to login if not logged in
    if (!sessionId && pathname === "/") {
      return NextResponse.rewrite(new URL(loginPage, req.url));
    }

    // Allow everything else
    return NextResponse.next();
  }

  // ---------- DOCTORS SUBDOMAIN ----------
  if (isDoctorsDomain) {
    if (pathname === "/") {
      return NextResponse.redirect(
        new URL("/specialist/upcoming-appointments", req.url)
      );
    }

    if (!sessionId && !pathname.startsWith("/auth")) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("role", "doctor");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ---------- MAIN DOMAIN ----------
  if (isProduction) {
    // Redirect /admin on main → admin subdomain
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(
        new URL(pathname, "https://admin.askremohealth.com")
      );
    }

    // Redirect /specialist → doctors subdomain
    if (pathname.startsWith("/specialist")) {
      return NextResponse.redirect(
        new URL(pathname, "https://doctors.askremohealth.com")
      );
    }
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
