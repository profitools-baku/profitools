import { Link } from "react-router";
import { useTranslation } from "@/hooks/useTranslations";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Wrench, Ruler, Zap, PenTool, Cable, Settings } from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  "elektroinstrumenty": <Zap className="w-8 h-8" />,
  "ruchnye-instrumenty": <Wrench className="w-8 h-8" />,
  "izmeritelnye-instrumenty": <Ruler className="w-8 h-8" />,
  "markirovka": <PenTool className="w-8 h-8" />,
  "elektrika-kabel": <Cable className="w-8 h-8" />,
  "osnastka-rashodniki": <Settings className="w-8 h-8" />,
};

export default function Home() {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  const { data: categoriesData, isLoading: isLoadingCategories } = trpc.category.withProductCount.useQuery();
  const { data: popularProducts, isLoading: isLoadingProducts } = trpc.product.list.useQuery({ isPopular: true, limit: 8 });
  const { data: brandsData, isLoading: isLoadingBrands } = trpc.brand.withProductCount.useQuery();

  const getCategoryName = (cat: any) => {
    return lang === "az" ? cat.nameAz : cat.nameRu;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-banner.jpg" alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-slate-900/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-orange-400 text-xs font-medium">{t("onlyOriginal")}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
              {t("heroTitle")}
            </h1>
            <p className="text-base md:text-lg text-slate-400 mb-8 leading-relaxed">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/catalog"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                {t("shopNow")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/catalog"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors"
              >
                {t("viewCatalog")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">{t("popularCategories")}</h2>
          <Link to="/catalog" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
            {t("viewAll")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoadingCategories ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`cat-skel-${i}`} className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col items-center text-center animate-pulse">
                <div className="w-16 h-16 bg-slate-200 rounded-full mb-3" />
                <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
                <div className="h-2 w-12 bg-slate-100 rounded" />
              </div>
            ))
          ) : (
            categoriesData?.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.id}`}
                className="group bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center text-center hover:shadow-md hover:border-orange-300 transition-all"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:shadow-md transition-all mb-3 overflow-hidden border border-slate-100">
                  {cat.image ? (
                    <img src={cat.image} alt={getCategoryName(cat)} className="w-full h-full object-cover" />
                  ) : (
                    categoryIcons[cat.slug] || <Wrench className="w-8 h-8" />
                  )}
                </div>
                <h3 className="text-xs font-medium text-slate-700 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {getCategoryName(cat)}
                </h3>
                <span className="text-[10px] text-slate-400 mt-1">{cat.productCount} {t("productsFound")}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Popular Products */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">{t("popularProducts")}</h2>
            <Link to="/catalog" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
              {t("viewAll")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoadingProducts ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={`prod-skel-${i}`} className="bg-white rounded-xl border border-slate-100 flex flex-col animate-pulse overflow-hidden h-full">
                  <div className="w-full aspect-square bg-slate-200" />
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 bg-slate-200 rounded" />
                    <div className="mt-auto pt-4 flex justify-between items-end">
                      <div className="h-5 w-1/3 bg-slate-200 rounded" />
                      <div className="w-8 h-8 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              popularProducts?.items?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="bg-slate-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                {t("ourBrands")}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                {t("ourBrands")}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {t("trustOriginalDesc")}
              </p>
            </div>
            <Link to="/catalog" className="group/link flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-tight">
              {t("viewAll")}
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center group-hover/link:bg-orange-500 group-hover/link:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {isLoadingBrands ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={`brand-skel-${i}`} className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center animate-pulse min-h-[160px]">
                  <div className="w-16 h-8 bg-slate-200 rounded mb-6" />
                  <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                  <div className="h-2 w-10 bg-slate-100 rounded" />
                </div>
              ))
            ) : (
              brandsData?.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/catalog?brand=${brand.id}`}
                  className="relative group bg-white rounded-2xl border border-slate-200/60 p-8 flex flex-col items-center justify-center hover:border-orange-500/30 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 min-h-[160px] overflow-hidden"
                >
                  {brand.isNew === 'yes' && (
                    <div className="absolute top-0 right-0 z-10">
                      <div className="bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-bl-xl shadow-sm uppercase tracking-tighter">
                        {t("badgeNew")}
                      </div>
                    </div>
                  )}
                  
                  <div className="h-16 w-full flex items-center justify-center mb-6 transition-all duration-500">
                    {brand.logoUrl ? (
                      <img 
                        src={brand.logoUrl} 
                        alt={brand.name} 
                        className={`max-h-full max-w-full object-contain transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 mix-blend-multiply ${
                          brand.slug === 'king-tony' ? 'brightness-0 opacity-40' : 'grayscale opacity-40'
                        }`}
                      />
                    ) : (
                      <div className="text-lg font-bold text-slate-300 group-hover:text-orange-600 transition-colors">
                        {brand.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors mb-1">
                      {brand.name}
                    </h3>
                    <div className="h-1 w-0 bg-orange-500 mx-auto group-hover:w-8 transition-all duration-500 rounded-full mb-1" />
                    <span className="text-[10px] text-slate-300 group-hover:text-slate-500 transition-colors">
                      {brand.productCount} {t("productsFound")}
                    </span>
                  </div>

                  {/* Interactive border glow */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-500/10 rounded-2xl transition-all duration-500 pointer-events-none" />
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              {t("promoOrderOver")}
            </h3>
            <p className="text-orange-400 text-lg font-semibold">
              {t("promoFreeDelivery")}
            </p>
          </div>
          <Link
            to="/catalog"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shrink-0"
          >
            {t("shopNow")}
          </Link>
        </div>
      </section>
    </div>
  );
}
