import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Activity, Box, Users, Network, Search, Filter, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ODP {
  id: string;
  name: string;
  location: string;
  capacity: number;
  usedPorts: number;
  odcId: string;
  odcName: string;
  odcPort: number;
  status: 'active' | 'inactive' | 'maintenance';
  type: 'distribution' | 'terminal' | 'splitter';
  customerCount: number;
}

interface Customer {
  id: string;
  name: string;
  odpId: string;
  odpPort: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

interface PortStatus {
  portNumber: number;
  status: 'available' | 'used' | 'maintenance';
  customerName?: string;
  customerId?: string;
}

interface ODPWithPortDetails extends ODP {
  ports: PortStatus[];
  utilizationRate: number;
  availablePorts: number;
}

const PortMonitoring: React.FC = () => {
  const [odps, setOdps] = useState<ODP[]>([
    {
      id: '1',
      name: 'ODP-Central-01A',
      location: 'Jl. Gatot Subroto Kav. 1A, Jakarta',
      capacity: 8,
      usedPorts: 6,
      odcId: '1',
      odcName: 'ODC-Central-01',
      odcPort: 1,
      status: 'active',
      type: 'distribution',
      customerCount: 6
    },
    {
      id: '2',
      name: 'ODP-North-01B',
      location: 'Jl. HR Rasuna Said Kav. 5B, Jakarta',
      capacity: 4,
      usedPorts: 3,
      odcId: '2',
      odcName: 'ODC-North-01',
      odcPort: 2,
      status: 'active',
      type: 'terminal',
      customerCount: 3
    },
    {
      id: '3',
      name: 'ODP-South-02A',
      location: 'Jl. Sudirman Kav. 10, Jakarta',
      capacity: 16,
      usedPorts: 12,
      odcId: '3',
      odcName: 'ODC-South-02',
      odcPort: 5,
      status: 'active',
      type: 'distribution',
      customerCount: 12
    },
    {
      id: '4',
      name: 'ODP-West-03B',
      location: 'Jl. Thamrin No. 15, Jakarta',
      capacity: 8,
      usedPorts: 2,
      odcId: '4',
      odcName: 'ODC-West-03',
      odcPort: 8,
      status: 'maintenance',
      type: 'terminal',
      customerCount: 2
    }
  ]);

  const [customers] = useState<Customer[]>([
    { id: '1', name: 'Budi Santoso', odpId: '1', odpPort: 1, status: 'active' },
    { id: '2', name: 'Siti Nurhaliza', odpId: '1', odpPort: 2, status: 'active' },
    { id: '3', name: 'Ahmad Rahman', odpId: '1', odpPort: 3, status: 'active' },
    { id: '4', name: 'Maria Garcia', odpId: '1', odpPort: 4, status: 'inactive' },
    { id: '5', name: 'John Smith', odpId: '1', odpPort: 5, status: 'active' },
    { id: '6', name: 'Lisa Wong', odpId: '1', odpPort: 6, status: 'active' },
    { id: '7', name: 'David Chen', odpId: '2', odpPort: 1, status: 'active' },
    { id: '8', name: 'Emma Johnson', odpId: '2', odpPort: 2, status: 'active' },
    { id: '9', name: 'Michael Brown', odpId: '2', odpPort: 3, status: 'pending' },
    { id: '10', name: 'Sarah Davis', odpId: '3', odpPort: 1, status: 'active' },
    { id: '11', name: 'Robert Wilson', odpId: '3', odpPort: 2, status: 'active' },
    { id: '12', name: 'Jennifer Lee', odpId: '3', odpPort: 3, status: 'active' },
    { id: '13', name: 'William Taylor', odpId: '3', odpPort: 4, status: 'active' },
    { id: '14', name: 'Jessica Martinez', odpId: '3', odpPort: 5, status: 'active' },
    { id: '15', name: 'Daniel Anderson', odpId: '3', odpPort: 6, status: 'active' },
    { id: '16', name: 'Amanda Thomas', odpId: '3', odpPort: 7, status: 'active' },
    { id: '17', name: 'James Jackson', odpId: '3', odpPort: 8, status: 'active' },
    { id: '18', name: 'Patricia White', odpId: '3', odpPort: 9, status: 'active' },
    { id: '19', name: 'Linda Harris', odpId: '3', odpPort: 10, status: 'active' },
    { id: '20', name: 'Charles Clark', odpId: '3', odpPort: 11, status: 'active' },
    { id: '21', name: 'Barbara Lewis', odpId: '3', odpPort: 12, status: 'active' },
    { id: '22', name: 'Kevin Walker', odpId: '4', odpPort: 1, status: 'active' },
    { id: '23', name: 'Nancy Hall', odpId: '4', odpPort: 2, status: 'inactive' }
  ]);

  const [selectedOdp, setSelectedOdp] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [odpsWithPorts, setOdpsWithPorts] = useState<ODPWithPortDetails[]>([]);

  // Generate port details for each ODP
  useEffect(() => {
    const enhancedOdps = odps.map(odp => {
      const ports: PortStatus[] = [];
      for (let i = 1; i <= odp.capacity; i++) {
        const customer = customers.find(c => c.odpId === odp.id && c.odpPort === i);
        if (odp.status === 'maintenance') {
          ports.push({
            portNumber: i,
            status: 'maintenance',
            customerName: customer?.name,
            customerId: customer?.id
          });
        } else if (customer) {
          ports.push({
            portNumber: i,
            status: customer.status === 'active' ? 'used' : 'maintenance',
            customerName: customer.name,
            customerId: customer.id
          });
        } else {
          ports.push({
            portNumber: i,
            status: 'available',
            customerName: undefined,
            customerId: undefined
          });
        }
      }
      
      return {
        ...odp,
        ports,
        utilizationRate: (odp.usedPorts / odp.capacity) * 100,
        availablePorts: odp.capacity - odp.usedPorts
      };
    });
    
    setOdpsWithPorts(enhancedOdps);
  }, [odps, customers]);

  const filteredOdps = odpsWithPorts.filter(odp => {
    const matchesSearch = odp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         odp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         odp.odcName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOdp = selectedOdp === 'all' || odp.id === selectedOdp;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'high' && odp.utilizationRate >= 80) ||
                         (filterStatus === 'medium' && odp.utilizationRate >= 50 && odp.utilizationRate < 80) ||
                         (filterStatus === 'low' && odp.utilizationRate < 50);
    
    return matchesSearch && matchesOdp && matchesStatus;
  });

  // Calculate statistics
  const totalPorts = odps.reduce((sum, odp) => sum + odp.capacity, 0);
  const totalUsedPorts = odps.reduce((sum, odp) => sum + odp.usedPorts, 0);
  const totalAvailablePorts = totalPorts - totalUsedPorts;
  const overallUtilization = (totalUsedPorts / totalPorts) * 100;

  // Chart data
  const utilizationData = [
    { name: 'Tersedia', value: totalAvailablePorts, color: '#10B981' },
    { name: 'Terpakai', value: totalUsedPorts, color: '#3B82F6' },
    { name: 'Maintenance', value: odps.filter(o => o.status === 'maintenance').reduce((sum, o) => sum + o.capacity, 0), color: '#F59E0B' }
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
                {odps.map((odp) => (
                  <option key={odp.id} value={odp.id}>
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
                    <span>ODC: {odp.odcName} (Port {odp.odcPort})</span>
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
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
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