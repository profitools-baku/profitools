import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contacts from "./pages/Contacts";
import Delivery from "./pages/Delivery";
import Wishlist from "./pages/Wishlist";
import Comparison from "./pages/Comparison";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminEditProduct from "./pages/admin/EditProduct";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminBrands from "./pages/admin/Brands";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import AdminLogin from "./pages/admin/Login";
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";

import { Routes, Route, useLocation, Link } from "react-router";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/PageTransition";
import { Wrench } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { SplashLoader } from "./components/SplashLoader";
import { LoadingBar } from "./components/LoadingBar";
import { trpc } from "./providers/trpc";

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const { data: settingsData, isLoading: isLoadingSettings } = trpc.settings.getAll.useQuery();
  const dbMaintenanceMode = settingsData?.find(s => s.key === "maintenanceMode")?.value === "true";
  const isMaintenanceMode = dbMaintenanceMode || import.meta.env.VITE_MAINTENANCE_MODE === "true";

  if (isLoadingSettings) {
    return null;
  }

  if (isMaintenanceMode && !isAdmin && user?.role !== "admin") {
    return <Maintenance />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {isMaintenanceMode && (
        <div className="bg-orange-600 text-white text-center py-1.5 text-xs font-bold z-50 relative select-none uppercase tracking-wider">
          ⚠️ Режим техработ активен. Обычные пользователи видят заглушку
        </div>
      )}
      <SplashLoader />
      <LoadingBar />
      {!isAdmin && <Header />}
      <main className={isAdmin ? "flex-1" : "flex-1 pt-0"}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/catalog" element={<PageTransition><Catalog /></PageTransition>} />
            <Route path="/product/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/contacts" element={<PageTransition><Contacts /></PageTransition>} />
            <Route path="/delivery" element={<PageTransition><Delivery /></PageTransition>} />
            <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
            <Route path="/comparison" element={<PageTransition><Comparison /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
            <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
            <Route path="/admin/products" element={<PageTransition><AdminProducts /></PageTransition>} />
            <Route path="/admin/products/new" element={<PageTransition><AdminEditProduct /></PageTransition>} />
            <Route path="/admin/products/:id" element={<PageTransition><AdminEditProduct /></PageTransition>} />
            <Route path="/admin/categories" element={<PageTransition><AdminCategories /></PageTransition>} />
            <Route path="/admin/brands" element={<PageTransition><AdminBrands /></PageTransition>} />
            <Route path="/admin/orders" element={<PageTransition><AdminOrders /></PageTransition>} />
            <Route path="/admin/users" element={<PageTransition><AdminUsers /></PageTransition>} />
            <Route path="/admin/settings" element={<PageTransition><AdminSettings /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdmin && <Footer />}
      
      {/* Admin Link - Only for admins */}
      {!isAdmin && user?.role === "admin" && (
        <Link 
          to="/admin" 
          className="fixed bottom-6 right-6 z-[100] bg-orange-600 text-white p-3 rounded-full shadow-2xl hover:bg-orange-700 transition-all hover:scale-110 active:scale-95 group"
          title="Admin Panel"
        >
          <Wrench className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-medium whitespace-nowrap">
            Admin Panel
          </span>
        </Link>
      )}

      <Toaster position="top-center" richColors />
    </div>
  );
}
