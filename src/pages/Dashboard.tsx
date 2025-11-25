import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, DollarSign, Wifi, Package, TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Clock, MapPin, Server, Router, CreditCard, Target, Calendar, Filter, RefreshCw } from 'lucide-react';

// Interface untuk data dashboard
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

// Interface untuk data chart
interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface RevenueData {
  month: string;
  revenue: number;
  target: number;
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
  // State untuk statistik
  const [stats] = useState<DashboardStats>({
    totalCustomers: 245,
    activeCustomers: 198,
    inactiveCustomers: 32,
    suspendedCustomers: 15,
    totalRevenue: 125000000,
    monthlyRevenue: 48500000,
    pendingPayments: 28,
    overduePayments: 12,
    totalOLT: 8,
    totalODC: 24,
    totalODP: 156,
    activePackages: 4,
    totalPackages: 4
  });

  // State untuk data chart
  const [revenueData] = useState<RevenueData[]>([
    { month: 'Jan', revenue: 42000000, target: 45000000, customers: 185 },
    { month: 'Feb', revenue: 38000000, target: 45000000, customers: 192 },
    { month: 'Mar', revenue: 46000000, target: 48000000, customers: 205 },
    { month: 'Apr', revenue: 48500000, target: 50000000, customers: 220 },
    { month: 'May', revenue: 52000000, target: 52000000, customers: 235 },
    { month: 'Jun', revenue: 48500000, target: 55000000, customers: 245 }
  ]);

  const [customerGrowthData] = useState<CustomerGrowthData[]>([
    { month: 'Jan', newCustomers: 15, totalCustomers: 185 },
    { month: 'Feb', newCustomers: 12, totalCustomers: 197 },
    { month: 'Mar', newCustomers: 18, totalCustomers: 215 },
    { month: 'Apr', newCustomers: 22, totalCustomers: 237 },
    { month: 'May', newCustomers: 25, totalCustomers: 262 },
    { month: 'Jun', newCustomers: 18, totalCustomers: 280 }
  ]);

  const [paymentStatusData] = useState<ChartData[]>([
    { name: 'Lunas', value: 180, color: '#10B981' },
    { name: 'Menunggu', value: 28, color: '#F59E0B' },
    { name: 'Jatuh Tempo', value: 12, color: '#EF4444' }
  ]);

  const [packageDistribution] = useState<ChartData[]>([
    { name: 'Basic', value: 85, color: '#3B82F6' },
    { name: 'Standard', value: 92, color: '#10B981' },
    { name: 'Premium', value: 68, color: '#8B5CF6' },
    { name: 'Enterprise', value: 35, color: '#F59E0B' }
  ]);

  const [networkStatus] = useState<NetworkStatusData[]>([
    { type: 'OLT', active: 7, inactive: 1, total: 8 },
    { type: 'ODC', active: 22, inactive: 2, total: 24 },
    { type: 'ODP', active: 145, inactive: 11, total: 156 }
  ]);

  // Warna untuk chart
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Fungsi untuk format mata uang
  const formatCurrency = (value: number): string => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  // Fungsi untuk format angka
  const formatNumber = (value: number): string => {
    return value.toLocaleString('id-ID');
  };

  // Fungsi untuk menghitung persentase
  const calculatePercentage = (current: number, total: number): number => {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  };

  // Revenue trend calculation
  const revenueTrend = revenueData.length > 1 ? 
    ((revenueData[revenueData.length - 1].revenue - revenueData[revenueData.length - 2].revenue) / revenueData[revenueData.length - 2].revenue) * 100 : 0;

  // Customer growth calculation
  const customerGrowth = customerGrowthData.length > 1 ?
    ((customerGrowthData[customerGrowthData.length - 1].totalCustomers - customerGrowthData[customerGrowthData.length - 2].totalCustomers) / customerGrowthData[customerGrowthData.length - 2].totalCustomers) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Monitoring</h1>
            <p className="text-gray-600 mt-1">Pemantauan kinerja dan analisis bisnis internet</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString('id-ID')}
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Customers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalCustomers)}</p>
                <div className="flex items-center mt-2">
                  {customerGrowth > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${customerGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(customerGrowth).toFixed(1)}% dari bulan lalu
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendapatan Bulan Ini</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
                <div className="flex items-center mt-2">
                  {revenueTrend > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${revenueTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(revenueTrend).toFixed(1)}% dari bulan lalu
                  </span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Active Customers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pelanggan Aktif</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.activeCustomers)}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Aktif:</span>
                    <span className="text-green-600 font-medium">{calculatePercentage(stats.activeCustomers, stats.totalCustomers)}%</span>
                  </div>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Pending Issues */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Masalah Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingPayments + stats.overduePayments}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Menunggu:</span>
                    <span className="text-yellow-600 font-medium">{stats.pendingPayments}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Jatuh Tempo:</span>
                    <span className="text-red-600 font-medium">{stats.overduePayments}</span>
                  </div>
                </div>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tren Pendapatan</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Pendapatan</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Target</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `Rp${(value/1000000).toFixed(0)}M`} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : formatCurrency(value as number),
                    name === 'revenue' ? 'Pendapatan' : 'Target'
                  ]}
                  labelFormatter={(label) => `Bulan: ${label}`}
                />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="target" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Growth Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pertumbuhan Pelanggan</h3>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Pelanggan Baru</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'newCustomers' ? `${value} pelanggan` : `${value} total`,
                    name === 'newCustomers' ? 'Pelanggan Baru' : 'Total Pelanggan'
                  ]}
                  labelFormatter={(label) => `Bulan: ${label}`}
                />
                <Bar dataKey="newCustomers" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Payment Status Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Pembayaran</h3>
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
                <Tooltip formatter={(value) => [`${value} pembayaran`, 'Jumlah']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {paymentStatusData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Package Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Paket</h3>
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
                <Tooltip formatter={(value) => [`${value} pelanggan`, 'Jumlah']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {packageDistribution.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Network Infrastructure Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Infrastruktur</h3>
            <div className="space-y-4">
              {networkStatus.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{item.type}</span>
                    <span className="text-sm text-gray-500">{item.active}/{item.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${calculatePercentage(item.active, item.total)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Aktif: {item.active}</span>
                    <span>Nonaktif: {item.inactive}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Network Infrastructure Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Ringkasan Infrastruktur Jaringan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* OLT Status */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Server className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">OLT</h4>
                    <p className="text-sm text-gray-600">Optical Line Terminal</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalOLT}</div>
                  <div className="text-sm text-green-600">{calculatePercentage(7, 8)}% Aktif</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aktif:</span>
                  <span className="text-green-600 font-medium">7</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nonaktif:</span>
                  <span className="text-red-600 font-medium">1</span>
                </div>
              </div>
            </div>

            {/* ODC Status */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <Router className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">ODC</h4>
                    <p className="text-sm text-gray-600">Optical Distribution Cabinet</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalODC}</div>
                  <div className="text-sm text-green-600">{calculatePercentage(22, 24)}% Aktif</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aktif:</span>
                  <span className="text-green-600 font-medium">22</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nonaktif:</span>
                  <span className="text-red-600 font-medium">2</span>
                </div>
              </div>
            </div>

            {/* ODP Status */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">ODP</h4>
                    <p className="text-sm text-gray-600">Optical Distribution Point</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalODP}</div>
                  <div className="text-sm text-green-600">{calculatePercentage(145, 156)}% Aktif</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aktif:</span>
                  <span className="text-green-600 font-medium">145</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nonaktif:</span>
                  <span className="text-red-600 font-medium">11</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg transition-colors text-left">
                <CreditCard className="w-6 h-6 mb-2" />
                <div className="font-medium">Buat Tagihan</div>
                <div className="text-sm text-blue-600">{stats.pendingPayments} pending</div>
              </button>
              <button className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg transition-colors text-left">
                <Users className="w-6 h-6 mb-2" />
                <div className="font-medium">Pelanggan Baru</div>
                <div className="text-sm text-green-600">Tambah pelanggan</div>
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg transition-colors text-left">
                <Package className="w-6 h-6 mb-2" />
                <div className="font-medium">Paket Baru</div>
                <div className="text-sm text-purple-600">{stats.activePackages} aktif</div>
              </button>
              <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-lg transition-colors text-left">
                <Activity className="w-6 h-6 mb-2" />
                <div className="font-medium">Monitoring</div>
                <div className="text-sm text-yellow-600">Status jaringan</div>
              </button>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kesehatan Sistem</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Database Connection</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Network Services</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Normal</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Payment Gateway</span>
                </div>
                <span className="text-yellow-600 text-sm font-medium">Slow</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">API Services</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;