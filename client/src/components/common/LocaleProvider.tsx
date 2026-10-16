"use client";

import { useEffect, useState } from "react";
import { useLocaleStore } from "../../store/localeStore";
import Header from "./header";

/**
 * Syncs the locale and direction from the Zustand store onto the <html> element.
 * Also gates header rendering until the persisted store has rehydrated,
 * which prevents t() from receiving undefined msgs on first render.
 */
export default function LocaleProvider() {
  const { locale, dir, _hasHydrated } = useLocaleStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    html.setAttribute("lang", locale);
    html.setAttribute("dir", dir);
    if (dir === "rtl") {
      html.style.setProperty("--font-body", "'Noto Sans Hebrew', sans-serif");
    } else {
      html.style.removeProperty("--font-body");
    }
  }, [locale, dir, mounted]);

  // Don't render header until client-side hydration is complete
  // so msgs is always a valid Messages object, never undefined
  if (!mounted || !_hasHydrated) return null;

  return <Header />;
}
