import React, { useState, useEffect } from "react";
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  DollarSign,
  Wifi,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Server,
  Router,
  CreditCard,
  Target,
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { servicesService } from "@/services/servicesService"; // Import Service
import { toast } from "sonner";

// ... Interface Stats tetap sama ...
interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  suspendedCustomers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  totalOLT: number;
  totalODC: number;
  totalODP: number;
  activePackages: number;
  totalPackages: number;
}

// ... Interface ChartData dll tetap sama ...
interface ChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: unknown;
}

interface RevenueData {
  month: string;
  revenue: number;
  target: number; // Target ini bisa hardcoded atau dihitung
  customers: number;
}

interface CustomerGrowthData {
  month: string;
  newCustomers: number;
  totalCustomers: number;
}

interface NetworkStatusData {
  type: string;
  active: number;
  inactive: number;
  total: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Initial State Kosong
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    suspendedCustomers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    totalOLT: 0,
    totalODC: 0,
    totalODP: 0,
    activePackages: 0,
    totalPackages: 0,
  });

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [customerGrowthData, setCustomerGrowthData] = useState<
    CustomerGrowthData[]
  >([]);
  const [paymentStatusData, setPaymentStatusData] = useState<ChartData[]>([]);
  const [packageDistribution, setPackageDistribution] = useState<ChartData[]>(
    []
  );
  const [networkStatus, setNetworkStatus] = useState<NetworkStatusData[]>([]);

  // FETCH DATA
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await servicesService.getDashboardData();

      setStats(data.stats);

      // Mapping revenue data (tambahkan target manual jika backend tidak kirim)
      const mappedRevenue = data.revenueData.map((item: any) => ({
        month: item.month,
        revenue: Number(item.revenue),
        customers: item.customers,
        target: 50000000, // Hardcoded Target bulanan contoh
      }));
      setRevenueData(mappedRevenue);

      setCustomerGrowthData(data.customerGrowthData);
      setPaymentStatusData(data.paymentStatusData);
      setPackageDistribution(data.packageDistribution);
      setNetworkStatus(data.networkStatus);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ... Helper functions (formatCurrency, formatNumber, calculatePercentage) TETAP SAMA ...
  const formatCurrency = (value: number) =>
    `Rp ${value.toLocaleString("id-ID")}`;
  const formatNumber = (value: number) => value.toLocaleString("id-ID");
  const calculatePercentage = (current: number, total: number) =>
    total > 0 ? Math.round((current / total) * 100) : 0;

  // Calculations untuk trend (Safety check array length)
  const revenueTrend =
    revenueData.length > 1
      ? ((revenueData[revenueData.length - 1].revenue -
          revenueData[revenueData.length - 2].revenue) /
          revenueData[revenueData.length - 2].revenue) *
        100
      : 0;

  const customerGrowth =
    customerGrowthData.length > 1
      ? ((customerGrowthData[customerGrowthData.length - 1].totalCustomers -
          customerGrowthData[customerGrowthData.length - 2].totalCustomers) /
          customerGrowthData[customerGrowthData.length - 2].totalCustomers) *
        100
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Monitoring
            </h1>
            <p className="text-gray-600 mt-1">
              Pemantauan kinerja dan analisis bisnis internet
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString("id-ID")}
            </div>
            <button
              onClick={fetchDashboardData} // Refresh Action
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* ... (SISA KODE RENDER UI TETAP SAMA SEPERTI SEBELUMNYA, TIDAK PERLU DIUBAH) ... */}
        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ... Card Total Customers ... */}
          {/* Gunakan variable stats.totalCustomers, stats.monthlyRevenue, dll */}
          {/* Contoh satu card: */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Pelanggan
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats.totalCustomers)}
                </p>
                <div className="flex items-center mt-2">
                  {customerGrowth > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      customerGrowth > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {Math.abs(customerGrowth).toFixed(1)}% dari bulan lalu
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Lanjutkan copy paste card lainnya dari kode sebelumnya ... */}
          {/* Monthly Revenue Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pendapatan Bulan Ini
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
                <div className="flex items-center mt-2">
                  {revenueTrend > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      revenueTrend > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {Math.abs(revenueTrend).toFixed(1)}% dari bulan lalu
                  </span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Active Customers Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pelanggan Aktif
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats.activeCustomers)}
                </p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Aktif:</span>
                    <span className="text-green-600 font-medium">
                      {calculatePercentage(
                        stats.activeCustomers,
                        stats.totalCustomers
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Pending Issues Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Masalah Pending
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.pendingPayments + stats.overduePayments}
                </p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Menunggu:</span>
                    <span className="text-yellow-600 font-medium">
                      {stats.pendingPayments}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Jatuh Tempo:</span>
                    <span className="text-red-600 font-medium">
                      {stats.overduePayments}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ... Sisa kode charts dan layout sama persis, tinggal copy paste dari kode aslimu ... */}
        {/* Charts Row 1, Charts Row 2, dll */}

        {/* Saya copykan ulang bagian chart agar lengkap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tren Pendapatan
              </h3>
              {/* ... legend ... */}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) =>
                    `Rp${(value / 1000000).toFixed(0)}M`
                  }
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue"
                      ? formatCurrency(value as number)
                      : formatCurrency(value as number),
                    name === "revenue" ? "Pendapatan" : "Target",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Growth Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pertumbuhan Pelanggan
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `${value} pelanggan`,
                    "Pelanggan Baru",
                  ]}
                />
                <Bar
                  dataKey="newCustomers"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Payment Status Pie */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Pembayaran
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend manual jika perlu, atau biarkan tooltip */}
          </div>

          {/* Package Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribusi Paket
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={packageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {packageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Network Status (List) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Infrastruktur
            </h3>
            <div className="space-y-4">
              {networkStatus.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-3 last:border-b-0"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">
                      {item.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.active}/{item.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${calculatePercentage(
                          item.active,
                          item.total
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
