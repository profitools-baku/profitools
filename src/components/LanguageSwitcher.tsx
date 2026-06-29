import { useLanguage } from "@/hooks/useLanguage";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "az" as const, label: "AZ" },
  { code: "ru" as const, label: "RU" },
];

export function LanguageSwitcher() {
  const { lang, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      <Globe className="w-4 h-4 text-slate-400 mr-1" />
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code)}
          className={cn(
            "px-2 py-1 text-xs font-medium rounded transition-colors",
            lang === l.code
              ? "bg-orange-500 text-white"
              : "text-slate-300 hover:text-white hover:bg-slate-700"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
