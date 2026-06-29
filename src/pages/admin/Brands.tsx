import { trpc } from "@/providers/trpc";
import AdminLayout from "./AdminLayout";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslations";

export default function AdminBrands() {
  const { t } = useTranslation();
  const { data: brands, isLoading, refetch } = trpc.brand.withProductCount.useQuery();
  
  const updateMutation = trpc.brand.update.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteMutation = trpc.brand.delete.useMutation({
    onSuccess: () => {
      toast.success(t("brandDeleted"));
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-800">{t("manageBrands")}</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
          <Plus className="w-4 h-4" />
          {t("addBrand")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse h-32" />
          ))
        ) : (
          brands?.map((brand) => (
            <div key={brand.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-100 p-2">
                    {brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <Globe className="w-6 h-6 text-slate-300" />}
                  </div>
                  {brand.isNew === 'yes' && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                      NEW
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{brand.name}</h3>
                  <p className="text-xs text-slate-500">{brand.productCount} {t("productsCount")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const next = brand.isNew === 'yes' ? 'no' : 'yes';
                    updateMutation.mutate({ id: brand.id, isNew: next });
                  }}
                  className={`p-2 rounded-lg transition-colors ${brand.isNew === 'yes' ? 'text-orange-500 bg-orange-50 hover:bg-orange-100' : 'text-slate-400 hover:bg-slate-100'}`}
                  title={t("newArrival")}
                >
                  <Plus className={`w-4 h-4 ${brand.isNew === 'yes' ? 'rotate-45' : ''} transition-transform`} />
                </button>
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm(t("deleteBrandConfirm"))) deleteMutation.mutate({ id: brand.id });
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
