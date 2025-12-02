import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Search,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Edit,
  FileText,
  Key,
  Printer,
  AlertCircle,
  RefreshCw,
  Loader2,
  Settings,
  Power,
  Trash2,
} from "lucide-react";
import { servicesService, Payment } from "@/services/servicesService"; // Import service & types
import { toast } from "sonner";

const Payments: React.FC = () => {
  // State Data
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // State UI & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal States
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Billing Form
  const [billingMonth, setBillingMonth] = useState(new Date().getMonth() + 1);
  const [billingYear, setBillingYear] = useState(new Date().getFullYear());

  // --- STATE BARU UNTUK SETTING ---
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [billingSettings, setBillingSettings] = useState<BillingSettings>({
    is_active: false,
    generate_day: 1,
    generate_time: '09:00',
    is_recurring: true
  });

  // --- 1. FETCH DATA ---
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await servicesService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data pembayaran");
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI BARU: FETCH SETTING ---
  const fetchSettings = async () => {
    try {
      const settings = await servicesService.getBillingSettings();
      setBillingSettings(settings);
    } catch (error) {
      console.error("Gagal memuat setting");
    }
  };

  // --- FUNGSI BARU: SIMPAN SETTING ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await servicesService.updateBillingSettings(billingSettings);
      toast.success("Pengaturan tagihan otomatis berhasil disimpan");
      setShowSettingsModal(false);
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchSettings();
  }, []);

  // --- 2. GENERATE BILLING ---
  const handleGenerateBilling = async () => {
    try {
      // Panggil API generate billing
      const result = await servicesService.generateBilling(
        billingMonth,
        billingYear
      );

      // Tampilkan pesan sukses (sesuaikan dengan response JSON backend)
      // Backend kita mengembalikan { message: "...", count: ... }
      toast.success(result.message || "Tagihan berhasil digenerate");

      setShowBillingModal(false);
      fetchPayments(); // Refresh list data
    } catch (error) {
      console.error(error);
      toast.error(
        "Gagal membuat tagihan. Pastikan belum ada tagihan di periode ini."
      );
    }
  };

  // --- 3. PROCESS PAYMENT ---
  const handleProcessPayment = async (id: number) => {
    if (!confirm("Konfirmasi pembayaran ini? Status akan menjadi LUNAS."))
      return;

    try {
      const result = await servicesService.processPayment(id);
      toast.success("Pembayaran berhasil! Token telah dibuat.");

      // Result dari backend berisi { message: "...", data: PaymentObject }
      // Kita set selectedPayment dengan data terbaru agar token muncul di modal
      // Perlu casting 'as unknown as Payment' jika struktur backend sedikit berbeda dengan interface frontend sementara
      const updatedPayment = result.data as unknown as Payment;

      setSelectedPayment(updatedPayment);
      setShowTokenModal(true);

      fetchPayments(); // Refresh list data di tabel
    } catch (error) {
      console.error(error);
      toast.error("Gagal memproses pembayaran");
    }
  };

  // --- 4. DELETE PAYMENT ---
  const handleDeletePayment = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data pembayaran ini? Data yang dihapus tidak bisa dikembalikan.")) return;

    try {
      await servicesService.deletePayment(id);
      toast.success("Data pembayaran berhasil dihapus");
      fetchPayments(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus pembayaran");
    }
  };

  // --- HELPER FUNCTIONS ---

  const getMonthName = (month: number): string => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return months[month - 1];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Lunas";
      case "pending":
        return "Menunggu";
      case "overdue":
        return "Jatuh Tempo";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "overdue":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTokenStatusColor = (tokenStatus: string) => {
    switch (tokenStatus) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "unused":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  // Print token functionality
  const printToken = (payment: Payment) => {
    if (payment.token) {
      const printWindow = window.open("", "_blank", "width=400,height=500");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Token Internet</title>
              <style>
                body { font-family: monospace; padding: 20px; text-align: center; }
                .header { border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 20px; }
                .token { font-size: 24px; font-weight: bold; margin: 20px 0; border: 1px solid #000; padding: 10px; }
                .footer { border-top: 2px dashed #000; padding-top: 10px; margin-top: 20px; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h3>BUKTI PEMBAYARAN</h3>
                <p>RT/RW NET</p>
              </div>
              
              <p style="text-align: left;">
                Pelanggan : ${
                  payment.customer?.name || payment.customerName
                }<br/>
                ID        : ${
                  payment.customer?.customer_number || payment.customerId
                }<br/>
                Periode   : ${getMonthName(payment.billing_month)} ${
          payment.billing_year
        }<br/>
                Status    : LUNAS
              </p>

              <div class="token">
                TOKEN: ${payment.token}
              </div>

              <div class="footer">
                <p>Terima kasih atas pembayaran Anda.</p>
                <p>Simpan struk ini sebagai bukti sah.</p>
              </div>

              <button onclick="window.print()" style="margin-top:20px;">Cetak</button>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // Filter Logic
  const filteredPayments = payments.filter((payment) => {
    // Backend relation: payment.customer.name
    // Fallback to flat property if backend structure differs slightly
    const customerName = payment.customer?.name || payment.customerName || "";
    const customerId =
      payment.customer?.customer_number || payment.customerId || "";
    const packageName =
      payment.subscription?.package?.name || payment.packageName || "";

    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      packageName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Statistics Calculation
  const totalRevenue = filteredPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const totalPending = filteredPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const totalOverdue = filteredPayments
    .filter((p) => p.status === "overdue")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const pendingPaymentsCount = filteredPayments.filter(
    (p) => p.status === "pending"
  ).length;

  // --- RENDER UI ---

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            <span className="ml-3 text-gray-600">
              Memuat data pembayaran...
            </span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manajemen Pembayaran
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola tagihan dan pembayaran pelanggan
            </p>
          </div>
          <div className="flex space-x-3">
          <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Setting Otomatis
            </button>
            <button
              onClick={() => setShowBillingModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Tagihan
            </button>
            {/* Tombol Tambah Manual bisa diimplementasikan nanti jika perlu */}
            {/* <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" /> Tambah Manual
            </button> */}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Pendapatan
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Menunggu Pembayaran
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(totalPending)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Jatuh Tempo</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalOverdue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Tagihan Pending
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {pendingPaymentsCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cari Pembayaran
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nama pelanggan, ID, atau paket..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="paid">Lunas</option>
                <option value="pending">Menunggu</option>
                <option value="overdue">Jatuh Tempo</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jatuh Tempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.customer?.name ||
                              payment.customerName ||
                              "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.customer?.customer_number ||
                              payment.customerId ||
                              "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      {payment.payment_date && (
                        <div className="text-sm text-gray-500">
                          {payment.payment_date}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.subscription?.package?.name ||
                        payment.packageName ||
                        "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {getMonthName(payment.billing_month)}{" "}
                        {payment.billing_year}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {payment.due_date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">
                          {getStatusText(payment.status)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.token ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {payment.token}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getTokenStatusColor(
                              payment.token_status ||
                                payment.tokenStatus ||
                                "unused"
                            )}`}
                          >
                            {payment.token_status ||
                              payment.tokenStatus ||
                              "unused"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Belum ada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {payment.status === "pending" && (
                          <button
                            onClick={() => handleProcessPayment(payment.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Proses Pembayaran"
                          >
                            <DollarSign className="w-5 h-5" />
                          </button>
                        )}
                        {payment.status === "paid" && payment.token && (
                          <button
                            onClick={() => printToken(payment)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Cetak Token"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                        )}
                        {payment.token && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowTokenModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                            title="Lihat Token"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        )}
                        {/* --- TOMBOL HAPUS --- */}
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="text-red-600 hover:text-red-900 ml-2"
                          title="Hapus Pembayaran"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        {/* -------------------- */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPayments.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada data pembayaran
            </h3>
            <p className="text-gray-600">
              Tidak ada pembayaran yang sesuai dengan filter yang dipilih.
            </p>
          </div>
        )}

        {/* --- MODAL SETTING BARU --- */}
        {showSettingsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full">
                    <div className="p-6">
                        <div className="flex items-center mb-6">
                            <Settings className="w-6 h-6 text-gray-700 mr-2" />
                            <h2 className="text-2xl font-bold text-gray-900">Pengaturan Otomatisasi</h2>
                        </div>

                        <form onSubmit={handleSaveSettings} className="space-y-5">
                            
                            {/* SWITCH AKTIF/NONAKTIF */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                    <label className="font-medium text-gray-900 block">Status Otomatisasi</label>
                                    <span className="text-xs text-gray-500">Aktifkan generate tagihan otomatis</span>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setBillingSettings(prev => ({...prev, is_active: !prev.is_active}))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${billingSettings.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingSettings.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* FORM SETTING */}
                            <div className={`space-y-4 transition-all duration-300 ${billingSettings.is_active ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Eksekusi (Tiap Bulan)</label>
                                    <select 
                                        value={billingSettings.generate_day}
                                        onChange={(e) => setBillingSettings({...billingSettings, generate_day: parseInt(e.target.value)})}
                                        className="w-full border-gray-300 rounded-lg border p-2"
                                    >
                                        {[...Array(28)].map((_, i) => (
                                            <option key={i} value={i+1}>Tanggal {i+1}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Disarankan tanggal 1-5 awal bulan.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Eksekusi</label>
                                    <input 
                                        type="time" 
                                        value={billingSettings.generate_time}
                                        onChange={(e) => setBillingSettings({...billingSettings, generate_time: e.target.value})}
                                        className="w-full border-gray-300 rounded-lg border p-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Pengulangan</label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input 
                                                type="radio" 
                                                checked={billingSettings.is_recurring} 
                                                onChange={() => setBillingSettings({...billingSettings, is_recurring: true})}
                                                className="mr-2 text-blue-600"
                                            />
                                            <span className="text-sm text-gray-700">Setiap Bulan</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input 
                                                type="radio" 
                                                checked={!billingSettings.is_recurring} 
                                                onChange={() => setBillingSettings({...billingSettings, is_recurring: false})}
                                                className="mr-2 text-blue-600"
                                            />
                                            <span className="text-sm text-gray-700">Sekali Saja</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowSettingsModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                >
                                    {savingSettings ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                    Simpan Pengaturan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
        {/* -------------------------- */}

        {/* Billing Generation Modal */}
        {showBillingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Generate Tagihan
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bulan
                    </label>
                    <select
                      value={billingMonth}
                      onChange={(e) =>
                        setBillingMonth(parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {getMonthName(i + 1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tahun
                    </label>
                    <select
                      value={billingYear}
                      onChange={(e) => setBillingYear(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <option key={2024 + i} value={2024 + i}>
                          {2024 + i}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Perhatian!</p>
                        <p>
                          Tagihan akan dibuat untuk pelanggan aktif yang belum
                          memiliki tagihan untuk periode yang dipilih.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowBillingModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateBilling}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Generate Tagihan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Token Display Modal */}
        {showTokenModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Token Internet
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Pelanggan
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedPayment.customer?.name ||
                        selectedPayment.customerName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Token
                    </label>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-center text-gray-900 font-mono">
                        {selectedPayment.token}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTokenStatusColor(
                        selectedPayment.token_status ||
                          selectedPayment.tokenStatus ||
                          "unused"
                      )}`}
                    >
                      {selectedPayment.token_status ||
                        selectedPayment.tokenStatus ||
                        "unused"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Periode
                    </label>
                    <p className="text-sm text-gray-600">
                      {getMonthName(selectedPayment.billing_month)}{" "}
                      {selectedPayment.billing_year}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowTokenModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      printToken(selectedPayment);
                      setShowTokenModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Cetak
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Payments;
