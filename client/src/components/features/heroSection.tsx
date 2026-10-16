"use client";

import React from "react";
import { useLocaleStore } from "../../store/localeStore";
import { t } from "../../i18";

export default function HeroSection() {
  const { msgs } = useLocaleStore();

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="max-w-2xl">
        <span className="inline-block mb-4 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold tracking-wider uppercase">
          {t(msgs, "hero.badge")}
        </span>
        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
        >
          {t(msgs, "hero.title")}
          <br />
          <span className="text-blue-200">{t(msgs, "hero.titleHighlight")}</span>
        </h1>
        <p className="mt-5 text-blue-100 text-lg sm:text-xl leading-relaxed">
          {t(msgs, "hero.subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#services"
            className="px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold text-sm
              hover:bg-blue-50 transition-colors
              focus:outline-2 focus:outline-offset-2 focus:outline-white"
          >
            {t(msgs, "hero.browseServices")}
          </a>
        </div>
      </div>
    </div>
  );
}
