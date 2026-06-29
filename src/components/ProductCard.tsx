import { Link } from "react-router";
import { Heart, ShoppingCart, BarChart3, Star, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslations";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { useSessionStore } from "@/stores/sessionStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Edit } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: {
    id: number;
    slug: string;
    nameAz: string;
    nameRu: string;
    nameEn: string;
    descriptionAz?: string | null;
    descriptionRu?: string | null;
    descriptionEn?: string | null;
    price: string;
    oldPrice?: string | null;
    images?: string[] | null;
    categoryId: number;
    categoryNameAz?: string | null;
    categoryNameRu?: string | null;
    categoryNameEn?: string | null;
    brandId: number;
    brandName?: string | null;
    brandLogoUrl?: string | null;
    rating?: string;
    reviewCount?: number;
    stockQuantity?: number;
    isPopular?: string;
    isNew?: string;
  };
  variant?: "default" | "compact";
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { isAdmin } = useAuth();
  const sessionId = useSessionStore((s) => s.sessionId);
  const utils = trpc.useUtils();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const addToCart = trpc.cart.addToCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      toast.success(t("addedToCart"));
    },
  });

  const { data: wishlistData } = trpc.wishlist.getWishlist.useQuery({ sessionId });
  const { data: comparisonData } = trpc.comparison.getComparison.useQuery({ sessionId });

  const isWishlisted = wishlistData?.some((w) => w.productId === product.id) || false;
  const isCompared = comparisonData?.some((c) => c.productId === product.id) || false;

  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onMutate: async ({ productId }) => {
      await utils.wishlist.getWishlist.cancel({ sessionId });
      const previousWishlist = utils.wishlist.getWishlist.getData({ sessionId });
      let isRemoving = false;
      
      utils.wishlist.getWishlist.setData({ sessionId }, (old) => {
        if (!old) return [];
        const exists = old.some((w) => w.productId === productId);
        if (exists) {
          isRemoving = true;
          return old.filter((w) => w.productId !== productId);
        } else {
          return [...old, { id: Date.now(), productId, productSlug: product.slug, productNameAz: product.nameAz, productNameRu: product.nameRu, productNameEn: product.nameEn, productPrice: product.price, productImage: product.images }];
        }
      });
      return { previousWishlist, isRemoving };
    },
    onError: (err, newTodo, context) => {
      utils.wishlist.getWishlist.setData({ sessionId }, context?.previousWishlist);
      toast.error(t("error") || "Произошла ошибка");
    },
    onSettled: (data, error, variables, context) => {
      utils.wishlist.getWishlist.invalidate({ sessionId });
      if (!error) {
        if (!context?.isRemoving) {
          toast.success(t("addedToWishlist") || "Товар добавлен в избранное");
        }
      }
    },
  });

  const addToComparison = trpc.comparison.add.useMutation({
    onMutate: async ({ productId }) => {
      await utils.comparison.getComparison.cancel({ sessionId });
      const previous = utils.comparison.getComparison.getData({ sessionId });
      utils.comparison.getComparison.setData({ sessionId }, (old) => {
        if (!old) return [];
        if (old.length >= 4) return old;
        if (old.some(c => c.productId === productId)) return old;
        return [...old, { id: Date.now(), productId, productSlug: product.slug, productNameAz: product.nameAz, productNameRu: product.nameRu, productNameEn: product.nameEn, productPrice: product.price, productImage: product.images, specsAz: null, specsRu: null, specsEn: null }];
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      utils.comparison.getComparison.setData({ sessionId }, context?.previous);
      toast.error(err.message || t("error"));
    },
    onSettled: (data, error) => {
      utils.comparison.getComparison.invalidate({ sessionId });
      if (!error && data?.success !== false) {
        toast.success(t("addedToComparison") || "Добавлено к сравнению");
      } else if (data?.success === false) {
        toast.error(data.message || "Ошибка");
      }
    },
  });

  const removeFromComparison = trpc.comparison.remove.useMutation({
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
    },
  });

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      const item = comparisonData?.find((c) => c.productId === product.id);
      if (item) removeFromComparison.mutate({ comparisonItemId: item.id, sessionId });
    } else {
      addToComparison.mutate({ productId: product.id, sessionId });
    }
  };

  const deleteProduct = trpc.product.delete.useMutation({
    onSuccess: () => {
      toast.success(t("productDeleted"));
      utils.product.list.invalidate();
      setShowDeleteConfirm(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const name = lang === "az" ? product.nameAz : product.nameRu;
  const rating = parseFloat(product.rating || "4.5");

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
        className="group bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 flex flex-col h-full"
      >
        {/* Image area */}
        <div className="relative bg-slate-50 aspect-square flex items-center justify-center overflow-hidden">
          <Link to={`/product/${product.slug}`} className="absolute inset-0 z-0 flex items-center justify-center">
            {product.images?.[0] ? (
              <motion.img
                src={product.images[0]}
                alt={name}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </Link>
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {product.isPopular === "yes" && (
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm"
              >
                {t("badgePopular")}
              </motion.span>
            )}
            {product.isNew === "yes" && (
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm"
              >
                {t("badgeNew")}
              </motion.span>
            )}
          </div>
          {/* Quick actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist.mutate({ productId: product.id, sessionId });
              }}
              className={cn(
                "w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-300",
                isWishlisted 
                  ? "bg-orange-50 text-orange-500" 
                  : "bg-white hover:bg-red-50 hover:text-red-500"
              )}
            >
              <motion.div animate={isWishlisted ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                <Heart className={cn("w-4 h-4 transition-colors duration-300", isWishlisted && "fill-orange-500")} />
              </motion.div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.8 }}
              onClick={handleCompareClick}
              className={cn(
                "w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-300",
                isCompared 
                  ? "bg-blue-50 text-blue-500" 
                  : "bg-white hover:bg-blue-50 hover:text-blue-500"
              )}
            >
              <motion.div animate={isCompared ? { rotate: [0, -10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
                <BarChart3 className={cn("w-4 h-4 transition-colors duration-300")} />
              </motion.div>
            </motion.button>
            {isAdmin && (
              <>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link
                    to={`/admin/products/${product.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="w-8 h-8 bg-orange-500 text-white rounded-full shadow-md flex items-center justify-center hover:bg-orange-600 transition-colors"
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="w-8 h-8 bg-red-500 text-white rounded-full shadow-md flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          <Link to={`/product/${product.slug}`} className="flex-1">
            {/* Category */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider">
                {lang === "az" ? product.categoryNameAz : product.categoryNameRu}
              </div>
              {product.brandLogoUrl && (
                <img 
                  src={product.brandLogoUrl} 
                  alt={product.brandName || ""} 
                  className="h-4 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity" 
                />
              )}
            </div>
            
            <h3 className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-orange-600 transition-colors min-h-[2.5rem]">
              {name}
            </h3>

            {/* Short Description */}
            <div className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2rem]">
              {lang === "az" ? product.descriptionAz : product.descriptionRu}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "w-3 h-3 transition-colors duration-300",
                      s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">({product.reviewCount || 0})</span>
            </div>
          </Link>

          {/* Price and actions */}
          <div className="mt-2.5 pt-2 border-t border-slate-100">
            <div className="mb-2">
              {product.stockQuantity! > 5 ? (
                <span className="text-[10px] text-green-600 font-bold">{t("inStock")}</span>
              ) : product.stockQuantity! > 0 ? (
                <span className="text-[10px] text-orange-500 font-bold">
                  {t("lowStock").replace("{count}", product.stockQuantity!.toString())}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-bold">{t("onOrder")}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-slate-900">{product.price} ₼</span>
                {product.oldPrice && (
                  <span className="text-xs text-slate-400 line-through ml-2">{product.oldPrice} ₼</span>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart.mutate({ productId: product.id, quantity: 1, sessionId })}
              className="mt-2 w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {t("addToCart")}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{t("deleteProduct")}</h3>
                <p className="text-slate-500 mb-8">{t("confirmDelete")}</p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    {t("back") || "Назад"}
                  </button>
                  <button 
                    onClick={() => deleteProduct.mutate({ id: product.id })}
                    disabled={deleteProduct.isPending}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
                  >
                    {deleteProduct.isPending ? t("checking") : (t("remove") || "Удалить")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
