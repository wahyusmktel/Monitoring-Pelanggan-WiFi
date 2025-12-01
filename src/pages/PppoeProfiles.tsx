import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { RefreshCw, Plus, Settings, Server } from "lucide-react";
import {
  infrastructureService,
  MikrotikProfile,
} from "@/services/infrastructureService";
import { toast } from "sonner";

const PppoeProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<MikrotikProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await infrastructureService.getProfilesLocal();
      setProfiles(data);
    } catch (error) {
      toast.error("Gagal memuat data profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await infrastructureService.syncProfiles();
      toast.success("Profile berhasil disinkronisasi dari Router");
      fetchData();
    } catch (error) {
      toast.error("Gagal sinkronisasi");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manajemen Profile PPPoE
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola paket kecepatan dan limitasi dari MikroTik
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 disabled:opacity-70"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync dari Router"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rate Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Local Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Remote Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {profile.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {profile.rate_limit || "Unlimited"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {profile.local_address || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {profile.remote_address || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default PppoeProfiles;
