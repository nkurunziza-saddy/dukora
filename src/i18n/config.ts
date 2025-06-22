export const locales = ["en", "es", "fr", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames = {
  en: "English",
  es: "Español",
  fr: "Français",
  zh: "中文",
};
