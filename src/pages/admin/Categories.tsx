import { trpc } from "@/providers/trpc";
import AdminLayout from "./AdminLayout";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslations";

export default function AdminCategories() {
  const { t } = useTranslation();
  const { data: categories, isLoading, refetch } = trpc.category.withProductCount.useQuery();
  
  const deleteMutation = trpc.category.delete.useMutation({
    onSuccess: () => {
      toast.success(t("categoryDeleted"));
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-800">{t("manageCategories")}</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
          <Plus className="w-4 h-4" />
          {t("addCategory")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse h-32" />
          ))
        ) : (
          categories?.map((cat) => (
            <div key={cat.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  {cat.image ? <img src={cat.image} className="w-full h-full object-cover rounded-lg" /> : <ImageIcon className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{cat.nameEn}</h3>
                  <p className="text-xs text-slate-500">{cat.productCount} {t("productsCount")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm(t("deleteCategoryConfirm"))) deleteMutation.mutate({ id: cat.id });
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
