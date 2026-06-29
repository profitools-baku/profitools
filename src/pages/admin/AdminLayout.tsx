import { type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Briefcase, 
  ShoppingCart, 
  Settings,
  LogOut,
  Users,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

import { useTranslation } from "@/hooks/useTranslations";

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useTranslation();
  const { user, isLoading, logout } = useAuth({ 
    redirectOnUnauthenticated: true,
    redirectPath: "/admin/login" 
  });
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="text-white">{t("loading")}</p></div>;
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">You do not have permission to access the admin panel.</p>
          <Link to="/admin/login" className="block w-full py-3 bg-orange-500 text-white font-bold rounded-xl">
            Login as Admin
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: t("adminDashboard"), href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: t("adminProducts"), href: "/admin/products", icon: <Package className="w-5 h-5" /> },
    { label: t("adminCategories"), href: "/admin/categories", icon: <Tags className="w-5 h-5" /> },
    { label: t("adminBrands"), href: "/admin/brands", icon: <Briefcase className="w-5 h-5" /> },
    { label: t("adminOrders") || "Orders", href: "/admin/orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { label: t("manageUsers") || "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <Settings className="w-6 h-6 text-orange-500" />
            <span>{t("adminDashboard")}</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                location.pathname === item.href
                  ? "bg-orange-500 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors mb-2">
            <ArrowLeft className="w-5 h-5" />
            <span>{t("back")}</span>
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>{t("logout")}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800">
            {menuItems.find(m => m.href === location.pathname)?.label || "Admin"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{t("administrator")}</span>
              <span className="text-xs text-slate-500">{t("fullAccess")}</span>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
              A
            </div>
          </div>
        </header>


        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
