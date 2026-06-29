import { Link } from "react-router";
import { useTranslation } from "@/hooks/useTranslations";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { useSessionStore } from "@/stores/sessionStore";
import { Heart, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";

export default function Wishlist() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const sessionId = useSessionStore((s) => s.sessionId);
  const utils = trpc.useUtils();

  const { data: wishlist, isLoading } = trpc.wishlist.getWishlist.useQuery({ sessionId });
  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onMutate: async ({ productId }) => {
      await utils.wishlist.getWishlist.cancel({ sessionId });
      const previous = utils.wishlist.getWishlist.getData({ sessionId });
      utils.wishlist.getWishlist.setData({ sessionId }, (old) => {
        if (!old) return [];
        return old.filter((w) => w.productId !== productId);
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      utils.wishlist.getWishlist.setData({ sessionId }, context?.previous);
      toast.error(t("error") || "Произошла ошибка");
    },
    onSettled: () => {
      utils.wishlist.getWishlist.invalidate({ sessionId });
      toast.success(t("removedFromWishlist") || "Удалено из избранного");
    },
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

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-400">{t("loading")}</p></div>;
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">{t("emptyWishlist")}</h2>
          <Link to="/catalog" className="text-orange-600 hover:text-orange-700 font-medium">{t("continueShopping")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t("wishlist")}</h1>

        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {wishlist.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <Link to={`/product/${item.productSlug}`} className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {item.productImage?.[0] ? (
                  <img src={item.productImage[0]} alt={getName(item)} className="w-full h-full object-contain" />
                ) : (
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.productSlug}`} className="text-sm font-medium text-slate-800 hover:text-orange-600 line-clamp-1">
                  {getName(item)}
                </Link>
                <p className="text-sm font-bold text-orange-600 mt-1">{item.productPrice} ₼</p>
              </div>
              <button
                onClick={() => addToCart.mutate({ productId: item.productId, quantity: 1, sessionId })}
                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button
                onClick={() => toggleWishlist.mutate({ productId: item.productId, sessionId })}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
