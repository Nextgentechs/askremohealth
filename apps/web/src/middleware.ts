import { NextResponse, type NextRequest } from "next/server";

/**
 * Helpers
 */
const PUBLIC_PATHS = ["/", "/auth", "/adminAuth", "/about", "/contact", "/favicon.ico"];

const isPublicPath = (path: string) =>
  PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));

const redirectTo = (req: NextRequest, path: string) => {
  const url = req.nextUrl.clone();
  url.pathname = path;
  return NextResponse.redirect(url);
};

const rewriteTo = (req: NextRequest, path: string) => {
  const url = req.nextUrl.clone();
  url.pathname = path;
  return NextResponse.rewrite(url);
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const hostname = req.headers.get("host") ?? "";
  const sessionId = req.cookies.get("session-id")?.value ?? null;

  const isAdminSub = hostname === "admin.askremohealth.com" || hostname.startsWith("admin.");
  const isDoctorsSub = hostname.startsWith("doctors.");

  const isProduction =
    hostname === "askremohealth.com" || hostname === "www.askremohealth.com";

  const inPublic = isPublicPath(pathname);

  console.log(
    `Host: ${hostname} | Path: ${pathname} | Session: ${!!sessionId} | Admin: ${isAdminSub} | Doctors: ${isDoctorsSub}`
  );

  // -----------------------------------------------------------------------------------
  // ADMIN SUBDOMAIN
  // -----------------------------------------------------------------------------------
  if (isAdminSub) {
    // Always redirect admin root → /adminAuth
    if (pathname === "/") {
      return redirectTo(req, "/adminAuth");
    }

    // Set session via ?sessionId
    const urlSessionId = req.nextUrl.searchParams.get("sessionId");
    if (urlSessionId && !sessionId) {
      const response = NextResponse.next();
      response.cookies.set("session-id", urlSessionId, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        domain: ".askremohealth.com",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    // Already authenticated → skip login
    if (pathname === "/adminAuth" && sessionId) {
      return redirectTo(req, "/admin/doctors");
    }

    // Protect /admin/*
    if (!sessionId && pathname.startsWith("/admin")) {
      return redirectTo(req, "/adminAuth");
    }

    // Normalize admin paths → force /admin/*
    if (!pathname.startsWith("/admin") && pathname !== "/adminAuth") {
      const clean = pathname.replace(/^\/+/, "");
      return redirectTo(req, `/admin/${clean}`);
    }

    return NextResponse.next();
  }

  // -----------------------------------------------------------------------------------
  // DOCTORS SUBDOMAIN
  // -----------------------------------------------------------------------------------
  if (isDoctorsSub) {
    // Root → specialist dashboard
    if (pathname === "/") {
      return redirectTo(req, "/specialist/upcoming-appointments");
    }

    // Protect pages
    if (!sessionId && !inPublic) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("role", "doctor");
      return NextResponse.redirect(url);
    }

    // Normalize: everything → /specialist/*
    if (!pathname.startsWith("/specialist") && !inPublic) {
      const clean = pathname.replace(/^\/+/, "");
      return redirectTo(req, `/specialist/${clean}`);
    }

    return NextResponse.next();
  }

  // -----------------------------------------------------------------------------------
  // SPECIALIST PATHS ON MAIN DOMAIN → MOVE TO DOCTORS SUBDOMAIN
  // -----------------------------------------------------------------------------------
  if (pathname.startsWith("/specialist") && !isDoctorsSub) {
    const doctorsHost = isProduction
      ? "doctors.askremohealth.com"
      : "doctors.localhost";

    const target = new URL(pathname, `https://${doctorsHost}`);
    const response = NextResponse.redirect(target);

    if (sessionId) {
      response.cookies.set("session-id", sessionId, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        domain:
          process.env.NODE_ENV === "production" ? ".askremohealth.com" : undefined,
      });
    }

    return response;
  }

  // -----------------------------------------------------------------------------------
  // ADMIN PATHS ON MAIN DOMAIN → MOVE TO ADMIN SUBDOMAIN
  // -----------------------------------------------------------------------------------
  if (pathname.startsWith("/admin") && !isAdminSub) {
    if (isProduction) {
      return NextResponse.redirect(
        new URL(pathname, "https://admin.askremohealth.com")
      );
    }
    return NextResponse.next();
  }

  // -----------------------------------------------------------------------------------
  // DEFAULT: allow
  // -----------------------------------------------------------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
