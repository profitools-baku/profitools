import { trpc } from "@/providers/trpc";
import AdminLayout from "./AdminLayout";
import { 
  Eye
} from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@db/schema";
import { useTranslation } from "@/hooks/useTranslations";

export default function AdminOrders() {
  const { t } = useTranslation();
  const { data: orders, isLoading, refetch } = trpc.order.listAll.useQuery();

  const updateStatusMutation = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(t("orderStatusUpdated"));
      refetch();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleStatusChange = (id: number, status: any) => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      case "shipped": return "bg-blue-100 text-blue-700";
      case "confirmed": return "bg-purple-100 text-purple-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("order")}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("customer")}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("date")}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("amount")}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("status")}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-8 ml-auto" /></td>
                </tr>
              ))
            ) : (
              orders?.map((order: Order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">{order.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-800">{order.shippingName}</div>
                    <div className="text-xs text-slate-500">{order.shippingPhone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">
                    {order.totalAmount} ₼
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {t(order.status as any)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="pending">{t("pending")}</option>
                        <option value="confirmed">{t("confirmed")}</option>
                        <option value="shipped">{t("shipped")}</option>
                        <option value="delivered">{t("delivered")}</option>
                        <option value="cancelled">{t("cancelled")}</option>
                      </select>
                      <button className="p-2 text-slate-400 hover:text-slate-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>

  );
}
