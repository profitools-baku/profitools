import { useState } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "@/hooks/useTranslations";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { ProductCard } from "@/components/ProductCard";
import {
  Heart,
  ShoppingCart,
  BarChart3,
  Star,
  ChevronLeft,
  Plus,
  Minus,
  Truck,
  Phone,
  Check,
} from "lucide-react";
import { useSessionStore } from "@/stores/sessionStore";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ImageMagnifier({ src, alt, zoomLevel = 2.5 }: { src: string; alt: string; zoomLevel?: number }) {
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const [showMagnifier, setShowMagnifier] = useState(false);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-4"
      onMouseEnter={(e) => {
        const elem = e.currentTarget;
        const { width, height } = elem.getBoundingClientRect();
        setSize([width, height]);
        setShowMagnifier(true);
      }}
      onMouseMove={(e) => {
        const elem = e.currentTarget;
        const { top, left } = elem.getBoundingClientRect();
        const x = e.pageX - left - window.scrollX;
        const y = e.pageY - top - window.scrollY;
        setXY([x, y]);
      }}
      onMouseLeave={() => setShowMagnifier(false)}
    >
      <img src={src} alt={alt} className="max-w-full max-h-full object-contain" />

      {showMagnifier && (
        <div
          style={{
            display: showMagnifier ? "" : "none",
            position: "absolute",
            pointerEvents: "none",
            height: "100%",
            width: "100%",
            top: 0,
            left: 0,
            opacity: 1,
            border: "1px solid lightgray",
            backgroundColor: "white",
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
            backgroundPosition: `${-x * zoomLevel + 100}px ${-y * zoomLevel + 100}px`,
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const { lang } = useLanguage();
  const sessionId = useSessionStore((s) => s.sessionId);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("desc");

  const { data: product, isLoading, error } = trpc.product.bySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug, retry: false }
  );

  const { data: relatedProducts } = trpc.product.related.useQuery(
    { productId: product?.id || 0, limit: 4 },
    { enabled: !!product?.id }
  );

  const addToCart = trpc.cart.addToCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      toast.success(t("addedToCart"));
    },
  });

  const utils = trpc.useUtils();

  const { data: wishlistData } = trpc.wishlist.getWishlist.useQuery({ sessionId });
  const { data: comparisonData } = trpc.comparison.getComparison.useQuery({ sessionId });

  const isWishlisted = product ? (wishlistData?.some(w => w.productId === product.id) || false) : false;
  const isCompared = product ? (comparisonData?.some(c => c.productId === product.id) || false) : false;

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
          // Note: we might not have all product fields here perfectly matching the exact schema, but it's okay for optimistic UI
          return [...old, { id: Date.now(), productId, productSlug: product!.slug, productNameAz: product!.nameAz, productNameRu: product!.nameRu, productNameEn: product!.nameEn, productPrice: product!.price, productImage: product!.images }];
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
        return [...old, { id: Date.now(), productId, productSlug: product!.slug, productNameAz: product!.nameAz, productNameRu: product!.nameRu, productNameEn: product!.nameEn, productPrice: product!.price, productImage: product!.images, specsAz: null, specsRu: null, specsEn: null }];
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

  const handleCompareClick = () => {
    if (!product) return;
    if (isCompared) {
      const item = comparisonData?.find((c) => c.productId === product.id);
      if (item) removeFromComparison.mutate({ comparisonItemId: item.id, sessionId });
    } else {
      addToComparison.mutate({ productId: product.id, sessionId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          <div className="text-slate-400 font-medium">{t("loading")}...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {error ? (t("serverError") || "Ошибка сервера") : (t("notFound") || "Товар не найден")}
          </h2>
          <p className="text-slate-500 mb-8">
            {error ? (t("serverErrorDesc") || "Произошла ошибка при загрузке. Попробуйте позже.") : (t("productNotFoundDesc") || "Товар не найден или был перемещён.")}
          </p>
          <Link to="/catalog" className="inline-flex items-center justify-center px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
            {t("backToCatalog") || t("back")}
          </Link>
        </div>
      </div>
    );
  }

  const name = lang === "az" ? product.nameAz : product.nameRu;
  const description = lang === "az" ? product.descriptionAz : product.descriptionRu;
  const specs = lang === "az" ? product.specsAz : product.specsRu;
  const rating = parseFloat(product.rating || "4.5");
  const images = product.images || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Link to="/catalog" className="text-sm text-slate-500 hover:text-orange-600 flex items-center gap-1 mb-6">
          <ChevronLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        {/* Product main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className={`relative bg-white rounded-2xl border border-slate-200 aspect-square overflow-hidden group ${images.length > 0 ? 'cursor-zoom-in' : ''}`}>
              {images.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <ImageMagnifier 
                      src={images[activeImage]} 
                      alt={name}
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                  <svg className="w-24 h-24 text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-slate-400">Фото отсутствует</p>
                </div>
              )}
              
              {/* Badge for multiple images */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-slate-900/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                  {activeImage + 1} / {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "w-20 h-20 rounded-xl border-2 transition-all shrink-0",
                      activeImage === i 
                        ? "border-orange-500 ring-2 ring-orange-500/20 scale-105" 
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="w-full h-full bg-white flex items-center justify-center p-2 rounded-lg">
                      <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-contain" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lightbox Modal */}
          <AnimatePresence>
            {isLightboxOpen && images.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
                onClick={() => setIsLightboxOpen(false)}
              >
                <motion.button
                  className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                  onClick={() => setIsLightboxOpen(false)}
                >
                  <Plus className="w-10 h-10 rotate-45" />
                </motion.button>

                <div className="relative max-w-5xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    src={images[activeImage]}
                    alt={name}
                    className="max-w-full max-h-full object-contain shadow-2xl"
                  />

                  <button 
                    onClick={() => setActiveImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 rotate-180" />
                  </button>

                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 pb-6">
                    {images.map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          activeImage === i ? "bg-orange-500 w-6" : "bg-white/30"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">{name}</h1>
              <div className="flex gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleWishlist.mutate({ productId: product.id, sessionId })}
                  className={cn(
                    "w-10 h-10 border rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow",
                    isWishlisted 
                      ? "border-orange-200 bg-orange-50 text-orange-500" 
                      : "border-slate-200 bg-white hover:bg-red-50 hover:text-red-500"
                  )}
                >
                  <motion.div animate={isWishlisted ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                    <Heart className={cn("w-5 h-5 transition-colors duration-300", isWishlisted && "fill-orange-500")} />
                  </motion.div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompareClick}
                  className={cn(
                    "w-10 h-10 border rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow",
                    isCompared 
                      ? "border-blue-200 bg-blue-50 text-blue-500" 
                      : "border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-500"
                  )}
                >
                  <motion.div animate={isCompared ? { rotate: [0, -10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
                    <BarChart3 className={cn("w-5 h-5 transition-colors duration-300")} />
                  </motion.div>
                </motion.button>
                {isAdmin && (
                  <Link
                    to={`/admin/products/${product.id}`}
                    className="w-10 h-10 bg-orange-100 text-orange-600 border border-orange-200 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                    title="Edit Product"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Brand & SKU */}
            <div className="flex items-center gap-3 mb-3">
              {product.brand && (
                <Link
                  to={`/catalog?brand=${product.brand.id}`}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all flex items-center gap-2 shadow-sm"
                >
                  {product.brand.logoUrl && (
                    <img src={product.brand.logoUrl} alt={product.brand.name} className="h-3 w-auto object-contain" />
                  )}
                  <span>{product.brand.name}</span>
                </Link>
              )}
              <span className="text-xs text-slate-400">{t("sku")}: {product.sku}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "w-4 h-4",
                      s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600">{rating}</span>
              <span className="text-sm text-slate-400">({product.reviewCount || 0} {t("reviews")})</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-slate-900">{product.price} ₼</span>
              {product.oldPrice && (
                <span className="text-lg text-slate-400 line-through ml-3">{product.oldPrice} ₼</span>
              )}
            </div>

            {/* Availability */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center gap-1.5">
                {product.stockQuantity > 5 ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-bold">{t("inStock")}</span>
                  </>
                ) : product.stockQuantity > 0 ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-sm text-orange-600 font-bold">
                      {t("lowStock").replace("{count}", product.stockQuantity.toString())}
                    </span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600 font-bold">{t("onOrder")}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Truck className="w-4 h-4" />
                {t("trustDeliveryDesc")}
              </div>
              {product.viewsCount > 0 && (
                <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-slate-400" />
                  {product.viewsCount} {t("views") || "просмотров"}
                </div>
              )}
            </div>

            {/* Quantity & Add to cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-slate-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2.5 text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => addToCart.mutate({ productId: product.id, quantity, sessionId })}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {t("addToCart")}
              </button>
            </div>

            <button
              onClick={() => addToCart.mutate({ productId: product.id, quantity, sessionId })}
              className="w-full py-3 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg transition-colors mb-6"
            >
              {t("buyNow")}
            </button>

            {/* Contact buttons */}
            <div className="grid grid-cols-1 gap-3">
              <a
                href="tel:+994501234567"
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4" />
                {t("callNow")}
              </a>
            </div>
          </div>
        </div>

        {/* Details tabs */}
        <div className="bg-white rounded-xl border border-slate-200 mb-12">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("desc")}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "desc"
                  ? "text-orange-600 border-b-2 border-orange-500"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t("description")}
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "specs"
                  ? "text-orange-600 border-b-2 border-orange-500"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t("specifications")}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "reviews"
                  ? "text-orange-600 border-b-2 border-orange-500"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t("reviews")} ({product.reviews?.length || 0})
            </button>
          </div>
          <div className="p-6">
            {activeTab === "desc" && (
              <div className="space-y-6">
                {description ? (
                  description.split('\n\n').map((block, i) => {
                    if (block.includes('Обзор:') || block.includes('Overview:')) {
                      return (
                        <div key={i}>
                          <h3 className="text-lg font-bold text-slate-900 mb-2 border-l-4 border-orange-500 pl-3">
                            {block.split('\n')[0]}
                          </h3>
                          <p className="text-slate-600 leading-relaxed">
                            {block.split('\n').slice(1).join('\n')}
                          </p>
                        </div>
                      );
                    }
                    if (block.includes('Преимущества:') || block.includes('Benefits:')) {
                      return (
                        <div key={i}>
                          <h3 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wider text-sm">
                            {block.split('\n')[0]}
                          </h3>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {block.split('\n').slice(1).map((item, j) => (
                              <li key={j} className="flex items-start gap-2 text-slate-600">
                                <span className="text-orange-500 mt-1.5">•</span>
                                <span>{item.replace(/^- /, '')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                    if (block.includes('Технические характеристики:') || block.includes('Specifications:')) {
                      return (
                        <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
                            {block.split('\n')[0]}
                          </h3>
                          <div className="space-y-2">
                            {block.split('\n').slice(1).map((item, j) => (
                              <div key={j} className="flex justify-between border-b border-slate-200 pb-1 text-sm">
                                <span className="text-slate-500">{item.split(':')[0]}</span>
                                <span className="font-medium text-slate-800">{item.split(':')[1]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {block}
                      </p>
                    );
                  })
                ) : (
                  <p className="text-slate-400 italic">{t("noDescription") || "Описание отсутствует."}</p>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div>
                {specs && typeof specs === 'object' && Object.keys(specs).length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(specs as Record<string, string>).map(([key, value]) => (
                        <tr key={key} className="border-b border-slate-100">
                          <td className="py-2 text-slate-500 w-1/3">{key}</td>
                          <td className="py-2 text-slate-800 font-medium">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400">{t("noSpecs") || "No specifications available for this product."}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8">
                {/* Review Form */}
                <ReviewForm productId={product.id} />

                {/* Reviews List */}
                <div>
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {product.reviews.map((review: any) => (
                        <div key={review.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">{review.userName}</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={cn(
                                      "w-3 h-3",
                                      s <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed italic">
                            "{review.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Star className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">{t("noReviews")}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">{t("relatedProducts")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewForm({ productId }: { productId: number }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const utils = trpc.useUtils();

  const { data: check, isLoading: checking } = trpc.review.canReview.useQuery({ productId });
  
  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      toast.success(t("reviewPosted") || "Отзыв опубликован!");
      setComment("");
      utils.product.bySlug.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  if (checking) return null;
  if (!check?.allowed) {
    return (
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800">
        {check?.reason === "not_logged_in" ? (
          <p>{t("loginToReview") || "Пожалуйста, "} <Link to="/login" className="font-bold underline">{t("login")}</Link> {t("toLeaveReview") || "чтобы оставить отзыв."}</p>
        ) : check?.reason === "not_purchased" ? (
          <p>{t("onlyPurchasedReview") || "Оставлять отзыв могут только покупатели этого товара."}</p>
        ) : (
          <p>{t("cannotReview") || "Вы не можете оставить отзыв на этот товар."}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
      <h3 className="font-bold text-slate-900 mb-4">{t("writeReview") || "Написать отзыв"}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t("rating") || "Оценка"}</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={cn(
                    "w-6 h-6",
                    s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t("comment") || "Комментарий"}</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 min-h-[100px] text-sm"
            placeholder={t("reviewPlaceholder") || "Поделитесь впечатлениями об инструменте..."}
          />
        </div>
        <button
          onClick={() => createReview.mutate({ productId, rating, comment })}
          disabled={!comment.trim() || createReview.isPending}
          className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-lg shadow-orange-500/20"
        >
          {createReview.isPending ? (t("loading")) : (t("postReview") || "Опубликовать отзыв")}
        </button>
      </div>
    </div>
  );
}
