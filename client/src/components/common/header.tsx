"use client";

import React, { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useLocaleStore } from "../../store/localeStore";
import { useCustomerAuthStore } from "../../store/customerAuthStore";
import { t } from "../../i18";
import LoginDialog from "../features/loginDialog";
import { logout } from "@/src/lib/auth";

function HeaderInner() {
  const pathname = usePathname();
  const { msgs, dir, toggleLocale, locale } = useLocaleStore();
  const { isAuthenticated, user, clearAuth } = useCustomerAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", labelKey: "navigation.home" },
    ...(isAuthenticated
      ? [{ href: "/customer/my-booking", labelKey: "navigation.myBooking" }]
      : []),
  ] as const;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  async function handleSignOut() {
    try {
      const res = await logout();
      clearAuth();
      setUserMenuOpen(false);
      if (res?.success) {
        window.location.href = "/";
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:start-2
          bg-white text-zinc-900 px-4 py-2 rounded shadow font-medium text-sm underline
          focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
      >
        {t(msgs, "navigation.skipToContent")}
      </a>

      <header
        role="banner"
        className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-sm"
      >
        <nav
          aria-label="Main navigation"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex items-center justify-between h-16 gap-4">

            <Link
              href="/"
              aria-label="ServiceFlow — home"
              className="flex-shrink-0 font-bold text-lg text-blue-600 tracking-tight
                rounded focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
            >
              ServiceFlow
            </Link>

            <ul role="list" className="hidden md:flex items-center gap-1 flex-1">
              {navLinks.map(({ href, labelKey }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors
                      focus:outline-2 focus:outline-offset-2 focus:outline-blue-600
                      ${
                        isActive(href)
                          ? "bg-blue-50 text-blue-700"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                      }`}
                  >
                    {t(msgs, labelKey)}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLocale}
                aria-pressed={locale === "he"}
                aria-label={`Switch to ${locale === "en" ? "Hebrew" : "English"}`}
                className="hidden md:inline-flex items-center px-3 py-1.5 rounded border border-zinc-300
                  text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors
                  focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
              >
                {t(msgs, "navigation.toggleLanguage")}
              </button>

              {isAuthenticated && user ? (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    aria-label={`Account menu for ${user.name}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200
                      text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors
                      focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full
                      bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                      {user.name.charAt(0)}
                    </span>
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown
                      size={14}
                      aria-hidden="true"
                      className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div
                      role="menu"
                      aria-label="Account options"
                      className="absolute end-0 mt-1 w-48 rounded-lg border border-zinc-200
                        bg-white shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-zinc-100">
                        <p className="text-xs text-zinc-500">Signed in as</p>
                        <p className="text-sm font-medium text-zinc-900 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/customer/my-booking"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700
                          hover:bg-zinc-50 transition-colors focus:outline-2 focus:outline-blue-600"
                      >
                        <User size={14} aria-hidden="true" />
                        {t(msgs, "navigation.myBookings")}
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600
                          hover:bg-red-50 transition-colors focus:outline-2 focus:outline-blue-600"
                      >
                        <LogOut size={14} aria-hidden="true" />
                        {t(msgs, "navigation.signOut")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                    bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors
                    focus:outline-2 focus:outline-offset-2 focus:outline-blue-800"
                >
                  {t(msgs, "login.signIn")}
                </button>
              )}

              <button
                type="button"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden p-2 rounded text-zinc-600 hover:bg-zinc-100 transition-colors
                  focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
              >
                {mobileOpen
                  ? <X size={20} aria-hidden="true" />
                  : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div
              id="mobile-menu"
              ref={mobileMenuRef}
              className="md:hidden border-t border-zinc-100 pb-4"
            >
              <ul role="list" className="mt-2 flex flex-col gap-1">
                {navLinks.map(({ href, labelKey }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive(href) ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2 rounded text-sm font-medium transition-colors
                        focus:outline-2 focus:outline-offset-2 focus:outline-blue-600
                        ${
                          isActive(href)
                            ? "bg-blue-50 text-blue-700"
                            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                        }`}
                    >
                      {t(msgs, labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-3 px-1 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleLocale();
                    setMobileOpen(false);
                  }}
                  aria-pressed={locale === "he"}
                  aria-label={`Switch to ${locale === "en" ? "Hebrew" : "English"}`}
                  className="w-full text-start px-3 py-2 rounded border border-zinc-300
                    text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors
                    focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
                >
                  {t(msgs, "navigation.toggleLanguage")}
                </button>

                {isAuthenticated && user ? (
                  <>
                    <div className="px-3 py-2 rounded bg-zinc-50 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full
                        bg-blue-100 text-blue-700 text-xs font-bold uppercase flex-shrink-0">
                        {user.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleSignOut();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium
                        text-red-600 hover:bg-red-50 transition-colors
                        focus:outline-2 focus:outline-offset-2 focus:outline-red-600"
                    >
                      <LogOut size={14} aria-hidden="true" />
                      {t(msgs, "navigation.signOut")}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      setLoginOpen(true);
                    }}
                    className="block w-full px-3 py-2 rounded bg-blue-600 text-white text-sm font-medium
                      text-center hover:bg-blue-700 transition-colors
                      focus:outline-2 focus:outline-offset-2 focus:outline-blue-800"
                  >
                    {t(msgs, "login.signIn")}
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}

export default function Header() {
  return (
    <Suspense
      fallback={
        <div className="sticky top-0 z-40 h-16 bg-white border-b border-zinc-200 shadow-sm" />
      }
    >
      <HeaderInner />
    </Suspense>
  );
}
