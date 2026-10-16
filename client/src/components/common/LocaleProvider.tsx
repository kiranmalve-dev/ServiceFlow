"use client";

import { useEffect } from "react";
import { useLocaleStore } from "../../store/localeStore";

/**
 * Syncs the locale and direction from the Zustand store onto the <html> element.
 * Must be rendered inside the <body> (or anywhere in the client tree).
 */
export default function LocaleProvider() {
  const { locale, dir } = useLocaleStore();

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", locale);
    html.setAttribute("dir", dir);
    // Swap font family for Hebrew
    if (dir === "rtl") {
      html.style.setProperty("--font-body", "'Noto Sans Hebrew', sans-serif");
    } else {
      html.style.removeProperty("--font-body");
    }
  }, [locale, dir]);

  return null;
}
