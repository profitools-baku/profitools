import { useLanguage } from "./useLanguage";
import { translations } from "@/lib/translations";

export function useTranslation() {
  const { lang } = useLanguage();

  function t(key: string): string {
    const tr = translations[key];
    if (!tr) return key;
    return tr[lang] || tr["en"] || tr["az"] || key;
  }

  return { t, lang };
}
