import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import AdminLayout from "./AdminLayout";
import { 
  ArrowLeft, 
  Save, 
  Plus,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { useTranslation } from "@/hooks/useTranslations";

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const productId = id && id !== "new" ? parseInt(id) : null;
  const isEdit = productId !== null && !isNaN(productId);
  
  const { data: product, isLoading: productLoading, error: productError } = trpc.product.byId.useQuery(
    { id: productId ?? 0 },
    { enabled: isEdit }
  );

  const { data: categories } = trpc.category.list.useQuery();
  const { data: brands } = trpc.brand.list.useQuery();
  const [showUpload, setShowUpload] = useState(false);

  const [formData, setFormData] = useState<any>({
    sku: "",
    nameAz: "",
    nameRu: "",
    nameEn: "",
    price: "",
    oldPrice: "",
    stock: 0,
    stockQuantity: 0,
    categoryId: 0,
    brandId: 0,
    descriptionRu: "",
    images: [] as string[],
    isPopular: "no",
    isNew: "no",
  });

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      toast.success("Product created");
      navigate("/admin/products");
    },
    onError: (err) => toast.error(err.message)
  });

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated");
      navigate("/admin/products");
    },
    onError: (err) => toast.error(err.message)
  });

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || "",
        nameAz: product.nameAz || "",
        nameRu: product.nameRu || "",
        nameEn: product.nameEn || "",
        price: product.price || "",
        oldPrice: product.oldPrice || "",
        stock: product.stock || 0,
        stockQuantity: product.stockQuantity || 0,
        categoryId: product.categoryId || 0,
        brandId: product.brandId || 0,
        descriptionRu: product.descriptionRu || "",
        images: product.images || [],
        isPopular: product.isPopular || "no",
        isNew: product.isNew || "no",
      });
    }
  }, [product]);

  if (isEdit && productLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
        </div>
      </AdminLayout>
    );
  }

  if (isEdit && productError) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-center">
          <h3 className="font-bold text-lg mb-2">Error Loading Product</h3>
          <p>{productError.message}</p>
          <button 
            onClick={() => navigate("/admin/products")}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </AdminLayout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.brandId) {
      toast.error("Please select category and brand");
      return;
    }
    
    if (isEdit) {
      updateMutation.mutate({ ...formData, id: productId! });
    } else {
      createMutation.mutate(formData);
    }
  };


  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate("/admin/products")}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">
          {isEdit ? t("editProduct") : t("addProduct")}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">{t("basicInfo")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("productNameEn")}</label>
                <input
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("productNameRu")}</label>
                <input
                  required
                  value={formData.nameRu}
                  onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("productNameAz")}</label>
                <input
                  required
                  value={formData.nameAz}
                  onChange={(e) => setFormData({ ...formData, nameAz: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("sku")}</label>
                <input
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("stockQuantityLabel") || "Количество на складе"}</label>
                <input
                  type="number"
                  required
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">{t("pricing")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("price")} (₼)</label>
                <input
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("oldPriceLabel")} (₼)</label>
                <input
                  value={formData.oldPrice}
                  onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">{t("descriptionLabel")} (RU)</h3>
            <textarea
              rows={6}
              value={formData.descriptionRu}
              onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>
        </div>

        {/* Right Column - Organization & Images */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">{t("organization")}</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("adminCategories")}</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 bg-white"
              >
                <option value={0}>{t("selectCategory")}</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("adminBrands")}</label>
              <select
                required
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 bg-white"
              >
                <option value={0}>{t("selectBrand")}</option>
                {brands?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isPopular === "yes"}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked ? "yes" : "no" })}
                  className="w-4 h-4 text-orange-500 border-slate-300 rounded"
                />
                <span className="text-sm font-medium text-slate-700">{t("popularProduct")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isNew === "yes"}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked ? "yes" : "no" })}
                  className="w-4 h-4 text-orange-500 border-slate-300 rounded"
                />
                <span className="text-sm font-medium text-slate-700">{t("newArrival")}</span>
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">{t("adminProducts")}</h3>
            <div className="grid grid-cols-2 gap-3">
              {Array.isArray(formData.images) && formData.images.map((img: string, i: number) => (
                <div key={i} className="relative aspect-square bg-slate-50 rounded-lg border border-slate-100 overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => {
                      const newImgs = [...formData.images];
                      newImgs.splice(i, 1);
                      setFormData({ ...formData, images: newImgs });
                    }}
                    className="absolute top-1 right-1 p-1 bg-white/80 rounded-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => setShowUpload(true)}
                className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all"
              >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase">{t("addProduct")}</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isEdit ? t("updateProduct") : t("createProduct")}
          </button>
        </div>
      </form>
      
      {showUpload && (
        <ImageUpload 
          onUpload={(url) => setFormData((prev: any) => ({ ...prev, images: [...(Array.isArray(prev.images) ? prev.images : []), url] }))}
          onClose={() => setShowUpload(false)}
        />
      )}
    </AdminLayout>
  );
}
