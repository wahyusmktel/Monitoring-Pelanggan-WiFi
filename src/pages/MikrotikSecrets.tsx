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
  Database,
} from "lucide-react";
import { infrastructureService } from "@/services/infrastructureService";
import { customerService, Customer } from "@/services/customerService";
import { toast } from "sonner";

interface PppoeAccount {
  id: number;
  username: string;
  password?: string;
  profile: string;
  local_address: string | null;
  remote_address: string | null;
  caller_id?: string | null;
  customer_id: number | null;
  updated_at: string;
  // Relasi dari backend
  customer?: {
    id: number;
    name: string;
    customer_number: string;
  } | null;
}

const MikrotikSecrets: React.FC = () => {
  const [accounts, setAccounts] = useState<PppoeAccount[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 data per halaman
  const [filterSyncStatus, setFilterSyncStatus] = useState<
    "all" | "synced" | "unsynced"
  >("all");

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PppoeAccount | null>(
    null
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");
  const [mappingLoading, setMappingLoading] = useState(false);

  // 1. Fetch Data dari DATABASE LOKAL
  const fetchData = async () => {
    setLoading(true);
    try {
      const [accountsData, customersData] = await Promise.all([
        infrastructureService.getMikrotikSecrets(),
        customerService.getCustomers(),
      ]);

      setAccounts(accountsData);
      setCustomers(customersData);
    } catch (error) {
      toast.error("Gagal mengambil data database");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fungsi Sync (Tarik dari MikroTik)
  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading(
      "Sinkronisasi dengan MikroTik sedang berjalan..."
    );

    try {
      const result = await infrastructureService.syncMikrotikData();

      // AMBIL TOTAL DARI RESPONSE BACKEND
      const totalData = result.total || 0;

      // TAMPILKAN ALERT SESUAI REQUEST
      toast.success(`Berhasil sync ${totalData} data dari router`, {
        id: toastId,
      });

      fetchData(); // Refresh tampilan setelah sync selesai
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal sinkronisasi", {
        id: toastId,
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openMappingModal = (account: PppoeAccount) => {
    setSelectedAccount(account);
    if (account.customer) {
      setSelectedCustomerId(account.customer.id);
    } else {
      setSelectedCustomerId("");
    }
    setShowModal(true);
  };

  const handleMapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // GANTI selectedSecret JADI selectedAccount
    if (!selectedAccount || !selectedCustomerId) {
      toast.error("Pilih pelanggan terlebih dahulu");
      return;
    }

    setMappingLoading(true);
    try {
      await infrastructureService.mapMikrotikUser(Number(selectedCustomerId), {
        name: selectedAccount.username, // GANTI selectedSecret JADI selectedAccount
        ...selectedAccount, // GANTI selectedSecret JADI selectedAccount
      });

      toast.success(`Berhasil update mapping ${selectedAccount.username}`);
      fetchData();
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal update mapping");
    } finally {
      setMappingLoading(false);
    }
  };

  // --- LOGIKA FILTER ---
  const filteredAccounts = accounts.filter((acc) => {
    // 1. Filter Search
    const matchesSearch =
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.profile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.customer &&
        acc.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Filter Status Mapping (Baru)
    const matchesSync =
      filterSyncStatus === "all" ||
      (filterSyncStatus === "synced" && acc.customer) ||
      (filterSyncStatus === "unsynced" && !acc.customer);

    return matchesSearch && matchesSync;
  });

  // --- LOGIKA PAGINASI ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccounts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  // --- LOGIKA FILTER PELANGGAN ---
  // Filter customer untuk Dropdown
  const availableCustomers = customers.filter((cust) => {
    // LOGIKA:
    // Jika akun PPPoE yang sedang dipilih (selectedAccount) SUDAH punya pemilik (customer != null),
    // Berarti kita sedang dalam mode EDIT MAPPING (memperbaiki kesalahan).
    // Maka TAMPILKAN SEMUA pelanggan, supaya admin bisa memindahkan akun ini ke siapa saja.
    if (selectedAccount?.customer) {
      return true;
    }

    // Jika akun PPPoE ini BELUM punya pemilik (Jomblo/Mapping Baru),
    // Hanya tampilkan pelanggan yang juga "Jomblo" (belum punya akun PPPoE).
    // Agar data tidak tumpang tindih dari awal.
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
              Data Akun PPPoE (Database Lokal)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Sedang Sync..." : "Sync dari Router"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center text-gray-700">
              <Database className="w-5 h-5 mr-2" />
              <span className="font-medium">Total: {accounts.length} Akun</span>
            </div>
            <div className="flex space-x-2">
              {/* --- DROPDOWN FILTER BARU --- */}
              <select
                value={filterSyncStatus}
                onChange={(e) => {
                  setFilterSyncStatus(e.target.value as any);
                  setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="synced">Sudah Terhubung</option>
                <option value="unsynced">Belum Terhubung</option>
              </select>
              {/* ---------------------------- */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari Username, Pelanggan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 px-3 py-1.5 border border-gray-300 rounded-md text-sm w-72 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Terakhir Sync
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
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Memuat data database...
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Data kosong. Silakan Sync dari Router.
                    </td>
                  </tr>
                ) : (
                  currentItems.map(
                    (
                      acc // Gunakan currentItems hasil paginasi
                    ) => (
                      <tr key={acc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">
                            {acc.username}
                          </span>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">
                            Pass: {acc.password || "****"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {acc.profile}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {acc.remote_address || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {acc.customer ? (
                            <div className="flex items-center">
                              <UserCheck className="w-4 h-4 text-green-600 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {acc.customer.name}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic px-2 py-1 rounded border border-dashed border-gray-300">
                              Belum Terhubung
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {new Date(acc.updated_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(acc.updated_at).toLocaleTimeString(
                                "id-ID",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openMappingModal(acc)}
                            className={`px-3 py-1.5 rounded text-xs flex items-center ml-auto transition-colors ${
                              acc.customer
                                ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                                : "text-white bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {acc.customer ? (
                              <Edit className="w-3 h-3 mr-1" />
                            ) : (
                              <LinkIcon className="w-3 h-3 mr-1" />
                            )}
                            {acc.customer ? "Edit" : "Map"}
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
          {/* --- KONTROL PAGINASI --- */}
          {filteredAccounts.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <span className="text-sm text-gray-700">
                Menampilkan{" "}
                <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                sampai{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredAccounts.length)}
                </span>{" "}
                dari{" "}
                <span className="font-medium">{filteredAccounts.length}</span>{" "}
                data
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-white transition-colors"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  Hal {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-white transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
          {/* ------------------------ */}
        </div>

        {/* MODAL MAPPING */}
        {showModal && selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <LinkIcon className="w-5 h-5 mr-2 text-blue-600" />
                  {selectedAccount.customer
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
                    Akun PPPoE
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="font-mono font-bold text-blue-700">
                      {selectedAccount.username}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Profile: {selectedAccount.profile}
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedAccount.customer
                      ? "Ganti ke Pelanggan Lain:"
                      : "Hubungkan ke Pelanggan:"}
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) =>
                      setSelectedCustomerId(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  {selectedAccount.customer && (
                    <p className="text-xs text-yellow-600 mt-2 flex items-start">
                      <span className="mr-1">⚠️</span>
                      Perhatian: Akun ini akan dipindahkan kepemilikannya dari
                      pelanggan lama ({selectedAccount.customer.name}) ke
                      pelanggan yang Anda pilih di atas.
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg text-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={mappingLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"
                  >
                    {mappingLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LinkIcon className="w-4 h-4 mr-2" />
                    )}{" "}
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

export default MikrotikSecrets;
