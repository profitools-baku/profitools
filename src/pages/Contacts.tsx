import { useTranslation } from "@/hooks/useTranslations";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

export default function Contacts() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{t("contactsTitle")}</h1>
          <p className="text-slate-500">{t("writeToUs")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{t("address")}</h3>
                <p className="text-sm text-slate-600">{t("addressValue")}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{t("phone")}</h3>
                <a href={`tel:${t("phoneValue")}`} className="text-sm text-slate-600 hover:text-orange-600">{t("phoneValue")}</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{t("email")}</h3>
                <a href={`mailto:${t("emailValue")}`} className="text-sm text-slate-600 hover:text-orange-600">{t("emailValue")}</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{t("workHours")}</h3>
                <p className="text-sm text-slate-600">{t("workHoursValue")}</p>
              </div>
            </div>


          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">{t("writeToUs")}</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">{t("fullName")}</label>
                <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500" placeholder={t("fullName")} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">{t("phone")}</label>
                <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500" placeholder={t("phoneValue")} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">{t("email")}</label>
                <input type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500" placeholder={t("emailValue")} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">{t("orderNotes")}</label>
                <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 resize-none" rows={4} placeholder={t("orderNotes")} />
              </div>
              <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors">
                {t("writeToUs")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
