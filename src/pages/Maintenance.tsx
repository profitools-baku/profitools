import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { Wrench, Phone, Mail, Clock, Globe } from "lucide-react";
import { ZendorLogo } from "@/components/ZendorLogo";

const translations = {
  ru: {
    title: "Технические работы",
    heading: "Сайт на обслуживании",
    desc: "Мы проводим плановые технические работы, чтобы сделать наш сервис ещё быстрее и удобнее. Скоро всё заработает!",
    contact: "Если у вас есть срочный вопрос, вы можете связаться с нами:",
    backSoon: "Скоро вернемся",
    adminLink: "Вход для администратора"
  },
  az: {
    title: "Texniki işlər",
    heading: "Sayt təkmilləşdirilir",
    desc: "Sizə daha sürətli və rahat xidmət göstərmək üçün planlı texniki işlər aparırıq. Tezliklə yenidən xidmətinizdəyik!",
    contact: "Təcili sualınız varsa, bizimlə əlaqə saxlaya bilərsiniz:",
    backSoon: "Tezliklə qayıdacağıq",
    adminLink: "Admin girişi"
  }
};

export default function Maintenance() {
  const { lang, setLanguage } = useLanguage();
  const t = translations[lang] || translations.ru;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between items-center px-6 py-12 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-slate-800/20 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-6xl flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <ZendorLogo className="text-white" />
          <span className="text-white font-extrabold text-lg tracking-wider">
            PROFI<span className="text-orange-500">TOOLS</span>
          </span>
        </div>
        
        {/* Language switcher */}
        <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl">
          <Globe className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => setLanguage("az")}
            className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-colors ${
              lang === "az" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            AZ
          </button>
          <button
            onClick={() => setLanguage("ru")}
            className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-colors ${
              lang === "ru" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            RU
          </button>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex flex-col justify-center items-center max-w-xl text-center z-10 my-12">
        {/* Animated gear logo */}
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            className="w-24 h-24 bg-slate-900/80 border-2 border-orange-500/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.15)]"
          >
            <Wrench className="w-12 h-12 text-orange-500 stroke-[1.5]" />
          </motion.div>
          
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute -bottom-1 -right-1 bg-orange-500 text-slate-950 p-2 rounded-full shadow-lg"
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
          </motion.div>
        </div>

        {/* Heading */}
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
          {t.title}
        </span>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          {t.heading}
        </h1>

        <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-10">
          {t.desc}
        </p>

        {/* Contacts section */}
        <div className="w-full bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            {t.contact}
          </h3>
          
          <div className="flex flex-col gap-4">
            <a 
              href="tel:+994501234567" 
              className="flex items-center gap-3 text-slate-300 hover:text-orange-500 transition-colors group"
            >
              <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-orange-500/10 transition-colors">
                <Phone className="w-4 h-4 text-orange-500" />
              </div>
              <span className="font-semibold text-sm">+994 (50) 123-45-67</span>
            </a>
            
            <a 
              href="mailto:info@profitools.az" 
              className="flex items-center gap-3 text-slate-300 hover:text-orange-500 transition-colors group"
            >
              <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-orange-500/10 transition-colors">
                <Mail className="w-4 h-4 text-orange-500" />
              </div>
              <span className="font-semibold text-sm">info@profitools.az</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 border-t border-slate-900 pt-8 z-10">
        <div>
          © {new Date().getFullYear()} ProfiTools Azerbaijan. All rights reserved.
        </div>
        <div>
          <a href="/admin/login" className="hover:text-orange-500 transition-colors font-medium">
            {t.adminLink}
          </a>
        </div>
      </footer>
    </div>
  );
}
