import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Edit, Trash2, Search, User, MapPin, Network, Package, CheckCircle, XCircle } from 'lucide-react';
import MapPicker from '@/components/MapPicker';

// Interface untuk Lokasi
interface Location {
  lat: number;
  lng: number;
  address?: string;
}

// Interface untuk ODP (akan diambil dari data ODP)
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
  description?: string;
  installationDate: string;
  customerCount: number;
  coordinates: Location;
}

// Interface untuk Paket Layanan
interface Package {
  id: string;
  name: string;
  speed: string;
  price: number;
  description: string;
}

// Interface untuk Pelanggan
interface Customer {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  odpId: string;
  odpName: string;
  odcPort: number;
  packageId: string;
  packageName: string;
  monthlyFee: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  registrationDate: string;
  activationDate?: string;
  notes?: string;
  coordinates: Location;
}

const Customers: React.FC = () => {
  // Data ODP (simulasi dari halaman ODP)
  const [odps] = useState<ODP[]>([
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
      installationDate: '2023-01-01',
      customerCount: 6,
      coordinates: {
        lat: -6.2088,
        lng: 106.8456,
        address: 'Jl. Gatot Subroto Kav. 1A, Jakarta'
      }
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
      type: 'distribution',
      installationDate: '2023-01-15',
      customerCount: 3,
      coordinates: {
        lat: -6.2255,
        lng: 106.8292,
        address: 'Jl. HR Rasuna Said Kav. 5B, Jakarta'
      }
    }
  ]);

  // Data Paket Layanan
  const [packages] = useState<Package[]>([
    {
      id: '1',
      name: 'Paket Basic',
      speed: '10 Mbps',
      price: 150000,
      description: 'Internet cepat untuk kebutuhan dasar'
    },
    {
      id: '2',
      name: 'Paket Standard',
      speed: '20 Mbps',
      price: 250000,
      description: 'Internet stabil untuk keluarga'
    },
    {
      id: '3',
      name: 'Paket Premium',
      speed: '50 Mbps',
      price: 400000,
      description: 'Internet super cepat untuk profesional'
    },
    {
      id: '4',
      name: 'Paket Ultra',
      speed: '100 Mbps',
      price: 650000,
      description: 'Internet ultra cepat untuk gamer dan streamer'
    }
  ]);

  // Data Pelanggan
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      customerId: 'CUST-001',
      name: 'Budi Santoso',
      email: 'budi@email.com',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 10, Jakarta',
      odpId: '1',
      odpName: 'ODP-Central-01A',
      odcPort: 3,
      packageId: '2',
      packageName: 'Paket Standard',
      monthlyFee: 250000,
      status: 'active',
      registrationDate: '2023-01-15',
      activationDate: '2023-01-20',
      coordinates: {
        lat: -6.2095,
        lng: 106.8465,
        address: 'Jl. Merdeka No. 10, Jakarta'
      }
    },
    {
      id: '2',
      customerId: 'CUST-002',
      name: 'Siti Nurhaliza',
      email: 'siti@email.com',
      phone: '081298765432',
      address: 'Jl. Sudirman No. 45, Jakarta',
      odpId: '2',
      odpName: 'ODP-North-01B',
      odcPort: 1,
      packageId: '3',
      packageName: 'Paket Premium',
      monthlyFee: 400000,
      status: 'active',
      registrationDate: '2023-02-10',
      activationDate: '2023-02-15',
      coordinates: {
        lat: -6.2265,
        lng: 106.8285,
        address: 'Jl. Sudirman No. 45, Jakarta'
      }
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOdp, setFilterOdp] = useState<string>('all');

  // State untuk form
  const [formData, setFormData] = useState<Partial<Customer>>({
    customerId: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    odpId: '',
    odpName: '',
    odcPort: 1,
    packageId: '',
    packageName: '',
    monthlyFee: 0,
    status: 'pending',
    registrationDate: new Date().toISOString().split('T')[0],
    notes: '',
    coordinates: {
      lat: -6.2088,
      lng: 106.8456,
      address: ''
    }
  });

  // State untuk dropdown yang bergantung
  const [availablePorts, setAvailablePorts] = useState<number[]>([]);
  const [selectedOdpDetails, setSelectedOdpDetails] = useState<ODP | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi ODP selection
    if (!formData.odpId) {
      alert('Silakan pilih ODP terlebih dahulu');
      return;
    }

    // Validasi port ODP
    if (!formData.odcPort) {
      alert('Silakan pilih port ODP terlebih dahulu');
      return;
    }

    // Validasi paket
    if (!formData.packageId) {
      alert('Silakan pilih paket layanan terlebih dahulu');
      return;
    }

    // Dapatkan detail ODP dan Paket yang dipilih
    const selectedOdp = odps.find(odp => odp.id === formData.odpId);
    const selectedPackage = packages.find(pkg => pkg.id === formData.packageId);
    
    if (!selectedOdp || !selectedPackage) {
      alert('ODP atau Paket yang dipilih tidak valid');
      return;
    }

    // Cek apakah port sudah digunakan
    const isPortUsed = customers.some(cust => 
      cust.id !== editingCustomer?.id && 
      cust.odpId === formData.odpId && 
      cust.odcPort === formData.odcPort
    );
    
    if (isPortUsed) {
      alert(`Port ${formData.odcPort} di ODP ${selectedOdp.name} sudah digunakan oleh pelanggan lain`);
      return;
    }

    const customerData = {
      ...formData,
      odpName: selectedOdp.name,
      packageName: selectedPackage.name,
      monthlyFee: selectedPackage.price
    };
    
    if (editingCustomer) {
      // Update existing customer
      setCustomers(prev => prev.map(customer => 
        customer.id === editingCustomer.id 
          ? { ...customer, ...customerData } as Customer
          : customer
      ));
    } else {
      // Add new customer
      const newCustomer: Customer = {
        id: Date.now().toString(),
        customerId: customerData.customerId || `CUST-${String(customers.length + 1).padStart(3, '0')}`,
        name: customerData.name || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
        address: customerData.address || '',
        odpId: customerData.odpId || '',
        odpName: customerData.odpName || selectedOdp.name,
        odcPort: customerData.odcPort || 1,
        packageId: customerData.packageId || '',
        packageName: customerData.packageName || selectedPackage.name,
        monthlyFee: customerData.monthlyFee || selectedPackage.price,
        status: customerData.status || 'pending',
        registrationDate: customerData.registrationDate || new Date().toISOString().split('T')[0],
        notes: customerData.notes,
        coordinates: customerData.coordinates || { lat: -6.2088, lng: 106.8456 }
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      odpId: '',
      odpName: '',
      odcPort: 1,
      packageId: '',
      packageName: '',
      monthlyFee: 0,
      status: 'pending',
      registrationDate: new Date().toISOString().split('T')[0],
      notes: '',
      coordinates: {
        lat: -6.2088,
        lng: 106.8456,
        address: ''
      }
    });
    setAvailablePorts([]);
    setSelectedOdpDetails(null);
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    
    // Set available ports dan detail ODP saat editing
    if (customer.odpId) {
      const odp = odps.find(o => o.id === customer.odpId);
      if (odp) {
        const ports = Array.from({ length: odp.capacity }, (_, i) => i + 1);
        setAvailablePorts(ports);
        setSelectedOdpDetails(odp);
      }
    }
    
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    }
  };

  const handleOdpChange = (odpId: string) => {
    const selectedOdp = odps.find(odp => odp.id === odpId);
    if (selectedOdp) {
      // Generate available ports based on ODP capacity
      const ports = Array.from({ length: selectedOdp.capacity }, (_, i) => i + 1);
      setAvailablePorts(ports);
      setSelectedOdpDetails(selectedOdp);
      
      setFormData(prev => ({
        ...prev,
        odpId,
        odpName: selectedOdp.name,
        odcPort: 1, // Reset to port 1 when ODP changes
        coordinates: selectedOdp.coordinates // Set location to ODP coordinates
      }));
    } else {
      setAvailablePorts([]);
      setSelectedOdpDetails(null);
      setFormData(prev => ({
        ...prev,
        odpId: '',
        odpName: '',
        odcPort: 1
      }));
    }
  };

  const handlePackageChange = (packageId: string) => {
    const selectedPackage = packages.find(pkg => pkg.id === packageId);
    if (selectedPackage) {
      setFormData(prev => ({
        ...prev,
        packageId,
        packageName: selectedPackage.name,
        monthlyFee: selectedPackage.price
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Non-Aktif';
      case 'pending': return 'Pending';
      case 'suspended': return 'Suspended';
      default: return status;
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         customer.odpName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    const matchesOdp = filterOdp === 'all' || customer.odpId === filterOdp;
    return matchesSearch && matchesStatus && matchesOdp;
  });

  const openGoogleMaps = (address: string) => {
    window.open(`https://www.google.com/maps?q=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Pelanggan</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Aktivasi Pelanggan Baru
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari Pelanggan</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nama, ID, Telepon, atau ODP..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter ODP</label>
              <select
                value={filterOdp}
                onChange={(e) => setFilterOdp(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="pending">Pending</option>
                <option value="inactive">Non-Aktif</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterOdp('all');
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Customer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <User className="w-6 h-6 text-blue-600 mr-2" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-500">{customer.customerId}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                  {getStatusText(customer.status)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Network className="w-4 h-4 mr-2" />
                  <span className="font-medium">ODP:</span>
                  <span className="ml-1">{customer.odpName}</span>
                  <span className="ml-2 text-blue-600 font-medium">(Port {customer.odcPort})</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="w-4 h-4 mr-2" />
                  <span className="font-medium">Paket:</span>
                  <span className="ml-1">{customer.packageName}</span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Telepon:</span> {customer.phone}
                </p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span><span className="font-medium">Biaya:</span> Rp {customer.monthlyFee.toLocaleString()}</span>
                  <span><span className="font-medium">Daftar:</span> {customer.registrationDate}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openGoogleMaps(customer.address)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Google Maps
                  </button>
                  <button
                    onClick={() => alert(`Koordinat: ${customer.coordinates.lat.toFixed(6)}, ${customer.coordinates.lng.toFixed(6)}`)}
                    className="text-green-600 hover:text-green-800 text-sm flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Koordinat
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data pelanggan</h3>
            <p className="text-gray-600">Tambahkan pelanggan baru untuk memulai.</p>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingCustomer ? 'Edit Pelanggan' : 'Aktivasi Pelanggan Baru'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Pelanggan</label>
                      <input
                        type="text"
                        value={formData.customerId}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: CUST-001 (Opsional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nama lengkap pelanggan"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@contoh.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telepon *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="081234567890"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Alamat lengkap instalasi"
                    />
                  </div>

                  {/* Peta Lokasi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi di Peta</label>
                    <MapPicker
                      value={formData.coordinates}
                      onChange={(location) => setFormData(prev => ({ 
                        ...prev, 
                        coordinates: location,
                        address: location.address || prev.address || ''
                      }))}
                      height="300px"
                      center={[-6.2088, 106.8456]}
                      zoom={13}
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Jaringan</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ODP *</label>
                        <select
                          required
                          value={formData.odpId}
                          onChange={(e) => handleOdpChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Pilih ODP</option>
                          {odps.map((odp) => (
                            <option key={odp.id} value={odp.id}>
                              {odp.name} - {odp.location} ({odp.usedPorts}/{odp.capacity} terpakai)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Port ODP *</label>
                        <select
                          required
                          value={formData.odcPort}
                          onChange={(e) => setFormData(prev => ({ ...prev, odcPort: parseInt(e.target.value) }))}
                          disabled={!formData.odpId}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Pilih Port</option>
                          {availablePorts.map((port) => (
                            <option key={port} value={port}>
                              Port {port}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {selectedOdpDetails && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>ODP Terpilih:</strong> {selectedOdpDetails.name}<br/>
                          <strong>Lokasi:</strong> {selectedOdpDetails.location}<br/>
                          <strong>Kapasitas:</strong> {selectedOdpDetails.usedPorts}/{selectedOdpDetails.capacity} terpakai
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Paket Layanan</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paket *</label>
                        <select
                          required
                          value={formData.packageId}
                          onChange={(e) => handlePackageChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Pilih Paket</option>
                          {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} - {pkg.speed} (Rp {pkg.price.toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Customer['status'] }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Aktif</option>
                          <option value="inactive">Non-Aktif</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                    </div>

                    {formData.packageId && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg">
                        {packages.filter(pkg => pkg.id === formData.packageId).map(pkg => (
                          <div key={pkg.id}>
                            <p className="text-sm text-green-700">
                              <strong>Paket Terpilih:</strong> {pkg.name}<br/>
                              <strong>Kecepatan:</strong> {pkg.speed}<br/>
                              <strong>Biaya:</strong> Rp {pkg.price.toLocaleString()}/bulan<br/>
                              <strong>Deskripsi:</strong> {pkg.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Catatan tambahan (opsional)"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingCustomer ? 'Update' : 'Aktivasi'} Pelanggan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Customers;