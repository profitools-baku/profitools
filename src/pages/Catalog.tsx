import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "@/hooks/useTranslations";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { ProductCard } from "@/components/ProductCard";
import { SlidersHorizontal, X, Wrench } from "lucide-react";

export default function Catalog() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    searchParams.get("category") ? Number(searchParams.get("category")) : undefined
  );
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>(
    searchParams.get("brand") ? Number(searchParams.get("brand")) : undefined
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "newest" | "popular" | "rating" | undefined>(
    (searchParams.get("sort") as any) || undefined
  );
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: categoriesData } = trpc.category.list.useQuery();
  const { data: brandsData } = trpc.brand.list.useQuery();
  const { data: productsData, isLoading } = trpc.product.list.useQuery({
    categoryId: selectedCategory,
    brandId: selectedBrand,
    search: searchQuery || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort,
    page,
    limit: 24,
  });

  const getName = (item: any, field: string) => {
    return lang === "az" ? item[`${field}Az`] : item[`${field}Ru`];
  };

  useEffect(() => {
    setPage(1);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory.toString());
    if (selectedBrand) params.set("brand", selectedBrand.toString());
    if (searchQuery) params.set("search", searchQuery);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    setSearchParams(params);
  }, [selectedCategory, selectedBrand, searchQuery, minPrice, maxPrice, sort]);

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedBrand(undefined);
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setSort(undefined);
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory || selectedBrand || searchQuery || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb & title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t("catalog")}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {productsData?.total || 0} {t("productsFound")}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  {t("filters")}
                </h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-orange-600 hover:text-orange-700">
                    {t("reset")}
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 mb-2">{t("filterByCategory")}</h4>
                <div className="space-y-1">
                  {categoriesData?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.id
                          ? "bg-orange-50 text-orange-700 font-medium"
                          : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {getName(cat, "name")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 mb-2">{t("filterByBrand")}</h4>
                <div className="space-y-1">
                  {brandsData?.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrand(selectedBrand === brand.id ? undefined : brand.id)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-2.5 ${selectedBrand === brand.id
                          ? "bg-orange-50 text-orange-700 font-medium border border-orange-200"
                          : "text-slate-600 hover:bg-slate-50 border border-transparent"
                        }`}
                    >
                      {brand.logoUrl && (
                        <div className="w-10 h-6 flex items-center justify-center shrink-0">
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className={`max-h-full max-w-full object-contain ${brand.slug === 'king-tony' ? 'brightness-0' : ''}`}
                          />
                        </div>
                      )}
                      <span className={brand.logoUrl ? "text-slate-500 font-normal" : ""}>
                        {brand.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">{t("filterByPrice")}</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={t("from")}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder={t("to")}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Sorting & Filter toggle */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {t("filters")}
                </button>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {t("reset")}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-500 hidden sm:block whitespace-nowrap">
                  {t("sortBy")}:
                </label>
                <select
                  value={sort || ""}
                  onChange={(e) => setSort(e.target.value as any || undefined)}
                  className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="">{t("sortPopular")}</option>
                  <option value="popular">{t("sortHits")}</option>
                  <option value="rating">{t("sortRating")}</option>
                  <option value="price_asc">{t("sortPriceAsc")}</option>
                  <option value="price_desc">{t("sortPriceDesc")}</option>
                  <option value="newest">{t("sortNewest")}</option>
                </select>
              </div>
            </div>

            {/* Mobile filters */}
            {showFilters && (
              <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t("filterByCategory")}</h4>
                    <select
                      value={selectedCategory || ""}
                      onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="">{t("allProducts")}</option>
                      {categoriesData?.map((cat) => (
                        <option key={cat.id} value={cat.id}>{getName(cat, "name")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t("filterByBrand")}</h4>
                    <select
                      value={selectedBrand || ""}
                      onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="">{t("allBrands")}</option>
                      {brandsData?.map((brand) => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Products grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                    <div className="bg-slate-200 aspect-square rounded-lg mb-3" />
                    <div className="bg-slate-200 h-4 rounded mb-2" />
                    <div className="bg-slate-200 h-4 w-2/3 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {productsData?.items?.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {(!productsData?.items || productsData.items.length === 0) && (
                  <div className="text-center py-16 bg-white rounded-xl border border-slate-200 mt-4 px-4">
                    {selectedBrand ? (
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Wrench className="w-8 h-8 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                          {t("brandSoon").replace("{brand}", brandsData?.find((b: any) => b.id === selectedBrand)?.name || "")}
                        </h3>
                        <button
                          onClick={() => {
                            const brandName = brandsData?.find((b: any) => b.id === selectedBrand)?.name || "";
                            window.open(`https://wa.me/994501234567?text=${encodeURIComponent(t("leaveRequestMessage")?.replace("{brand}", brandName) || `Меня интересует инструмент ${brandName}. Сообщите когда он появится в наличии.`)}`, "_blank");
                          }}
                          className="mt-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-sm"
                        >
                          {t("leaveRequest")}
                        </button>
                        <button onClick={clearFilters} className="block w-full mt-6 text-slate-500 hover:text-slate-700 text-sm">
                          {t("reset")}
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-slate-400">{t("productsFound")} 0</p>
                        <button onClick={clearFilters} className="mt-4 text-orange-600 hover:text-orange-700 text-sm">
                          {t("reset")}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {productsData && productsData.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: productsData.totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === p
                            ? "bg-orange-500 text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-orange-300"
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
