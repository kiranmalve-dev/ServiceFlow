"use client";

import { useEffect, useState } from "react";
import { useLocaleStore } from "../../store/localeStore";
import Header from "./header";

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
  
  if (!mounted || !_hasHydrated) return null;

  return <Header />;
}
