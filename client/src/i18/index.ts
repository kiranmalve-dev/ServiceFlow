import en from "./messages/en.json";
import he from "./messages/he.json";

export type Locale = "en" | "he";
export type Direction = "ltr" | "rtl";

export const messages = { en, he } as const;

export type Messages = typeof en;

export function getDirection(locale: Locale): Direction {
  return locale === "he" ? "rtl" : "ltr";
}

/**
 * Simple nested key accessor.
 * Usage: t(msgs, "booking.name")  or  t(msgs, "navigation.home")
 */
export function t(
  msgs: Messages,
  key: string,
  vars?: Record<string, string | number>
): string {
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = msgs;
  for (const part of parts) {
    value = value?.[part];
    if (value === undefined) return key;
  }
  let result = String(value);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      result = result.replace(`{${k}}`, String(v));
    }
  }
  return result;
}
