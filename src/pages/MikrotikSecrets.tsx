import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  RefreshCw,
  Server,
  CheckCircle,
  Link as LinkIcon,
  Search,
  X,
} from "lucide-react"; // Ganti icon
import { infrastructureService } from "@/services/infrastructureService";
import { customerService, Customer } from "@/services/customerService"; // Butuh service customer
import { toast } from "sonner";

interface MikrotikSecret {
  id: string;
  name: string;
  password?: string;
  profile: string;
  local_address: string;
  remote_address: string;
  last_logged_out: string;
  disabled: boolean;
  is_synced: boolean;
}

const MikrotikSecrets: React.FC = () => {
  const [secrets, setSecrets] = useState<MikrotikSecret[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]); // State untuk list pelanggan
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Modal Mapping
  const [showModal, setShowModal] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState<MikrotikSecret | null>(
    null
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");
  const [mappingLoading, setMappingLoading] = useState(false);

  // Fetch Data (Secrets & Customers)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [secretsData, customersData] = await Promise.all([
        infrastructureService.getMikrotikSecrets(),
        customerService.getCustomers(), // Ambil semua customer untuk dropdown
      ]);

      setSecrets(secretsData);
      setCustomers(customersData);
      toast.success("Data berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Buka Modal
  const openMappingModal = (secret: MikrotikSecret) => {
    setSelectedSecret(secret);
    setSelectedCustomerId(""); // Reset pilihan
    setShowModal(true);
  };

  // Proses Mapping
  const handleMapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSecret || !selectedCustomerId) {
      toast.error("Pilih pelanggan terlebih dahulu");
      return;
    }

    setMappingLoading(true);
    try {
      await infrastructureService.mapMikrotikUser(
        Number(selectedCustomerId),
        selectedSecret.name
      );

      toast.success(`Berhasil menghubungkan ${selectedSecret.name}`);

      // Update UI lokal tanpa refresh
      setSecrets((prev) =>
        prev.map((s) =>
          s.id === selectedSecret.id ? { ...s, is_synced: true } : s
        )
      );

      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal melakukan mapping");
    } finally {
      setMappingLoading(false);
    }
  };

  const filteredSecrets = secrets.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.profile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter customer yang belum punya ID/Username (Opsional, biar gak double map)
  // Atau tampilkan semua customer biar admin bebas pilih
  const availableCustomers = customers;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manajemen PPPoE
            </h1>
            <p className="text-gray-600 mt-1">
              Mapping data Secrets MikroTik dengan Database Pelanggan
            </p>
          </div>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center text-gray-700">
              <Server className="w-5 h-5 mr-2" />
              <span className="font-medium">
                Total: {secrets.length} Secrets
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari Username / Profile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 px-3 py-1.5 border border-gray-300 rounded-md text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Username (MikroTik)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status Koneksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status Mapping
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      <div className="flex justify-center items-center">
                        <RefreshCw className="animate-spin h-5 w-5 mr-2 text-blue-500" />{" "}
                        Mengambil data dari MikroTik...
                      </div>
                    </td>
                  </tr>
                ) : filteredSecrets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredSecrets.map((secret) => (
                    <tr key={secret.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          {secret.name}
                        </span>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          Pass: {secret.password}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {secret.profile}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {secret.local_address || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {secret.disabled ? (
                          <span className="flex items-center text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded w-fit">
                            Disabled
                          </span>
                        ) : (
                          <span className="flex items-center text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded w-fit">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {secret.is_synced ? (
                          <span className="flex items-center text-green-700 text-xs font-bold border border-green-200 bg-green-100 px-2 py-1 rounded w-fit">
                            <LinkIcon className="w-3 h-3 mr-1" /> TERHUBUNG
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic border border-gray-200 bg-gray-50 px-2 py-1 rounded w-fit">
                            Belum Terhubung
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!secret.is_synced ? (
                          <button
                            onClick={() => openMappingModal(secret)}
                            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs flex items-center ml-auto transition-colors"
                            title="Hubungkan ke Pelanggan"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" /> Map Customer
                          </button>
                        ) : (
                          <button
                            disabled
                            className="text-gray-400 cursor-not-allowed text-xs flex items-center ml-auto"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Linked
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL MAPPING */}
        {showModal && selectedSecret && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <LinkIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Mapping Pelanggan
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMapSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Akun MikroTik (PPPoE)
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="font-mono font-bold text-blue-700">
                      {selectedSecret.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Profile: {selectedSecret.profile}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hubungkan ke Data Pelanggan:
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) =>
                      setSelectedCustomerId(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Pilih Pelanggan --</option>
                    {availableCustomers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {cust.name}{" "}
                        {cust.customer_number
                          ? `(ID: ${cust.customer_number})`
                          : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    *Akan mengupdate <b>Customer ID</b> di database dengan
                    username MikroTik.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={mappingLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                  >
                    {mappingLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LinkIcon className="w-4 h-4 mr-2" />
                    )}
                    Simpan Mapping
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

export default MikrotikSecrets;
