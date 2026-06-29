import { Link } from "react-router";
import { useTranslation } from "@/hooks/useTranslations";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { useSessionStore } from "@/stores/sessionStore";
import { BarChart3, X, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function Comparison() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const sessionId = useSessionStore((s) => s.sessionId);
  const utils = trpc.useUtils();

  const { data: comparison, isLoading } = trpc.comparison.getComparison.useQuery({ sessionId });
  const removeItem = trpc.comparison.remove.useMutation({
    onMutate: async ({ comparisonItemId }) => {
      await utils.comparison.getComparison.cancel({ sessionId });
      const previous = utils.comparison.getComparison.getData({ sessionId });
      utils.comparison.getComparison.setData({ sessionId }, (old) => {
        if (!old) return [];
        return old.filter(c => c.id !== comparisonItemId);
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      utils.comparison.getComparison.setData({ sessionId }, context?.previous);
      toast.error(t("error") || "Произошла ошибка");
    },
    onSettled: () => {
      utils.comparison.getComparison.invalidate({ sessionId });
      toast.success(t("removedFromComparison") || "Удалено из сравнения");
    },
  });
  const clearAll = trpc.comparison.clear.useMutation({
    onSuccess: () => utils.comparison.getComparison.invalidate(),
  });
  const addToCart = trpc.cart.addToCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      toast.success(t("addedToCart"));
    },
  });

  const getName = (item: any) => {
    return lang === "az" ? item.productNameAz : item.productNameRu;
  };
  const getSpecs = (item: any) => {
    return lang === "az" ? item.specsAz : item.specsRu;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-400">{t("loading")}</p></div>;
  }

  if (!comparison || comparison.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">{t("emptyComparison")}</h2>
          <Link to="/catalog" className="text-orange-600 hover:text-orange-700 font-medium">{t("continueShopping")}</Link>
        </div>
      </div>
    );
  }

  const allSpecKeys = new Set<string>();
  comparison.forEach((item) => {
    const specs = getSpecs(item) || {};
    Object.keys(specs).forEach((k) => allSpecKeys.add(k));
  });

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t("comparison")}</h1>
          <button onClick={() => clearAll.mutate({ sessionId })} className="text-sm text-red-500 hover:text-red-700">
            {t("clearAll")}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <tbody>
              {/* Product names */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-sm font-medium text-slate-500 w-32">{t("catalog")}</td>
                {comparison.map((item) => (
                  <td key={item.id} className="p-4 text-center">
                    <Link to={`/product/${item.productSlug}`} className="text-sm font-semibold text-slate-800 hover:text-orange-600 line-clamp-2">
                      {getName(item)}
                    </Link>
                  </td>
                ))}
              </tr>

              {/* Images */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-sm text-slate-500"></td>
                {comparison.map((item) => (
                  <td key={item.id} className="p-4 text-center">
                    <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center mx-auto overflow-hidden">
                      {item.productImage?.[0] ? (
                        <img src={item.productImage[0]} alt={getName(item)} className="w-full h-full object-contain" />
                      ) : (
                        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-sm text-slate-500">{t("price")}</td>
                {comparison.map((item) => (
                  <td key={item.id} className="p-4 text-center">
                    <span className="text-lg font-bold text-orange-600">{item.productPrice} ₼</span>
                  </td>
                ))}
              </tr>

              {/* Specs */}
              {Array.from(allSpecKeys).map((key) => (
                <tr key={key} className="border-b border-slate-100">
                  <td className="p-4 text-sm text-slate-500">{key}</td>
                  {comparison.map((item) => {
                    const specs = getSpecs(item) || {};
                    return (
                      <td key={item.id} className="p-4 text-center text-sm text-slate-800">
                        {specs[key] || "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Actions */}
              <tr>
                <td className="p-4"></td>
                {comparison.map((item) => (
                  <td key={item.id} className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => addToCart.mutate({ productId: item.productId, quantity: 1, sessionId })}
                        className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removeItem.mutate({ comparisonItemId: item.id, sessionId })}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
