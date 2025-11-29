import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  RefreshCw,
  Server,
  CheckCircle,
  Link as LinkIcon,
  Search,
  X,
  Edit,
  UserCheck,
} from "lucide-react";
import { infrastructureService } from "@/services/infrastructureService";
import { customerService, Customer } from "@/services/customerService";
import { toast } from "sonner";

interface MikrotikSecret {
  id: string;
  name: string;
  password?: string;
  profile: string;
  local_address: string;
  remote_address: string;
  caller_id?: string;
  last_logged_out: string;
  disabled: boolean;
  is_synced: boolean;
  // Tambahan data dari backend
  connected_customer?: {
    id: number;
    name: string;
    number: string;
  } | null;
}

const MikrotikSecrets: React.FC = () => {
  const [secrets, setSecrets] = useState<MikrotikSecret[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Modal Mapping
  const [showModal, setShowModal] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState<MikrotikSecret | null>(
    null
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");
  const [mappingLoading, setMappingLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [secretsData, customersData] = await Promise.all([
        infrastructureService.getMikrotikSecrets(),
        customerService.getCustomers(),
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

  // Buka Modal (Bisa untuk Mapping Baru atau Edit Mapping)
  const openMappingModal = (secret: MikrotikSecret) => {
    setSelectedSecret(secret);
    // Jika sudah terhubung, pre-fill dropdown dengan ID pelanggan yang ada
    if (secret.connected_customer) {
      setSelectedCustomerId(secret.connected_customer.id);
    } else {
      setSelectedCustomerId("");
    }
    setShowModal(true);
  };

  const handleMapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSecret || !selectedCustomerId) {
      toast.error("Pilih pelanggan terlebih dahulu");
      return;
    }

    setMappingLoading(true);
    try {
      // Kirim seluruh object selectedSecret agar data detail (password, ip, mac) ikut tersimpan
      await infrastructureService.mapMikrotikUser(
        Number(selectedCustomerId),
        selectedSecret
      );

      toast.success(`Berhasil menghubungkan ${selectedSecret.name}`);

      // Cari nama customer yang baru dipilih untuk update UI lokal
      const selectedCust = customers.find(
        (c) => c.id === Number(selectedCustomerId)
      );

      // Update UI lokal (Optimistic Update)
      setSecrets((prev) =>
        prev.map((s) =>
          s.id === selectedSecret.id
            ? {
                ...s,
                is_synced: true,
                connected_customer: selectedCust
                  ? {
                      id: selectedCust.id!,
                      name: selectedCust.name,
                      number: selectedCust.customer_number || "",
                    }
                  : s.connected_customer,
              }
            : s
        )
      );

      // Refresh data customer juga agar dropdown terupdate status pppoe-nya
      const updatedCustomers = await customerService.getCustomers();
      setCustomers(updatedCustomers);

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
      s.profile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.connected_customer &&
        s.connected_customer.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  // Filter customer untuk Dropdown:
  // 1. Customer yang belum punya akun PPPoE (pppoe_account == null)
  // 2. ATAU Customer yang sedang terhubung dengan secret ini (untuk kasus edit mapping)
  const availableCustomers = customers.filter((cust) => {
    // KONDISI 1: Jika sedang EDIT MAPPING (Data sudah synced),
    // Tampilkan SEMUA pelanggan. Ini memberikan fleksibilitas jika admin
    // ingin memindahkan akun ke pelanggan lain (misal karena salah input sebelumnya).
    if (selectedSecret?.is_synced) {
      return true;
    }

    // KONDISI 2: Jika MAPPING BARU,
    // Sembunyikan pelanggan yang SUDAH punya akun PPPoE agar data tidak ganda.
    // (Casting ke any untuk akses properti pppoe_account dari API)
    const hasAccount =
      (cust as any).pppoe_account !== null &&
      (cust as any).pppoe_account !== undefined;

    return !hasAccount;
  });

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
                placeholder="Cari Username, Profile, Pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 px-3 py-1.5 border border-gray-300 rounded-md text-sm w-72 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pelanggan Terhubung
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
                          <span className="flex items-center text-red-600 text-xs font-medium">
                            Disabled
                          </span>
                        ) : (
                          <span className="flex items-center text-green-600 text-xs font-medium">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {secret.is_synced && secret.connected_customer ? (
                          <div className="flex items-center">
                            <UserCheck className="w-4 h-4 text-green-600 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {secret.connected_customer.name}
                              </div>
                              {/* <div className="text-xs text-gray-500">ID: {secret.connected_customer.number}</div> */}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic px-2 py-1 rounded border border-dashed border-gray-300">
                            Belum Terhubung
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openMappingModal(secret)}
                          className={`px-3 py-1.5 rounded text-xs flex items-center ml-auto transition-colors ${
                            secret.is_synced
                              ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                              : "text-white bg-blue-600 hover:bg-blue-700"
                          }`}
                          title={
                            secret.is_synced
                              ? "Edit Mapping"
                              : "Hubungkan ke Pelanggan"
                          }
                        >
                          {secret.is_synced ? (
                            <Edit className="w-3 h-3 mr-1" />
                          ) : (
                            <LinkIcon className="w-3 h-3 mr-1" />
                          )}
                          {secret.is_synced ? "Edit" : "Map"}
                        </button>
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
                  {selectedSecret.is_synced
                    ? "Edit Mapping Pelanggan"
                    : "Mapping Pelanggan Baru"}
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
                    {selectedSecret.is_synced
                      ? "Ganti ke Pelanggan Lain:"
                      : "Hubungkan ke Pelanggan:"}
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
                  {selectedSecret.is_synced && (
                    <p className="text-xs text-yellow-600 mt-2 flex items-start">
                      <span className="mr-1">⚠️</span>
                      Perhatian: Akun ini akan dipindahkan kepemilikannya dari
                      pelanggan lama ke pelanggan yang Anda pilih di atas.
                    </p>
                  )}
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
                    Simpan Perubahan
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
