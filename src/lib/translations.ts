import type { Language } from "./i18n";
import { ru } from "./locales/ru";
import { az } from "./locales/az";

export type TranslationKey = keyof typeof ru;

export const translations: Record<TranslationKey, Record<Language, string>> = {} as any;

// Fill translations object
const keys = Object.keys(ru) as TranslationKey[];
for (const key of keys) {
  translations[key] = {
    ru: ru[key],
    az: az[key],
  };
}
