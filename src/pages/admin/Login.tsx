import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { Settings } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslations";

export default function AdminLogin() {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const { login, isLoading, error, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await (login as any)({ code });
      // The useAuth hook will handle the user state update
    } catch (err) {
      // Error handled by useAuth
    }
  };

  if (isAdmin) {
    navigate("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
              <Settings className="w-10 h-10" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">{t("adminAccess")}</h1>
          <p className="text-slate-500 text-center mb-6">{t("enterSecretCode")}</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center font-medium">
              {t("invalidCode")}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder={t("secretCodePlaceholder")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-center text-lg tracking-widest"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50"
            >
              {isLoading ? t("checking") : t("enterPanel")}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">ZENDOR TOOLS Security</p>
        </div>
      </div>
    </div>
  );
}
