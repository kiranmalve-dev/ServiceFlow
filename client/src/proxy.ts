import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


function hasCustomerToken(req: NextRequest) {
  return Boolean(req.cookies.get("cus_token")?.value);
}
function hasAdminToken(req: NextRequest) {
  return Boolean(req.cookies.get("adm_token")?.value);
}
function is(pathname: string, exact: string) {
  return pathname === exact;
}

function startsWith(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isCustomer = hasCustomerToken(request);
  const isAdmin    = hasAdminToken(request);

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN ROUTES  /admin/*
  // ─────────────────────────────────────────────────────────────────────────

  if (startsWith(pathname, "/admin")) {
    // 1a. Already authenticated admin hitting the login page → dashboard
    if (is(pathname, "/admin/login") || is(pathname, "/admin")) {
      if (isAdmin) {
        const cb  = request.nextUrl.searchParams.get("callbackUrl");
        const dest = cb && startsWith(cb, "/admin") ? cb : "/admin/dashboard";
        return NextResponse.redirect(new URL(dest, request.url));
      }
      return NextResponse.next();
    }

    // 1b. All other /admin/* routes require admin token
    if (!isAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 1c. Authenticated as customer-only, not as admin → back to home
    if (isCustomer && !isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOMER ROUTES  /customer/*
  // ─────────────────────────────────────────────────────────────────────────

  if (startsWith(pathname, "/customer")) {

    // 2a. Customer login page  /customer/login
    if (is(pathname, "/customer/login")) {
      if (isCustomer) {
        // Already logged in — honour callbackUrl or go home
        const cb   = request.nextUrl.searchParams.get("callbackUrl");
        const dest = cb && startsWith(cb, "/customer") ? cb : "/";
        return NextResponse.redirect(new URL(dest, request.url));
      }
      return NextResponse.next();
    }

    // 2b. Customer register page  /customer/register  — always public
    if (is(pathname, "/customer/register")) {
      return NextResponse.next();
    }

    // 2c. Public customer pages  /customer/services/*  — always public
    if (startsWith(pathname, "/customer/services")) {
      return NextResponse.next();
    }

    // 2d. Protected customer pages  /customer/my-booking  etc.
    if (!isCustomer) {
      const loginUrl = new URL("/customer/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2e. Admin-only token on customer private pages → home
    if (isAdmin && !isCustomer) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC HOME  /
  // ─────────────────────────────────────────────────────────────────────────
  return NextResponse.next();
}

// ── Matcher ───────────────────────────────────────────────────────────────────
// Only run middleware on the routes that actually need it.
// Static assets, _next internals, and API routes are excluded automatically
// by Next.js when using the matcher — no need to exclude them manually.

export const config = {
  matcher: [
    // All admin routes (login + dashboard)
    "/admin",
    "/admin/:path*",

    // Customer auth pages
    "/customer/login",
    "/customer/register",

    // Customer protected pages
    "/customer/my-booking",
    "/customer/my-booking/:path*",
  ],
};
