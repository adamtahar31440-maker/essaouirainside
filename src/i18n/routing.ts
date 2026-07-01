import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
  localePrefix: "always",
});

export const localeNames: Record<string, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export const rtlLocales = ["ar"];
