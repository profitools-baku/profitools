import { Link, useNavigate } from "react-router";
import { useTranslation } from "@/hooks/useTranslations";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { useSessionStore } from "@/stores/sessionStore";
import { ShoppingCart, Minus, Plus, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const sessionId = useSessionStore((s) => s.sessionId);
  const utils = trpc.useUtils();

  const { data: cartData, isLoading } = trpc.cart.getCart.useQuery({ sessionId });

  const updateQuantity = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => utils.cart.getCart.invalidate(),
  });
  const removeItem = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      toast.success("Item removed");
    },
  });
  const clearCart = trpc.cart.clearCart.useMutation({
    onSuccess: () => utils.cart.getCart.invalidate(),
  });

  const getName = (item: any) => {
    return lang === "az" ? item.productNameAz : item.productNameRu;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-400">{t("loading")}</p></div>;
  }

  if (!cartData?.items || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">{t("emptyCart")}</h2>
          <Link to="/catalog" className="text-orange-600 hover:text-orange-700 font-medium">
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t("cart")}</h1>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-xs font-medium text-slate-500 uppercase">
            <div className="col-span-6">{t("product") || t("catalog")}</div>
            <div className="col-span-2 text-center">{t("quantity")}</div>
            <div className="col-span-2 text-right">{t("price")}</div>
            <div className="col-span-2 text-right">{t("total")}</div>
          </div>

          {/* Items */}
          {cartData.items.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-t border-slate-100 items-center">
              <div className="col-span-6 flex items-center gap-3">
                <Link to={`/product/${item.productSlug}`} className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {item.productImage?.[0] ? (
                    <img src={item.productImage[0]} alt={getName(item)} className="w-full h-full object-contain" />
                  ) : (
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </Link>
                <div className="min-w-0">
                  <Link to={`/product/${item.productSlug}`} className="text-sm font-medium text-slate-800 hover:text-orange-600 line-clamp-2">
                    {getName(item)}
                  </Link>
                  <button
                    onClick={() => removeItem.mutate({ cartItemId: item.id, sessionId })}
                    className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    {t("remove")}
                  </button>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-center">
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button
                    onClick={() => updateQuantity.mutate({ cartItemId: item.id, quantity: item.quantity - 1, sessionId })}
                    className="px-2 py-1.5 hover:bg-slate-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 py-1.5 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity.mutate({ cartItemId: item.id, quantity: item.quantity + 1, sessionId })}
                    className="px-2 py-1.5 hover:bg-slate-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="col-span-2 text-right text-sm text-slate-600">
                {item.productPrice} ₼
              </div>

              <div className="col-span-2 text-right text-sm font-semibold text-slate-900">
                {(parseFloat(item.productPrice || "0") * item.quantity).toFixed(2)} ₼
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => clearCart.mutate({ sessionId })}
              className="text-sm text-red-500 hover:text-red-700"
            >
              {t("clearAll")}
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">{t("subtotal")}</div>
                <div className="text-xl font-bold text-slate-900">{cartData.total} ₼</div>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
              >
                {t("proceedToCheckout")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
