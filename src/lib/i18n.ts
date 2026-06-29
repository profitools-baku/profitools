export type Language = "az" | "ru";

const STORAGE_KEY = "profi-tools-lang";

let currentLang: Language = "az";

const listeners = new Set<() => void>();

export function initLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "az" || stored === "ru") {
    currentLang = stored;
  } else {
    currentLang = "az";
  }
  return currentLang;
}

export function getLanguage(): Language {
  return currentLang;
}

export function setLanguage(lang: Language): void {
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  listeners.forEach((fn) => fn());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function t(translations: Record<Language, string>): string {
  return translations[currentLang] || translations["az"] || "";
}

export function tObj<T>(translations: Record<Language, T>): T {
  return translations[currentLang] || translations["az"];
}
