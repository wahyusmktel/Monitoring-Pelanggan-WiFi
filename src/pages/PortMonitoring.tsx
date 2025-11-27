import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Activity, Box, Users, Network, Search, Filter, TrendingUp, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { infrastructureService } from '@/services/infrastructureService'; // Import service
import { toast } from 'sonner';

// Interface disesuaikan dengan response backend
interface PortStatus {
  portNumber: number;
  status: 'available' | 'used' | 'maintenance';
  customerName?: string;
  customerId?: number;
}

interface ODPWithPortDetails {
  id: number;
  name: string;
  location: string;
  capacity: number;
  usedPorts: number;
  odcId: number;
  odcName: string;
  odcPort: number;
  status: 'active' | 'inactive' | 'maintenance';
  type: string;
  customerCount: number;
  ports: PortStatus[];
  utilizationRate: number;
  availablePorts: number;
}

const PortMonitoring: React.FC = () => {
  const [odpsWithPorts, setOdpsWithPorts] = useState<ODPWithPortDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOdp, setSelectedOdp] = useState<string>('all');

  // Fetch Data Real-time dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await infrastructureService.getPortMonitoring();
        setOdpsWithPorts(data);
      } catch (error) {
        console.error("Failed to fetch monitoring data", error);
        toast.error("Gagal memuat data monitoring");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Optional: Auto refresh setiap 30 detik
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter Logic
  const filteredOdps = odpsWithPorts.filter(odp => {
    const matchesSearch = odp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          odp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          odp.odcName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOdp = selectedOdp === 'all' || odp.id.toString() === selectedOdp;
    
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'high' && odp.utilizationRate >= 80) ||
                          (filterStatus === 'medium' && odp.utilizationRate >= 50 && odp.utilizationRate < 80) ||
                          (filterStatus === 'low' && odp.utilizationRate < 50);
    
    return matchesSearch && matchesOdp && matchesStatus;
  });

  // Calculate statistics
  const totalPorts = odpsWithPorts.reduce((sum, odp) => sum + odp.capacity, 0);
  const totalUsedPorts = odpsWithPorts.reduce((sum, odp) => sum + odp.usedPorts, 0);
  const totalAvailablePorts = totalPorts - totalUsedPorts;
  const overallUtilization = totalPorts > 0 ? (totalUsedPorts / totalPorts) * 100 : 0;

  // Chart data
  const utilizationData = [
    { name: 'Tersedia', value: totalAvailablePorts, color: '#10B981' },
    { name: 'Terpakai', value: totalUsedPorts, color: '#3B82F6' },
    { name: 'Maintenance', value: odpsWithPorts.filter(o => o.status === 'maintenance').reduce((sum, o) => sum + o.capacity, 0), color: '#F59E0B' }
  ];

  const odpUtilizationData = odpsWithPorts.map(odp => ({
    name: odp.name,
    utilization: Math.round(odp.utilizationRate),
    used: odp.usedPorts,
    available: odp.availablePorts
  }));

  const getPortColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500 hover:bg-green-600';
      case 'used': return 'bg-blue-500 hover:bg-blue-600';
      case 'maintenance': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getPortStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Tersedia';
      case 'used': return 'Terpakai';
      case 'maintenance': return 'Maintenance';
      default: return 'Tidak Diketahui';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            <span className="ml-3 text-gray-600">Memuat data monitoring...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Monitoring Port ODP</h1>
            <p className="text-gray-600 mt-1">Pantau kapasitas dan utilisasi port ODP secara real-time</p>
          </div>
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Real-time Monitoring</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Network className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Port</p>
                <p className="text-2xl font-bold text-gray-900">{totalPorts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Port Tersedia</p>
                <p className="text-2xl font-bold text-gray-900">{totalAvailablePorts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Port Terpakai</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsedPorts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilisasi Overall</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(overallUtilization)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status Port</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={utilizationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {utilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {utilizationData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisasi Port per ODP</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={odpUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="used" stackId="a" fill="#3B82F6" name="Terpakai" />
                <Bar dataKey="available" stackId="a" fill="#10B981" name="Tersedia" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari ODP</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nama ODP atau lokasi..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih ODP</label>
              <select
                value={selectedOdp}
                onChange={(e) => setSelectedOdp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua ODP</option>
                {odpsWithPorts.map((odp) => (
                  <option key={odp.id} value={odp.id.toString()}>
                    {odp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Utilisasi</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua</option>
                <option value="high">Tinggi (≥80%)</option>
                <option value="medium">Sedang (50-79%)</option>
                <option value="low">Rendah (&lt;50%)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedOdp('all');
                  setFilterStatus('all');
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* ODP Port Details */}
        <div className="space-y-6">
          {filteredOdps.map((odp) => (
            <div key={odp.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{odp.name}</h3>
                  <p className="text-gray-600">{odp.location}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Network className="w-4 h-4 mr-1" />
                    <span>ODC: {odp.odcName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(odp.utilizationRate)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {odp.usedPorts}/{odp.capacity} port terpakai
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        odp.utilizationRate >= 80 ? 'bg-red-500' :
                        odp.utilizationRate >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${odp.utilizationRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Port Grid */}
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Status Port</h4>
                <div className="grid grid-cols-8 gap-2">
                  {odp.ports.map((port) => (
                    <div
                      key={port.portNumber}
                      className={`relative group cursor-pointer rounded-lg p-2 text-center text-white text-xs font-medium transition-all duration-200 ${getPortColor(port.status)}`}
                      title={`Port ${port.portNumber}: ${getPortStatusText(port.status)}${port.customerName ? ` - ${port.customerName}` : ''}`}
                    >
                      <div className="font-bold">{port.portNumber}</div>
                      <div className="text-xs opacity-90">
                        {port.status === 'available' ? '✓' : 
                         port.status === 'used' ? '✗' : '⚠'}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap pointer-events-none">
                        {port.customerName || getPortStatusText(port.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span>Tersedia</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span>Terpakai</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                  <span>Maintenance</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOdps.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Box className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data ODP</h3>
            <p className="text-gray-600">Tidak ada ODP yang sesuai dengan filter yang dipilih.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PortMonitoring;