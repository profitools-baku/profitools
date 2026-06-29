import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import AdminLayout from "./AdminLayout";
import { Link } from "react-router";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3 as BarChart,
  Eye
} from "lucide-react";

import { useTranslation } from "@/hooks/useTranslations";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data: usersData } = trpc.admin.getUsers.useQuery();
  const { data: productsData } = trpc.product.list.useQuery({ limit: 1 });
  const { data: cats } = trpc.category.list.useQuery();
  const { data: brs } = trpc.brand.list.useQuery();
  const { data: adminStats } = trpc.admin.getStats.useQuery();

  const totalViews = adminStats?.topBrands?.reduce((acc, b) => acc + (Number(b.totalViews) || 0), 0) || 0;

  const stats = [
    { 
      label: t("totalProducts"), 
      value: productsData?.total || 0, 
      icon: <Package className="w-6 h-6" />, 
      color: "bg-blue-500",
      trend: "+12%",
      trendUp: true
    },
    { 
      label: t("totalCategories"), 
      value: cats?.length || 0, 
      icon: <TrendingUp className="w-6 h-6" />, 
      color: "bg-purple-500",
      trend: "+2",
      trendUp: true
    },
    { 
      label: t("activeBrands"), 
      value: brs?.length || 0, 
      icon: <ShoppingCart className="w-6 h-6" />, 
      color: "bg-orange-500",
      trend: "Stable",
      trendUp: true
    },
    { 
      label: t("totalUsers"), 
      value: usersData?.length || 0, 
      icon: <Users className="w-6 h-6" />, 
      color: "bg-green-500",
      trend: `+${usersData?.length || 0}`,
      trendUp: true
    },
    { 
      label: t("totalViews") || "Просмотры", 
      value: totalViews, 
      icon: <Eye className="w-6 h-6" />, 
      color: "bg-cyan-500",
      trend: "Live",
      trendUp: true
    },
  ];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend}
                {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-orange-500" />
            {t("brandPopularity") || "Популярность брендов"}
          </h3>
          <div className="space-y-6">
            {adminStats?.topBrands?.map((brand, i) => {
              const maxViews = Math.max(...adminStats.topBrands.map(b => Number(b.totalViews) || 1));
              const percentage = Math.round((Number(brand.totalViews) / maxViews) * 100);
              
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700">{brand.name}</span>
                    <span className="text-xs font-medium text-slate-400">{brand.totalViews} {t("viewsShort") || "просм."}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-orange-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{t("quickActions")}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/admin/products/new" 
              className="p-4 bg-orange-50 text-orange-600 rounded-xl font-semibold hover:bg-orange-100 transition-colors border border-orange-100 text-center flex items-center justify-center"
            >
              {t("addNewProduct")}
            </Link>
            <Link 
              to="/admin/orders" 
              className="p-4 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors border border-blue-100 text-center flex items-center justify-center"
            >
              {t("exportSales")}
            </Link>
            <Link 
              to="/admin/users" 
              className="p-4 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 transition-colors border border-purple-100 text-center flex items-center justify-center"
            >
              {t("manageUsers")}
            </Link>
            <Link 
              to="/admin/settings" 
              className="p-4 bg-slate-50 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 transition-colors border border-slate-100 text-center flex items-center justify-center"
            >
              {t("siteSettings")}
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
