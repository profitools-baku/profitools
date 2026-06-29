import AdminLayout from "./AdminLayout";
import { Settings as SettingsIcon, Save, Globe, Phone, Mail, MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslations";
import { toast } from "sonner";

export default function AdminSettings() {
  const { t } = useTranslation();

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-orange-500" />
          {t("siteSettings") || "Site Settings"}
        </h2>
        <button 
          onClick={handleSave}
          className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/20"
        >
          <Save className="w-4 h-4" />
          {t("save") || "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-500" />
              General Info
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
                <input className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" defaultValue="ZENDOR TOOLS" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Site Description</label>
                <textarea className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 h-24" defaultValue="Premium professional tools store by ZENDOR ORIS LLC" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-500" />
              Contact Details
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" defaultValue="+996 312 963 117" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" defaultValue="zendororis@gmail.com" />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" defaultValue="Sumgait, Azerbaijan" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              ⚙️ System Settings
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                <span className="text-sm font-medium text-slate-700">Maintenance Mode</span>
                <input type="checkbox" className="w-5 h-5 text-orange-500" />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                <span className="text-sm font-medium text-slate-700">Allow Registration</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-orange-500" />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                <span className="text-sm font-medium text-slate-700">Show Stock Count</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-orange-500" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
