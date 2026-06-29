import { Link } from "react-router";
import { useTranslation } from "@/hooks/useTranslations";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">{t("notFound")}</h2>
        <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium">
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}
