import { useTranslation } from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";
import { useSessionStore } from "@/stores/sessionStore";
import { trpc } from "@/providers/trpc";
import { User, Package, Clock, ChevronRight, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function Profile() {
  const { t } = useTranslation();
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const sessionId = useSessionStore((s) => s.sessionId);

  const { data: orders } = trpc.order.getOrders.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-400">{t("loading")}</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t("profile")}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-orange-500" />
                )}
              </div>
              <h2 className="text-center font-semibold text-slate-900 mb-1">{user?.name || "Guest"}</h2>
              <p className="text-center text-sm text-slate-500 mb-4">{user?.email || ""}</p>

              <div className="space-y-2">
                <Link to="/cart" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-700">{t("cart")}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to="/wishlist" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-700">{t("wishlist")}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors mt-4 text-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">{t("logout") || "Logout"}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                {t("myOrders") || "Мои заказы"}
              </h2>

              {!orders || orders.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  {t("noOrders") || "Заказов пока нет"}
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border border-slate-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-800">{order.orderNumber}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          order.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                          order.status === "shipped" ? "bg-purple-100 text-purple-700" :
                          order.status === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {t(order.status) || order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">{order.totalAmount} ₼</span>
                        <span className="text-slate-400">{order.paymentMethod === "cash" ? (t("payCash") || "COD") : (t("payOnline") || "Online")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
