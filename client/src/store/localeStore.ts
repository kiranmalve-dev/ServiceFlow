import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Locale, type Direction, type Messages, messages, getDirection } from "../i18";

interface LocaleState {
  locale: Locale;
  dir: Direction;
  msgs: Messages;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      dir: "ltr",
      msgs: messages.en,
      _hasHydrated: false,
      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),
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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
