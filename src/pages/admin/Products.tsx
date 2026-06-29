import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "./AdminLayout";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

import { useTranslation } from "@/hooks/useTranslations";

export default function AdminProducts() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  
  const { data, isLoading, refetch } = trpc.product.list.useQuery({ 
    page, 
    limit: 10,
    search: search || undefined
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      toast.success(t("productDeleted"));
      setDeleteId(null);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("searchProducts")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            {t("filters")}
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            {t("addProduct")}
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("adminProducts")}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("sku")}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("price")}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("stock")}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("availability")}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-12" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-8 ml-auto" /></td>
                </tr>
              ))
            ) : (
              data?.items.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">
                          {product.nameEn}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{product.nameRu}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{product.sku}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{product.price} ₼</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 0 ? t('inStock') : t('outOfStock')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/product/${product.slug}`}
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/admin/products/${product.id}`}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => setDeleteId(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {t("showing")} <span className="font-medium">{(page-1)*10 + 1}</span> {t("to")} <span className="font-medium">{(page-1)*10 + (data?.items.length || 0)}</span> {t("of")} <span className="font-medium">{data?.total || 0}</span> {t("results")}
          </div>

          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={page >= (data?.totalPages || 1)}
              onClick={() => setPage(p => p + 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Delete Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{t("deleteProduct")}</h3>
              <p className="text-slate-500 mb-8">{t("confirmDelete")}</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {t("back") || "Назад"}
                </button>
                <button 
                  onClick={() => deleteMutation.mutate({ id: deleteId })}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? t("checking") : (t("remove") || "Удалить")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
