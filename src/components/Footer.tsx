import { Link } from "react-router";
import { useTranslation } from "@/hooks/useTranslations";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

import { motion } from "framer-motion";
import { ZendorLogo } from "./ZendorLogo";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Trust bar */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />, title: "trustOriginal", desc: "trustOriginalDesc" },
              { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />, title: "trustWarranty", desc: "trustWarrantyDesc" },
              { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />, title: "trustDelivery", desc: "trustDeliveryDesc" },
              { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />, title: "trustSupport", desc: "trustSupportDesc" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon}
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{t(item.title)}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t(item.desc)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <ZendorLogo size="sm" animate={true} />
              <div className="leading-tight">
                <div className="text-base font-extrabold text-white flex items-center">
                  ZENDOR<span className="text-orange-500 ml-1">TOOLS</span>
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Azerbaijan</div>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">{t("footerAbout")}</p>
          </motion.div>

          {/* Links column */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t("information")}</h4>
            <ul className="space-y-2">
              {[
                { key: "about", href: "/about" },
                { key: "delivery", href: "/delivery" },
                { key: "contacts", href: "/contacts" },
                { key: "catalog", href: "/catalog" },
              ].map((link) => (
                <li key={link.key}>
                  <Link to={link.href} className="text-xs text-slate-400 hover:text-orange-400 transition-all hover:translate-x-1 inline-block">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t("contacts")}</h4>
            <ul className="space-y-3">
              <motion.li whileHover={{ x: 2 }} className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-400">{t("addressValue")}</span>
              </motion.li>
              <motion.li whileHover={{ x: 2 }} className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <a href="tel:+996312963117" className="text-xs text-slate-400 hover:text-orange-400 transition-colors">+996 312 963 117</a>
              </motion.li>
              <motion.li whileHover={{ x: 2 }} className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <a href="mailto:zendororis@gmail.com" className="text-xs text-slate-400 hover:text-orange-400 transition-colors">zendororis@gmail.com</a>
              </motion.li>
              <motion.li whileHover={{ x: 2 }} className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-xs text-slate-400">{t("workHoursValue")}</span>
              </motion.li>
            </ul>
          </div>

          {/* Actions column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white mb-4">{t("writeToUs")}</h4>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="tel:+996312963117"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow-orange-500/20"
            >
              <Phone className="w-4 h-4" />
              {t("callNow")}
            </motion.a>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; 2026 ZENDOR TOOLS. {t("rights")}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">{t("trustOriginal")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
