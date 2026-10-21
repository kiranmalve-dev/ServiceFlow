import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Locale helpers ────────────────────────────────────────────────────────────

const LOCALES = ["en", "he"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "en";

/**
 * Resolve the active locale from the persisted Zustand cookie.
 * zustand-persist stores the whole state as JSON under the key name.
 * Falls back to DEFAULT_LOCALE when the cookie is absent or malformed.
 */
function resolveLocale(req: NextRequest): Locale {
  const raw = req.cookies.get("locale-preference")?.value;
  if (raw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      const locale = parsed?.state?.locale;
      if (LOCALES.includes(locale)) return locale as Locale;
    } catch {
      // malformed cookie — fall through to default
    }
  }
  return DEFAULT_LOCALE;
}

/** Map locale → BCP-47 language tag used in Content-Language header. */
const LANG_TAG: Record<Locale, string> = {
  en: "en",
  he: "he",
};

// ── Auth helpers ──────────────────────────────────────────────────────────────

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

// ── Proxy ─────────────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isCustomer = hasCustomerToken(request);
  const isAdmin    = hasAdminToken(request);

  // ── Resolve locale early so every response branch can carry SEO headers ──
  const locale = resolveLocale(request);
  const lang   = LANG_TAG[locale];

  /**
   * Attach SEO-relevant locale headers to every NextResponse we return.
   * Content-Language tells crawlers which language this response is in.
   * The <html lang> / dir attributes are managed client-side by
   * localeProvider.tsx after the Zustand store hydrates from localStorage.
   */
  function withLocaleHeaders(res: NextResponse): NextResponse {
    res.headers.set("Content-Language", lang);
    return res;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN ROUTES  /admin/*
  // ─────────────────────────────────────────────────────────────────────────

  if (startsWith(pathname, "/admin")) {
    // 1a. Already authenticated admin hitting the login page → dashboard
    if (is(pathname, "/admin/login") || is(pathname, "/admin")) {
      if (isAdmin) {
        const cb   = request.nextUrl.searchParams.get("callbackUrl");
        const dest = cb && startsWith(cb, "/admin") ? cb : "/admin/dashboard";
        return withLocaleHeaders(
          NextResponse.redirect(new URL(dest, request.url))
        );
      }
      return withLocaleHeaders(NextResponse.next());
    }

    // 1b. All other /admin/* routes require admin token
    if (!isAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return withLocaleHeaders(NextResponse.redirect(loginUrl));
    }

    // 1c. Customer-only token on admin route → home
    if (isCustomer && !isAdmin) {
      return withLocaleHeaders(
        NextResponse.redirect(new URL("/", request.url))
      );
    }

    return withLocaleHeaders(NextResponse.next());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOMER ROUTES  /customer/*
  // ─────────────────────────────────────────────────────────────────────────

  if (startsWith(pathname, "/customer")) {
    // 2a. Customer login page — redirect away if already logged in
    if (is(pathname, "/customer/login")) {
      if (isCustomer) {
        const cb   = request.nextUrl.searchParams.get("callbackUrl");
        const dest = cb && startsWith(cb, "/customer") ? cb : "/";
        return withLocaleHeaders(
          NextResponse.redirect(new URL(dest, request.url))
        );
      }
      return withLocaleHeaders(NextResponse.next());
    }

    // 2b. Register — always public
    if (is(pathname, "/customer/register")) {
      return withLocaleHeaders(NextResponse.next());
    }

    // 2c. Public service detail pages — always public
    if (startsWith(pathname, "/customer/services")) {
      return withLocaleHeaders(NextResponse.next());
    }

    // 2d. Protected customer pages — must be logged in
    if (!isCustomer) {
      const loginUrl = new URL("/customer/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return withLocaleHeaders(NextResponse.redirect(loginUrl));
    }

    // 2e. Admin-only token on customer private pages → home
    if (isAdmin && !isCustomer) {
      return withLocaleHeaders(
        NextResponse.redirect(new URL("/", request.url))
      );
    }

    return withLocaleHeaders(NextResponse.next());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC / HOME  — carry locale headers for SEO
  // ─────────────────────────────────────────────────────────────────────────
  return withLocaleHeaders(NextResponse.next());
}

// ── Matcher ───────────────────────────────────────────────────────────────────
// Covers every page route so the Content-Language header is always present.
// Static assets and _next internals are excluded via the negative lookahead.

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
