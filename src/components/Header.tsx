import { Link, useNavigate } from "react-router";
import { useState } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  Phone,
  Wrench,
  BarChart3,
  User,
  LogOut,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslations";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useSessionStore } from "@/stores/sessionStore";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { initLanguage } from "@/lib/i18n";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

initLanguage();

const NAV_ITEMS = [
  { key: "catalog", href: "/catalog" },
  { key: "about", href: "/about" },
  { key: "contacts", href: "/contacts" },
  { key: "delivery", href: "/delivery" },
];

import { motion, AnimatePresence } from "framer-motion";
import { ZendorLogo } from "./ZendorLogo";

export function Header() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const sessionId = useSessionStore((s) => s.sessionId);
  const { isAuthenticated, logout } = useAuth();

  const { data: cartData } = trpc.cart.getCart.useQuery(
    { sessionId },
    { refetchInterval: 3000 }
  );
  const { data: wishlistData } = trpc.wishlist.getWishlist.useQuery(
    { sessionId },
    { refetchInterval: 5000 }
  );
  const { data: comparisonData } = trpc.comparison.getComparison.useQuery(
    { sessionId },
    { refetchInterval: 5000 }
  );

  const cartCount = cartData?.count || 0;
  const wishlistCount = wishlistData?.length || 0;
  const comparisonCount = comparisonData?.length || 0;

  const { data: searchResultsData, isLoading: isSearching } = trpc.product.search.useQuery(
    { query: debouncedSearchQuery },
    { enabled: debouncedSearchQuery.length >= 2 }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchResults = searchResultsData || [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
      setSearchFocused(false);
    }
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  return (
    <header className="w-full bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      {/* Top bar */}
      <div className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-end text-xs">
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <ZendorLogo size="sm" animate={true} />
          <div className="leading-tight">
            <div className="text-lg font-extrabold tracking-tight text-white flex items-center">
              ZENDOR<span className="text-orange-500 ml-1">TOOLS</span>
            </div>
            <motion.div 
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1, x: 2 }}
              className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold"
            >
              Azerbaijan
            </motion.div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className="relative text-sm font-medium text-slate-300 hover:text-orange-400 transition-colors group"
            >
              {t(item.key)}
              <motion.span 
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"
              />
            </Link>
          ))}
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <motion.div 
              animate={{ width: searchFocused ? "100%" : "100%" }}
              className="relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
              />
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300",
                searchFocused ? "text-orange-500" : "text-slate-500"
              )} />
            </motion.div>
          </form>
          <AnimatePresence>
            {searchFocused && searchQuery.length >= 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto"
              >
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-slate-400 italic">
                    {t("loading")}...
                  </div>
                ) : searchResultsData && searchResultsData.length > 0 ? (
                  <div className="py-2">
                    {searchResultsData.map((p: any) => (
                      <button
                        key={p.id}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur before navigation
                          navigate(`/product/${p.slug}`);
                          setSearchQuery("");
                          setSearchFocused(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group border-b border-slate-50 last:border-0"
                      >
                        <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-orange-200 transition-colors">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="w-full h-full object-contain p-1" />
                          ) : (
                            <Wrench className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate group-hover:text-orange-600 transition-colors">
                            {lang === "az" ? p.nameAz : p.nameRu}
                          </div>
                          <div className="text-xs text-orange-600 font-bold mt-0.5">{p.price} ₼</div>
                        </div>
                      </button>
                    ))}
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSearchSubmit(e as any);
                      }}
                      className="w-full py-2.5 bg-slate-50 text-xs font-bold text-slate-500 hover:text-orange-600 text-center transition-colors uppercase tracking-wider"
                    >
                      {t("viewAll")} →
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <div className="text-sm text-slate-400 font-medium">Товары не найдены</div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            <Search className="w-5 h-5" />
          </motion.button>
          
          <Link to="/comparison" className="hidden md:flex p-2 text-slate-300 hover:text-white transition-colors relative group">
            <motion.div whileHover={{ rotate: 10 }}><BarChart3 className="w-5 h-5" /></motion.div>
            <AnimatePresence>
              {comparisonCount > 0 && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                >
                  {comparisonCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          <Link to="/wishlist" className="p-2 text-slate-300 hover:text-white transition-colors relative group">
            <motion.div whileHover={{ scale: 1.1 }}><Heart className="w-5 h-5" /></motion.div>
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          <Link to="/cart" className="p-2 text-slate-300 hover:text-white transition-colors relative group">
            <motion.div whileHover={{ scale: 1.1 }}><ShoppingCart className="w-5 h-5" /></motion.div>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          {/* 
          <Link to={isAuthenticated ? "/profile" : "/login"} className="p-2 text-slate-300 hover:text-white transition-colors group">
            <motion.div whileHover={{ y: -2 }}><User className="w-5 h-5" /></motion.div>
          </Link>
          */}
          
          {isAuthenticated && (
            <motion.button
              whileHover={{ scale: 1.1, color: "#f87171" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="p-2 text-slate-300 transition-colors"
              title={t("logout")}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden px-4 pb-3 overflow-hidden"
          >
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </form>
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  {searchResults.slice(0, 5).map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        navigate(`/product/${p.slug}`);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0"
                    >
                      <div className="w-8 h-8 bg-slate-50 rounded flex items-center justify-center shrink-0 overflow-hidden">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <Wrench className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-800 truncate">{lang === "az" ? p.nameAz : p.nameRu}</div>
                        <div className="text-[10px] text-orange-600 font-bold">{p.price} ₼</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-slate-800 border-t border-slate-700 overflow-hidden"
          >
            <nav className="px-4 py-3 flex flex-col gap-2">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className="block py-2 text-sm text-slate-300 hover:text-orange-400 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(item.key)}
                  </Link>
                </motion.div>
              ))}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="border-t border-slate-700 pt-2 mt-2 flex flex-col gap-2"
              >
                <Link to="/comparison" className="py-2 text-sm text-slate-300 hover:text-orange-400" onClick={() => setMobileMenuOpen(false)}>
                  {t("comparison")} {comparisonCount > 0 && `(${comparisonCount})`}
                </Link>
                <Link to="/wishlist" className="py-2 text-sm text-slate-300 hover:text-orange-400" onClick={() => setMobileMenuOpen(false)}>
                  {t("wishlist")}
                </Link>
                <Link to="/cart" className="py-2 text-sm text-slate-300 hover:text-orange-400" onClick={() => setMobileMenuOpen(false)}>
                  {t("cart")} {cartCount > 0 && `(${cartCount})`}
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
