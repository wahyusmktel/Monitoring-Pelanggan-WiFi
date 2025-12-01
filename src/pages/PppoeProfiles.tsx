import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Settings,
  Server,
  X,
  Loader2,
} from "lucide-react";
import {
  infrastructureService,
  MikrotikProfile,
} from "@/services/infrastructureService";
import { toast } from "sonner";

const PppoeProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<MikrotikProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<MikrotikProfile | null>(
    null
  );

  // Form Data
  const [formData, setFormData] = useState<Partial<MikrotikProfile>>({
    name: "",
    local_address: "",
    remote_address: "",
    rate_limit: "",
    dns_server: "",
  });

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await infrastructureService.syncProfiles();
      toast.success("Profile berhasil disinkronisasi");
      fetchData();
    } catch (error) {
      toast.error("Gagal sinkronisasi");
    } finally {
      setSyncing(false);
    }
  };

  const handleEdit = (profile: MikrotikProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      local_address: profile.local_address || "",
      remote_address: profile.remote_address || "",
      rate_limit: profile.rate_limit || "",
      dns_server: profile.dns_server || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Yakin ingin menghapus profile ini? Data di Router juga akan terhapus."
      )
    )
      return;

    try {
      await infrastructureService.deleteProfile(id);
      toast.success("Profile berhasil dihapus");
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus profile");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingProfile && editingProfile.id) {
        // Update
        await infrastructureService.updateProfile(
          editingProfile.id,
          formData as MikrotikProfile
        );
        toast.success("Profile berhasil diperbarui");
      } else {
        // Create
        await infrastructureService.createProfile(formData as MikrotikProfile);
        toast.success("Profile berhasil dibuat");
      }

      setShowModal(false);
      fetchData();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan profile");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingProfile(null);
    setFormData({
      name: "",
      local_address: "",
      remote_address: "",
      rate_limit: "",
      dns_server: "",
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manajemen Profile PPPoE
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola paket kecepatan dan limitasi bandwidth
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Profile
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 disabled:opacity-70 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync dari Router"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nama Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rate Limit (Rx/Tx)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Local Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Remote Address
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : profiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Belum ada profile. Silakan Sync atau Tambah Baru.
                    </td>
                  </tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                        <Server className="w-4 h-4 mr-2 text-gray-400" />
                        {profile.name}
                      </td>
                      <td className="px-6 py-4">
                        {profile.rate_limit ? (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold font-mono">
                            {profile.rate_limit}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {profile.local_address || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {profile.remote_address || "-"}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(profile)}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
                          title="Edit Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(profile.id!)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Hapus Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  {editingProfile ? "Edit Profile" : "Tambah Profile Baru"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Profile *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: 10Mbps"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Local Address
                    </label>
                    <input
                      type="text"
                      value={formData.local_address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          local_address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="IP Gateway"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remote Address
                    </label>
                    <input
                      type="text"
                      value={formData.remote_address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          remote_address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="IP Pool Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate Limit (Rx/Tx)
                  </label>
                  <input
                    type="text"
                    value={formData.rate_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, rate_limit: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: 5M/10M"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: Upload/Download (ex: 2M/10M)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNS Server
                  </label>
                  <input
                    type="text"
                    value={formData.dns_server}
                    onChange={(e) =>
                      setFormData({ ...formData, dns_server: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="8.8.8.8, 1.1.1.1"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors disabled:opacity-70"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PppoeProfiles;
