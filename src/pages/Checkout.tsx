import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "@/hooks/useTranslations";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { useSessionStore } from "@/stores/sessionStore";
import { Check, CreditCard, Banknote, ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const sessionId = useSessionStore((s) => s.sessionId);
  const utils = trpc.useUtils();

  const { data: cartData } = trpc.cart.getCart.useQuery({ sessionId });
  const paymentMethod = "cash";
  const [formData, setFormData] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingAddress: "",
    shippingCity: "Bakı",
    shippingRegion: "",
    notes: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      utils.cart.getCart.invalidate();
      setOrderNumber(data.orderNumber);
      setOrderPlaced(true);
      toast.success(t("orderSuccess"));
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shippingName || !formData.shippingPhone || !formData.shippingAddress || !formData.shippingCity) {
      toast.error(t("fillRequiredFields") || "Пожалуйста, заполните все обязательные поля");
      return;
    }
    createOrder.mutate({
      sessionId,
      ...formData,
      paymentMethod,
    });
  };

  const getName = (item: any) => {
    return lang === "az" ? item.productNameAz : item.productNameRu;
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("orderSuccess")}</h1>
          <p className="text-sm text-slate-500 mb-2">
            {t("orderNumber")}: <span className="font-mono font-bold text-slate-800">{orderNumber}</span>
          </p>
          <p className="text-sm text-slate-500 mb-6">
            {t("orderSentToPhone")}
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    );
  }

  if (!cartData?.items || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">{t("emptyCart")}</h2>
          <Link to="/catalog" className="text-orange-600 hover:text-orange-700">{t("continueShopping")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/cart" className="text-sm text-slate-500 hover:text-orange-600 flex items-center gap-1 mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t("checkout")}</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("contactInfo")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{t("fullName")} *</label>
                  <input
                    required
                    value={formData.shippingName}
                    onChange={(e) => setFormData({ ...formData, shippingName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                    placeholder={t("fullName")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{t("phone")} *</label>
                  <input
                    required
                    value={formData.shippingPhone}
                    onChange={(e) => setFormData({ ...formData, shippingPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                    placeholder="+994 50 123 45 67"
                  />
                </div>

              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("shippingAddress")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{t("city")} *</label>
                  <input
                    required
                    value={formData.shippingCity}
                    onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{t("region")}</label>
                  <input
                    value={formData.shippingRegion}
                    onChange={(e) => setFormData({ ...formData, shippingRegion: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                    placeholder={t("region")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">{t("address")} *</label>
                  <input
                    required
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                    placeholder={t("addressPlaceholder")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">{t("orderNotes")}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">{t("paymentMethod")}</h2>
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <Banknote className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {lang === "az" ? "Çatdırılma zamanı ödəniş" : "Оплата при получении"}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 text-balance">
                    {lang === "az"
                      ? "Sifarişinizi qapıda kuryerə nağd və ya bank kartı ilə ödəyə bilərsiniz."
                      : "Вы можете оплатить заказ наличными или банковской картой курьеру при получении."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("orderSummary")}</h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cartData.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-700 truncate">{getName(item)}</div>
                      <div className="text-[10px] text-slate-400">{item.quantity} x {item.productPrice} ₼</div>
                    </div>
                    <div className="text-xs font-medium text-slate-900">
                      {(parseFloat(item.productPrice || "0") * item.quantity).toFixed(2)} ₼
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("subtotal")}</span>
                  <span className="font-medium text-slate-900">{cartData.total} ₼</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("deliveryFee")}</span>
                  <span className="font-medium text-green-600">{parseFloat(cartData.total) >= 150 ? t("freeDelivery") : "5 ₼"}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-slate-100 pt-2">
                  <span className="text-slate-900">{t("total")}</span>
                  <span className="text-orange-600">
                    {(parseFloat(cartData.total) + (parseFloat(cartData.total) >= 150 ? 0 : 5)).toFixed(2)} ₼
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={createOrder.isPending}
                className="w-full mt-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
              >
                {createOrder.isPending ? t("loading") : t("placeOrder")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
