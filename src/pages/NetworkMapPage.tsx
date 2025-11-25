import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import NetworkMap from '@/components/NetworkMap';
import { MapPin, Users, Server, Router, Box, Filter, Search, RefreshCw, Map, Download } from 'lucide-react';

// Interface untuk lokasi
interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  type: 'customer' | 'olt' | 'odc' | 'odp';
  status?: 'active' | 'inactive' | 'maintenance';
  details?: Record<string, any>;
}

const NetworkMapPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCoverage, setShowCoverage] = useState(true);
  const [coverageRadius, setCoverageRadius] = useState(1000);

  // Data dummy untuk lokasi
  const locations: Location[] = [
    // OLT Locations
    {
      id: 'olt-1',
      name: 'OLT-Central-01',
      lat: -6.2088,
      lng: 106.8456,
      address: 'Jl. Gatot Subroto Kav. 1, Jakarta',
      type: 'olt',
      status: 'active',
      details: {
        'Kapasitas': '32 Port',
        'Port Terpakai': '24',
        'Merek': 'Huawei',
        'Tipe': 'MA5800'
      }
    },
    {
      id: 'olt-2',
      name: 'OLT-North-01',
      lat: -6.2255,
      lng: 106.8292,
      address: 'Jl. HR Rasuna Said Kav. 5, Jakarta',
      type: 'olt',
      status: 'active',
      details: {
        'Kapasitas': '16 Port',
        'Port Terpakai': '12',
        'Merek': 'ZTE',
        'Tipe': 'C300'
      }
    },
    
    // ODC Locations
    {
      id: 'odc-1',
      name: 'ODC-Central-01',
      lat: -6.2095,
      lng: 106.8465,
      address: 'Jl. Gatot Subroto Kav. 1A, Jakarta',
      type: 'odc',
      status: 'active',
      details: {
        'Kapasitas': '8 Port',
        'Port Terpakai': '6',
        'Jarak ke OLT': '500m',
        'Tipe': 'Pemisah'
      }
    },
    {
      id: 'odc-2',
      name: 'ODC-North-01',
      lat: -6.2265,
      lng: 106.8285,
      address: 'Jl. HR Rasuna Said Kav. 5B, Jakarta',
      type: 'odc',
      status: 'active',
      details: {
        'Kapasitas': '4 Port',
        'Port Terpakai': '3',
        'Jarak ke OLT': '300m',
        'Tipe': 'Pemisah'
      }
    },
    
    // ODP Locations
    {
      id: 'odp-1',
      name: 'ODP-Central-01A',
      lat: -6.2102,
      lng: 106.8472,
      address: 'Jl. Gatot Subroto Kav. 1B, Jakarta',
      type: 'odp',
      status: 'active',
      details: {
        'Kapasitas': '8 Port',
        'Port Terpakai': '6',
        'Jarak ke ODC': '200m',
        'Tipe': 'Distribusi'
      }
    },
    {
      id: 'odp-2',
      name: 'ODP-Central-01B',
      lat: -6.2085,
      lng: 106.8448,
      address: 'Jl. Gatot Subroto Kav. 2, Jakarta',
      type: 'odp',
      status: 'active',
      details: {
        'Kapasitas': '4 Port',
        'Port Terpakai': '3',
        'Jarak ke ODC': '150m',
        'Tipe': 'Distribusi'
      }
    },
    {
      id: 'odp-3',
      name: 'ODP-North-01A',
      lat: -6.2272,
      lng: 106.8278,
      address: 'Jl. HR Rasuna Said Kav. 6, Jakarta',
      type: 'odp',
      status: 'active',
      details: {
        'Kapasitas': '8 Port',
        'Port Terpakai': '5',
        'Jarak ke ODC': '250m',
        'Tipe': 'Distribusi'
      }
    },
    {
      id: 'odp-4',
      name: 'ODP-North-01B',
      lat: -6.2248,
      lng: 106.8305,
      address: 'Jl. HR Rasuna Said Kav. 4, Jakarta',
      type: 'odp',
      status: 'maintenance',
      details: {
        'Kapasitas': '4 Port',
        'Port Terpakai': '2',
        'Jarak ke ODC': '180m',
        'Tipe': 'Distribusi'
      }
    },
    
    // Customer Locations
    {
      id: 'cust-1',
      name: 'Budi Santoso',
      lat: -6.2098,
      lng: 106.8468,
      address: 'Jl. Merdeka No. 10, Jakarta',
      type: 'customer',
      status: 'active',
      details: {
        'Paket': 'Standard 20Mbps',
        'ODP': 'ODP-Central-01A',
        'Port': '3',
        'Telepon': '081234567890'
      }
    },
    {
      id: 'cust-2',
      name: 'Siti Nurhaliza',
      lat: -6.2268,
      lng: 106.8288,
      address: 'Jl. Sudirman No. 45, Jakarta',
      type: 'customer',
      status: 'active',
      details: {
        'Paket': 'Premium 50Mbps',
        'ODP': 'ODP-North-01A',
        'Port': '1',
        'Telepon': '081298765432'
      }
    },
    {
      id: 'cust-3',
      name: 'Ahmad Rahman',
      lat: -6.2105,
      lng: 106.8475,
      address: 'Jl. Gatot Subroto No. 15, Jakarta',
      type: 'customer',
      status: 'active',
      details: {
        'Paket': 'Basic 10Mbps',
        'ODP': 'ODP-Central-01A',
        'Port': '5',
        'Telepon': '081345678901'
      }
    },
    {
      id: 'cust-4',
      name: 'Rina Marlina',
      lat: -6.2082,
      lng: 106.8452,
      address: 'Jl. HR Rasuna Said No. 20, Jakarta',
      type: 'customer',
      status: 'inactive',
      details: {
        'Paket': 'Standard 20Mbps',
        'ODP': 'ODP-Central-01B',
        'Port': '2',
        'Telepon': '081456789012'
      }
    },
    {
      id: 'cust-5',
      name: 'Dedi Kurniawan',
      lat: -6.2245,
      lng: 106.8295,
      address: 'Jl. Kuningan No. 25, Jakarta',
      type: 'customer',
      status: 'inactive',
      details: {
        'Paket': 'Premium 50Mbps',
        'ODP': 'ODP-North-01B',
        'Port': '1',
        'Telepon': '081567890123'
      }
    }
  ];

  // Filter locations based on search and filters
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (location.address && location.address.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'all' || location.type === filterType;
      const matchesStatus = filterStatus === 'all' || location.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [locations, searchTerm, filterType, filterStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = locations.length;
    const customers = locations.filter(l => l.type === 'customer').length;
    const olt = locations.filter(l => l.type === 'olt').length;
    const odc = locations.filter(l => l.type === 'odc').length;
    const odp = locations.filter(l => l.type === 'odp').length;
    const active = locations.filter(l => l.status === 'active').length;
    const inactive = locations.filter(l => l.status === 'inactive').length;
    const maintenance = locations.filter(l => l.status === 'maintenance').length;

    return { total, customers, olt, odc, odp, active, inactive, maintenance };
  }, [locations]);

  const handleExportData = () => {
    const data = filteredLocations.map(loc => ({
      Nama: loc.name,
      Tipe: loc.type.toUpperCase(),
      Status: loc.status || '-',
      Alamat: loc.address || '-',
      Latitude: loc.lat,
      Longitude: loc.lng
    }));

    const csvContent = [
      ['Nama', 'Tipe', 'Status', 'Alamat', 'Latitude', 'Longitude'],
      ...data.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'network-infrastructure.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Peta Infrastruktur Jaringan</h1>
            <p className="text-gray-600 mt-1">Visualisasi sebaran pelanggan dan infrastruktur jaringan</p>
          </div>
          <button
            onClick={handleExportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lokasi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pelanggan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <Server className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">OLT</p>
                <p className="text-2xl font-bold text-gray-900">{stats.olt}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <Router className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">ODC</p>
                <p className="text-2xl font-bold text-gray-900">{stats.odc}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <Box className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">ODP</p>
                <p className="text-2xl font-bold text-gray-900">{stats.odp}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.maintenance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari Lokasi</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nama atau alamat..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Tipe</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Tipe</option>
                <option value="customer">Pelanggan</option>
                <option value="olt">OLT</option>
                <option value="odc">ODC</option>
                <option value="odp">ODP</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Non-Aktif</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2 inline" />
                Reset
              </button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showCoverage}
                  onChange={(e) => setShowCoverage(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Tampilkan Area Jangkauan</span>
              </label>
              
              {showCoverage && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Radius:</label>
                  <select
                    value={coverageRadius}
                    onChange={(e) => setCoverageRadius(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value={500}>500m</option>
                    <option value={1000}>1km</option>
                    <option value={1500}>1.5km</option>
                    <option value={2000}>2km</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Peta Sebaran</h2>
            <div className="text-sm text-gray-600">
              Menampilkan {filteredLocations.length} dari {locations.length} lokasi
            </div>
          </div>
          
          <NetworkMap
            locations={filteredLocations}
            height="600px"
            center={[-6.2088, 106.8456]}
            zoom={12}
            showCoverage={showCoverage}
            coverageRadius={coverageRadius}
          />
        </div>
      </div>
    </Layout>
  );
};

export default NetworkMapPage;