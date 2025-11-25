import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Edit, Trash2, MapPin, Box, Search, Network, ArrowRight, X } from 'lucide-react';

interface ODC {
  id: string;
  name: string;
  location: string;
  capacity: number;
  usedPorts: number;
  oltId: string;
  oltName: string;
  oltPort: number;
}

interface ODP {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  odcId: string;
  odcName: string;
  odcPort: number;
  capacity: number;
  usedPorts: number;
  status: 'active' | 'inactive' | 'maintenance';
  type: 'distribution' | 'terminal' | 'splitter';
  description?: string;
  installationDate: string;
  customerCount: number;
}

const ODPPage: React.FC = () => {
  // Data ODC untuk relasi
  const [odcs] = useState<ODC[]>([
    {
      id: '1',
      name: 'ODC-Central-01',
      location: 'Jl. Gatot Subroto Kav. 1, Jakarta',
      capacity: 32,
      usedPorts: 24,
      oltId: '1',
      oltName: 'OLT-Central-01',
      oltPort: 1
    },
    {
      id: '2',
      name: 'ODC-North-01',
      location: 'Jl. HR Rasuna Said Kav. 5, Jakarta',
      capacity: 16,
      usedPorts: 12,
      oltId: '2',
      oltName: 'OLT-North-02',
      oltPort: 3
    }
  ]);

  const [odps, setOdps] = useState<ODP[]>([
    {
      id: '1',
      name: 'ODP-Central-01A',
      location: 'Jl. Gatot Subroto Kav. 1A, Jakarta',
      latitude: -6.2154,
      longitude: 106.8320,
      odcId: '1',
      odcName: 'ODC-Central-01',
      odcPort: 1,
      capacity: 8,
      usedPorts: 6,
      status: 'active',
      type: 'distribution',
      description: 'ODP untuk area perkantoran lantai 1-5',
      installationDate: '2023-02-01',
      customerCount: 6
    },
    {
      id: '2',
      name: 'ODP-North-01B',
      location: 'Jl. HR Rasuna Said Kav. 5B, Jakarta',
      latitude: -6.2002,
      longitude: 106.8240,
      odcId: '2',
      odcName: 'ODC-North-01',
      odcPort: 2,
      capacity: 4,
      usedPorts: 3,
      status: 'active',
      type: 'terminal',
      description: 'ODP untuk rumah tinggal blok B',
      installationDate: '2023-04-15',
      customerCount: 3
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingOdp, setEditingOdp] = useState<ODP | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOdc, setFilterOdc] = useState<string>('all');
  const [showMap, setShowMap] = useState(false);
  const [availablePorts, setAvailablePorts] = useState<number[]>([]);

  const [formData, setFormData] = useState<Partial<ODP>>({
    name: '',
    location: '',
    latitude: 0,
    longitude: 0,
    odcId: '',
    odcName: '',
    odcPort: 1,
    capacity: 8,
    usedPorts: 0,
    status: 'active',
    type: 'distribution',
    description: '',
    installationDate: new Date().toISOString().split('T')[0],
    customerCount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi ODC selection
    if (!formData.odcId) {
      alert('Silakan pilih ODC terlebih dahulu');
      return;
    }

    // Dapatkan nama ODC berdasarkan ID
    const selectedOdc = odcs.find(odc => odc.id === formData.odcId);
    if (!selectedOdc) {
      alert('ODC yang dipilih tidak valid');
      return;
    }

    const odpData = {
      ...formData,
      odcName: selectedOdc.name
    };
    
    if (editingOdp) {
      // Update existing ODP
      setOdps(prev => prev.map(odp => 
        odp.id === editingOdp.id 
          ? { ...odp, ...odpData } as ODP
          : odp
      ));
    } else {
      // Add new ODP
      const newOdp: ODP = {
        id: Date.now().toString(),
        name: odpData.name || '',
        location: odpData.location || '',
        latitude: odpData.latitude || 0,
        longitude: odpData.longitude || 0,
        odcId: odpData.odcId || '',
        odcName: odpData.odcName || selectedOdc.name,
        odcPort: odpData.odcPort || 1,
        capacity: odpData.capacity || 8,
        usedPorts: odpData.usedPorts || 0,
        status: odpData.status || 'active',
        type: odpData.type || 'distribution',
        description: odpData.description,
        installationDate: odpData.installationDate || new Date().toISOString().split('T')[0],
        customerCount: odpData.customerCount || 0
      };
      setOdps(prev => [...prev, newOdp]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      latitude: 0,
      longitude: 0,
      odcId: '',
      odcName: '',
      odcPort: 1,
      capacity: 8,
      usedPorts: 0,
      status: 'active',
      type: 'distribution',
      description: '',
      installationDate: new Date().toISOString().split('T')[0],
      customerCount: 0
    });
    setAvailablePorts([]);
    setShowForm(false);
    setEditingOdp(null);
  };

  const handleEdit = (odp: ODP) => {
    setEditingOdp(odp);
    setFormData(odp);
    // Set available ports when editing (assuming ODC has 32 ports max)
    const ports = Array.from({ length: 32 }, (_, i) => i + 1);
    setAvailablePorts(ports);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus ODP ini?')) {
      setOdps(prev => prev.filter(odp => odp.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Non-Aktif';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'distribution': return 'Distribusi';
      case 'terminal': return 'Terminal';
      case 'splitter': return 'Splitter';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'distribution': return 'bg-purple-100 text-purple-800';
      case 'terminal': return 'bg-orange-100 text-orange-800';
      case 'splitter': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOdps = odps.filter(odp => {
    const matchesSearch = odp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         odp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         odp.odcName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || odp.status === filterStatus;
    const matchesOdc = filterOdc === 'all' || odp.odcId === filterOdc;
    return matchesSearch && matchesStatus && matchesOdc;
  });

  const openGoogleMaps = (latitude: number, longitude: number) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  const handleOdcChange = (odcId: string) => {
    const selectedOdc = odcs.find(odc => odc.id === odcId);
    // Generate available ports (assuming ODC has 32 ports max)
    const ports = Array.from({ length: 32 }, (_, i) => i + 1);
    setAvailablePorts(ports);
    setFormData(prev => ({
      ...prev,
      odcId,
      odcName: selectedOdc?.name || '',
      odcPort: 1 // Reset to port 1 when ODC changes
    }));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen ODP</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowMap(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Lihat Peta
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah ODP
            </button>
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
                  placeholder="Nama, Lokasi, atau ODC..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter ODC</label>
              <select
                value={filterOdc}
                onChange={(e) => setFilterOdc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua ODC</option>
                {odcs.map((odc) => (
                  <option key={odc.id} value={odc.id}>
                    {odc.name}
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
                <option value="inactive">Non-Aktif</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterOdc('all');
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* ODP Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredOdps.map((odp) => (
            <div key={odp.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Box className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{odp.name}</h3>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(odp.status)}`}>
                  {getStatusText(odp.status)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Network className="w-4 h-4 mr-2" />
                  <span className="font-medium">ODC:</span>
                  <span className="ml-1">{odp.odcName}</span>
                  <span className="ml-2 text-blue-600 font-medium">(Port {odp.odcPort})</span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Lokasi:</span> {odp.location}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <span className="font-medium">Kapasitas:</span> {odp.usedPorts}/{odp.capacity}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(odp.type)}`}>
                    {getTypeText(odp.type)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(odp.usedPorts / odp.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span><span className="font-medium">Pelanggan:</span> {odp.customerCount}</span>
                  <span><span className="font-medium">Instalasi:</span> {odp.installationDate}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => openGoogleMaps(odp.latitude, odp.longitude)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Lihat Lokasi
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(odp)}
                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(odp.id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOdps.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Box className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data ODP</h3>
            <p className="text-gray-600">Tambahkan data ODP untuk memulai.</p>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingOdp ? 'Edit ODP' : 'Tambah ODP Baru'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama ODP *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: ODP-Central-01A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ODC *</label>
                      <select
                        required
                        value={formData.odcId}
                        onChange={(e) => handleOdcChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih ODC</option>
                        {odcs.map((odc) => (
                          <option key={odc.id} value={odc.id}>
                            {odc.name} - {odc.location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Port ODC *</label>
                      <select
                        required
                        value={formData.odcPort}
                        onChange={(e) => setFormData(prev => ({ ...prev, odcPort: parseInt(e.target.value) }))}
                        disabled={!formData.odcId}
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
                    <div></div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi *</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Jl. Gatot Subroto Kav. 1A, Jakarta"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                      <input
                        type="number"
                        required
                        step="0.000001"
                        value={formData.latitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: -6.2154"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                      <input
                        type="number"
                        required
                        step="0.000001"
                        value={formData.longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: 106.8320"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ODP['status'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Non-Aktif</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipe *</label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ODP['type'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="distribution">Distribusi</option>
                        <option value="terminal">Terminal</option>
                        <option value="splitter">Splitter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Instalasi *</label>
                      <input
                        type="date"
                        required
                        value={formData.installationDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, installationDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Port *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Port Terpakai *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max={formData.capacity}
                        value={formData.usedPorts}
                        onChange={(e) => setFormData(prev => ({ ...prev, usedPorts: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Pelanggan *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.customerCount}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerCount: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Deskripsi tambahan (opsional)"
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
                      {editingOdp ? 'Update' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Map Modal */}
        {showMap && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Peta Lokasi ODP</h2>
                  <button
                    onClick={() => setShowMap(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-4">Peta Interaktif Lokasi ODP</p>
                    <div className="space-y-2">
                      {filteredOdps.map((odp) => (
                        <button
                          key={odp.id}
                          onClick={() => openGoogleMaps(odp.latitude, odp.longitude)}
                          className="block w-full text-left px-4 py-2 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="font-medium">{odp.name}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <ArrowRight className="w-3 h-3 mr-1" />
                              <span>{odp.odcName}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{odp.location}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Klik tombol di atas untuk membuka lokasi di Google Maps</p>
                  <p className="mt-2 font-medium">Total ODP: {filteredOdps.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ODPPage;