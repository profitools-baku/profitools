import { useTranslation } from "@/hooks/useTranslations";
import { useLanguage } from "@/hooks/useLanguage";
import { Truck, CreditCard, Banknote, Package, Clock, MapPin } from "lucide-react";

export default function Delivery() {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{t("deliveryTitle")}</h1>
        </div>

        {/* Delivery methods */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-500" />
            {t("deliveryMethods")}
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-800">{t("deliveryBaku")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Package className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-800">{t("deliveryRegions")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
              <Clock className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-700">{t("deliveryFree")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-500" />
            {t("paymentMethods")}
          </h2>
          <div className="max-w-md mx-auto p-6 border border-slate-200 rounded-lg text-center bg-slate-50">
            <div className="flex justify-center gap-4 mb-3">
              <Banknote className="w-8 h-8 text-orange-500" />
              <CreditCard className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {lang === "az" 
                ? "Qapıda nağd və ya bank kartı ilə ödəniş" 
                : "Оплата при получении наличными или картой"}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {lang === "az"
                ? "Sifarişinizi qapıda kuryerə nağd və ya bank kartı ilə ödəyə bilərsiniz."
                : "Вы можете оплатить заказ наличными или банковской картой курьеру при получении."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
