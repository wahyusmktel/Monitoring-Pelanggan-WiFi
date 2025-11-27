import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  servicesService,
  PaymentMonitoringData,
} from "@/services/servicesService";
import { toast } from "sonner";

const PaymentMonitoring: React.FC = () => {
  const [data, setData] = useState<PaymentMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "analytics" | "customers" | "reports"
  >("overview");

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await servicesService.getPaymentMonitoring();
        setData(result);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat data monitoring pembayaran");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper nama bulan
  const getMonthName = (m: number) =>
    [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ][m - 1];

  // Format chart data (Monthly)
  const chartData = useMemo(() => {
    if (!data?.monthly) return [];
    // Sort by year/month ascending for chart
    return [...data.monthly]
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .map((item) => ({
        name: `${getMonthName(item.month)} ${item.year}`,
        revenue: Number(item.totalRevenue),
        payments: item.totalPayments,
        paid: Number(item.paidCount),
        pending: Number(item.pendingCount),
      }));
  }, [data]);

  // Format method data
  const methodData = useMemo(() => {
    if (!data?.methods) return [];
    return data.methods.map((m) => ({
      name: m.payment_method || "Lainnya",
      value: Number(m.value),
      count: m.count,
    }));
  }, [data]);

  // Helper Export
  const exportToPDF = () => {
    if (!data) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Laporan Monitoring Pembayaran", 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID")}`, 14, 28);

    // Ringkasan
    (doc as any).autoTable({
      startY: 35,
      head: [
        ["Total Pendapatan", "Total Transaksi", "Lunas", "Pending", "Overdue"],
      ],
      body: [
        [
          `Rp ${data.summary.totalRevenue.toLocaleString("id-ID")}`,
          data.summary.totalPayments,
          data.summary.paidCount,
          data.summary.pendingCount,
          data.summary.overdueCount,
        ],
      ],
    });

    // Detail Bulanan
    doc.text(
      "Rincian Bulanan (12 Bulan Terakhir)",
      14,
      (doc as any).lastAutoTable.finalY + 15
    );
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Periode", "Pendapatan", "Total Trx", "Lunas", "Pending"]],
      body: data.monthly.map((m) => [
        `${getMonthName(m.month)} ${m.year}`,
        `Rp ${Number(m.totalRevenue).toLocaleString("id-ID")}`,
        m.totalPayments,
        m.paidCount,
        m.pendingCount,
      ]),
    });

    doc.save("Laporan_Monitoring_Pembayaran.pdf");
  };

  const exportToExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    // Sheet Summary
    const wsSummary = XLSX.utils.json_to_sheet([data.summary]);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

    // Sheet Bulanan
    const wsMonthly = XLSX.utils.json_to_sheet(data.monthly);
    XLSX.utils.book_append_sheet(wb, wsMonthly, "Bulanan");

    // Sheet Customer
    const wsCust = XLSX.utils.json_to_sheet(data.customers);
    XLSX.utils.book_append_sheet(wb, wsCust, "Top Pelanggan");

    XLSX.writeFile(wb, "Laporan_Monitoring_Pembayaran.xlsx");
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center h-96 items-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
          <span className="ml-3 text-gray-600">Memuat data analitik...</span>
        </div>
      </Layout>
    );
  }

  if (!data)
    return (
      <Layout>
        <div className="p-8">Data tidak tersedia</div>
      </Layout>
    );

  const { summary } = data;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Monitoring Pembayaran & Pendapatan
            </h1>
            <p className="text-gray-600 mt-1">
              Dashboard analitik performa keuangan
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportToPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" /> Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" /> Export Excel
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {/* Card 1: Total Pendapatan */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Pendapatan
                </p>
                <p className="text-xl font-bold text-green-600">
                  Rp {Number(summary.totalRevenue).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Card 2: Menunggu Pembayaran */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Menunggu (Pending)
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {summary.pendingCount}
                </p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Card 3: Jatuh Tempo */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jatuh Tempo</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.overdueCount}
                </p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Card 4: Total Transaksi */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Transaksi
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.totalPayments}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 5: Rata-rata */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Rata-rata Bayar
                </p>
                <p className="text-lg font-bold text-purple-600">
                  Rp {Number(summary.averagePayment).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-8">
              {[
                { id: "overview", label: "Ringkasan", icon: BarChart3 },
                { id: "analytics", label: "Analitik", icon: PieChart },
                { id: "customers", label: "Top Pelanggan", icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* TAB CONTENT: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Monthly Revenue Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tren Pendapatan Bulanan
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartData.length > 0 ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) =>
                          `Rp ${Number(value).toLocaleString("id-ID")}`
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                        name="Pendapatan"
                      />
                    </LineChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Belum ada data bulanan
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Distribusi Status Pembayaran
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={[
                        {
                          name: "Lunas",
                          value: Number(summary.paidCount),
                          color: "#10B981",
                        },
                        {
                          name: "Pending",
                          value: Number(summary.pendingCount),
                          color: "#F59E0B",
                        },
                        {
                          name: "Overdue",
                          value: Number(summary.overdueCount),
                          color: "#EF4444",
                        },
                      ].filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { color: "#10B981" },
                        { color: "#F59E0B" },
                        { color: "#EF4444" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>{" "}
                  Lunas
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>{" "}
                  Pending
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>{" "}
                  Overdue
                </div>
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Metode Pembayaran
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {methodData.length > 0 ? (
                    <BarChart data={methodData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip
                        formatter={(val) =>
                          `Rp ${Number(val).toLocaleString("id-ID")}`
                        }
                      />
                      <Bar
                        dataKey="value"
                        fill="#8B5CF6"
                        radius={[0, 4, 4, 0]}
                        name="Total Nilai"
                      />
                    </BarChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Belum ada data metode pembayaran
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: CUSTOMERS */}
        {activeTab === "customers" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 10 Pelanggan (Berdasarkan Nilai Transaksi)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Transaksi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Nilai
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Terakhir Bayar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.customers.map((cust, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {cust.customerId || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {cust.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {cust.totalPayments}x
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-bold">
                        Rp {Number(cust.totalAmount).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {cust.lastPayment || "-"}
                      </td>
                    </tr>
                  ))}
                  {data.customers.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Belum ada data pelanggan yang melakukan pembayaran
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PaymentMonitoring;
