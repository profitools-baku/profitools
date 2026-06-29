import { useState, useEffect } from "react";
import { getLanguage, subscribe, setLanguage, type Language } from "@/lib/i18n";

export function useLanguage() {
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setLang(getLanguage());
    });
    return unsubscribe;
  }, []);

  return {
    lang,
    setLanguage: (l: Language) => setLanguage(l),
  };
}
