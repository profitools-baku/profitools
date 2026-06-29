import { useTranslation } from "@/hooks/useTranslations";
import { Wrench, Shield, Truck, Headphones, Award, Users } from "lucide-react";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{t("aboutTitle")}</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">{t("aboutText1")}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
          <p className="text-slate-600 leading-relaxed mb-6">{t("aboutText1")}</p>
          <p className="text-slate-600 leading-relaxed">{t("aboutText2")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Wrench className="w-8 h-8" />, title: t("statBrands"), desc: t("statBrandsDesc") },
            { icon: <Shield className="w-8 h-8" />, title: t("statOriginal"), desc: t("statOriginalDesc") },
            { icon: <Truck className="w-8 h-8" />, title: t("statDelivery"), desc: t("statDeliveryDesc") },
            { icon: <Headphones className="w-8 h-8" />, title: t("statSupport"), desc: t("statSupportDesc") },
            { icon: <Award className="w-8 h-8" />, title: t("statProducts"), desc: t("statProductsDesc") },
            { icon: <Users className="w-8 h-8" />, title: t("statCustomers"), desc: t("statCustomersDesc") },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
