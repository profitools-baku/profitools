import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { Settings as SettingsIcon, Save, Globe, Phone, Mail, MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslations";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";

export default function AdminSettings() {
  const { t } = useTranslation();

  const [siteName, setSiteName] = useState("ZENDOR TOOLS");
  const [siteDescription, setSiteDescription] = useState("Premium professional tools store by ZENDOR ORIS LLC");
  const [phone, setPhone] = useState("+996 312 963 117");
  const [email, setEmail] = useState("zendororis@gmail.com");
  const [address, setAddress] = useState("Sumgait, Azerbaijan");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [showStockCount, setShowStockCount] = useState(true);

  const { data: settingsData, refetch } = trpc.settings.getAll.useQuery();

  const updateSettingsMutation = trpc.settings.updateMany.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  useEffect(() => {
    if (settingsData && settingsData.length > 0) {
      const getVal = (key: string, fallback: string) => settingsData.find(s => s.key === key)?.value ?? fallback;
      setSiteName(getVal("siteName", "ZENDOR TOOLS"));
      setSiteDescription(getVal("siteDescription", "Premium professional tools store by ZENDOR ORIS LLC"));
      setPhone(getVal("phone", "+996 312 963 117"));
      setEmail(getVal("email", "zendororis@gmail.com"));
      setAddress(getVal("address", "Sumgait, Azerbaijan"));
      setMaintenanceMode(getVal("maintenanceMode", "false") === "true");
      setAllowRegistration(getVal("allowRegistration", "true") === "true");
      setShowStockCount(getVal("showStockCount", "true") === "true");
    }
  }, [settingsData]);

  const handleSave = () => {
    updateSettingsMutation.mutate([
      { key: "siteName", value: siteName },
      { key: "siteDescription", value: siteDescription },
      { key: "phone", value: phone },
      { key: "email", value: email },
      { key: "address", value: address },
      { key: "maintenanceMode", value: maintenanceMode ? "true" : "false" },
      { key: "allowRegistration", value: allowRegistration ? "true" : "false" },
      { key: "showStockCount", value: showStockCount ? "true" : "false" },
    ]);
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
          disabled={updateSettingsMutation.isPending}
          className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {updateSettingsMutation.isPending ? "Saving..." : (t("save") || "Save Changes")}
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
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" 
                  value={siteName} 
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Site Description</label>
                <textarea 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 h-24" 
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                />
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
                <input 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
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
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-orange-500" 
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                <span className="text-sm font-medium text-slate-700">Allow Registration</span>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-orange-500" 
                  checked={allowRegistration}
                  onChange={(e) => setAllowRegistration(e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                <span className="text-sm font-medium text-slate-700">Show Stock Count</span>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-orange-500" 
                  checked={showStockCount}
                  onChange={(e) => setShowStockCount(e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

