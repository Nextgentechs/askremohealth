import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get("session-id")?.value ?? null;

  const url = req.nextUrl;
  const pathname = url.pathname;
  const hostname = req.headers.get("host") ?? "";

  const xOriginalHost = req.headers.get("x-original-host");
  const xProxySource = req.headers.get("x-proxy-source");

  // Detect proxied admin requests (staging)
  const isProxiedAdmin =
    xProxySource === "admin-subdomain" ||
    (hostname.includes("staging.askremohealth.com") &&
      xOriginalHost?.includes("admin.askremohealth.com"));

  const effectiveHost = isProxiedAdmin ? xOriginalHost ?? hostname : hostname;

  // Domain checks
  const isAdminDomain = effectiveHost.startsWith("admin.");
  const isDoctorsDomain = effectiveHost.startsWith("doctors.");

  const isProduction =
    hostname === "askremohealth.com" ||
    hostname === "www.askremohealth.com";

  const isStaging = hostname.includes("staging.askremohealth.com");

  // Public admin paths
  const adminPublic = ["/adminAuth", "/favicon.ico"];
  const isAdminPublic = adminPublic.includes(pathname);

  // Public main paths
  const mainPublic = ["/", "/auth", "/about", "/contact", "/favicon.ico"];
  const isMainPublic = mainPublic.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // ---------- ADMIN SUBDOMAIN ----------
  if (isAdminDomain || isProxiedAdmin) {
    // 1. Root always → /adminAuth
    if (pathname === "/") {
      const newUrl = url.clone();
      newUrl.pathname = "/adminAuth";
      return NextResponse.rewrite(newUrl);
    }

    // 2. If on /adminAuth and logged in → dashboard
    if (pathname === "/adminAuth" && sessionId) {
      const dashboard = url.clone();
      dashboard.pathname = "/admin/doctors";
      return NextResponse.redirect(dashboard);
    }

    // 3. Protect all /admin routes if no session
    if (pathname.startsWith("/admin") && !sessionId) {
      const auth = url.clone();
      auth.pathname = "/adminAuth";
      return NextResponse.redirect(auth);
    }

    // 4. If someone visits non-admin path → rewrite into /admin/*
    if (!pathname.startsWith("/admin") && pathname !== "/adminAuth") {
      const clean = pathname.replace(/^\/+/, "");
      const newUrl = url.clone();
      newUrl.pathname = `/admin/${clean}`;
      return NextResponse.redirect(newUrl);
    }

    return NextResponse.next();
  }

  // ---------- DOCTORS SUBDOMAIN ----------
  if (isDoctorsDomain) {
    // Root redirects to doctor dashboard
    if (pathname === "/") {
      const newUrl = url.clone();
      newUrl.pathname = "/specialist/upcoming-appointments";
      return NextResponse.redirect(newUrl);
    }

    // Require login for specialist pages
    if (!sessionId && !isMainPublic) {
      const newUrl = url.clone();
      newUrl.pathname = "/auth";
      newUrl.searchParams.set("role", "doctor");
      return NextResponse.redirect(newUrl);
    }

    // Force all non-specialist routes into /specialist/*
    if (!pathname.startsWith("/specialist") && !isMainPublic) {
      const clean = pathname.replace(/^\/+/, "");
      const newUrl = url.clone();
      newUrl.pathname = `/specialist/${clean}`;
      return NextResponse.redirect(newUrl);
    }

    return NextResponse.next();
  }

  // ---------- MAIN DOMAIN (Production) ----------
  if (isProduction) {
    if (pathname.startsWith("/admin")) {
      // NEVER serve admin pages on main domain → redirect to admin subdomain
      const newUrl = new URL(url.pathname, "https://admin.askremohealth.com");
      return NextResponse.redirect(newUrl);
    }

    // Redirect specialist pages to doctors subdomain
    if (pathname.startsWith("/specialist")) {
      const newUrl = new URL(url.pathname, "https://doctors.askremohealth.com");
      return NextResponse.redirect(newUrl);
    }

    return NextResponse.next();
  }

  // ---------- MAIN DOMAIN (Staging) ----------
  if (isStaging) {
    // Allow admin routes on staging main domain
    return NextResponse.next();
  }

  // Default allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
