"use client";

import { useEffect, useState } from "react";
import { useLocaleStore } from "../../store/localeStore";

/**
 * Mounts in RootLayout (every route).
 * Only job: keep <html lang> and <html dir> in sync with the Zustand locale
 * after client hydration. Renders no visible UI.
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

  // Renders nothing — this component only has DOM side-effects
  return null;
}
