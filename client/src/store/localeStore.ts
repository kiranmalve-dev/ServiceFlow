import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Locale, type Direction, type Messages, messages, getDirection } from "../i18";

interface LocaleState {
  locale: Locale;
  dir: Direction;
  msgs: Messages;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      dir: "ltr",
      msgs: messages.en,
      toggleLocale: () =>
        set((state) => {
          const next: Locale = state.locale === "en" ? "he" : "en";
          return {
            locale: next,
            dir: getDirection(next),
            msgs: messages[next],
          };
        }),
      setLocale: (locale: Locale) =>
        set({
          locale,
          dir: getDirection(locale),
          msgs: messages[locale],
        }),
    }),
    {
      name: "locale-preference",
    }
  )
);
