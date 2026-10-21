"use client";

import { useLocaleStore } from "../../store/localeStore";
import { t } from "../../i18";

export default function ServicesHeader() {
  const { msgs } = useLocaleStore();

  return (
    <div className="mb-8">
      <h2
        id="services-heading"
        className="text-2xl sm:text-3xl font-bold text-zinc-900"
      >
        {t(msgs, "services.title")}
      </h2>
      <p className="mt-1 text-zinc-500 text-base">
        {t(msgs, "services.subtitle")}
      </p>
    </div>
  );
}
