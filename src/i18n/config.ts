export const locales = ["en", "sw", "fr", "rw"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames = {
  en: "English",
  sw: "Swahili",
  fr: "Français",
  rw: "Kinyarwanda",
};
