import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Edit, Trash2, MapPin, Building2, Search, Network, ArrowRight, X } from 'lucide-react';

interface OLT {
  id: string;
  name: string;
  ipAddress: string;
  location: string;
  brand: string;
  model: string;
}

interface ODC {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  oltId: string;
  oltName: string;
  oltPort: number;
  capacity: number;
  usedPorts: number;
  status: 'active' | 'inactive' | 'maintenance';
  type: 'splitter' | 'distribution' | 'terminal';
  description?: string;
  installationDate: string;
}

const ODCPage: React.FC = () => {
  // Data OLT untuk relasi (simulasi data dari halaman OLT)
  const [olts] = useState<OLT[]>([
    {
      id: '1',
      name: 'OLT-Central-01',
      ipAddress: '192.168.1.10',
      location: 'Jl. Merdeka No. 1, Jakarta',
      brand: 'Huawei',
      model: 'MA5800-X17'
    },
    {
      id: '2',
      name: 'OLT-North-02',
      ipAddress: '192.168.1.11',
      location: 'Jl. Sudirman No. 45, Jakarta',
      brand: 'ZTE',
      model: 'C300'
    },
    {
      id: '3',
      name: 'OLT-South-03',
      ipAddress: '192.168.1.12',
      location: 'Jl. Thamrin No. 10, Jakarta',
      brand: 'FiberHome',
      model: 'AN5516-01'
    }
  ]);

  const [odcs, setOdcs] = useState<ODC[]>([
    {
      id: '1',
      name: 'ODC-Central-01',
      location: 'Jl. Gatot Subroto Kav. 1, Jakarta',
      latitude: -6.2155,
      longitude: 106.8319,
      oltId: '1',
      oltName: 'OLT-Central-01',
      oltPort: 1,
      capacity: 32,
      usedPorts: 24,
      status: 'active',
      type: 'distribution',
      description: 'ODC utama untuk area perkantoran',
      installationDate: '2023-01-15'
    },
    {
      id: '2',
      name: 'ODC-North-01',
      location: 'Jl. HR Rasuna Said Kav. 5, Jakarta',
      latitude: -6.2003,
      longitude: 106.8239,
      oltId: '2',
      oltName: 'OLT-North-02',
      oltPort: 3,
      capacity: 16,
      usedPorts: 12,
      status: 'active',
      type: 'splitter',
      description: 'ODC untuk area perumahan',
      installationDate: '2023-03-20'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingOdc, setEditingOdc] = useState<ODC | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOlt, setFilterOlt] = useState<string>('all');
  const [showMap, setShowMap] = useState(false);
  const [availablePorts, setAvailablePorts] = useState<number[]>([]);

  const [formData, setFormData] = useState<Partial<ODC>>({
    name: '',
    location: '',
    latitude: 0,
    longitude: 0,
    oltId: '',
    oltName: '',
    oltPort: 1,
    capacity: 32,
    usedPorts: 0,
    status: 'active',
    type: 'distribution',
    description: '',
    installationDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi OLT selection
    if (!formData.oltId) {
      alert('Silakan pilih OLT terlebih dahulu');
      return;
    }

    // Dapatkan nama OLT berdasarkan ID
    const selectedOlt = olts.find(olt => olt.id === formData.oltId);
    if (!selectedOlt) {
      alert('OLT yang dipilih tidak valid');
      return;
    }

    const odcData = {
      ...formData,
      oltName: selectedOlt.name,
      oltPort: formData.oltPort || 1
    };
    
    if (editingOdc) {
      // Update existing ODC
      setOdcs(prev => prev.map(odc => 
        odc.id === editingOdc.id 
          ? { ...odc, ...odcData } as ODC
          : odc
      ));
    } else {
      // Add new ODC
      const newOdc: ODC = {
        id: Date.now().toString(),
        name: odcData.name || '',
        location: odcData.location || '',
        latitude: odcData.latitude || 0,
        longitude: odcData.longitude || 0,
        oltId: odcData.oltId || '',
        oltName: odcData.oltName || selectedOlt.name,
        oltPort: odcData.oltPort || 1,
        capacity: odcData.capacity || 32,
        usedPorts: odcData.usedPorts || 0,
        status: odcData.status || 'active',
        type: odcData.type || 'distribution',
        description: odcData.description,
        installationDate: odcData.installationDate || new Date().toISOString().split('T')[0]
      };
      setOdcs(prev => [...prev, newOdc]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      latitude: 0,
      longitude: 0,
      oltId: '',
      oltName: '',
      oltPort: 1,
      capacity: 32,
      usedPorts: 0,
      status: 'active',
      type: 'distribution',
      description: '',
      installationDate: new Date().toISOString().split('T')[0]
    });
    setAvailablePorts([]);
    setShowForm(false);
    setEditingOdc(null);
  };

  const handleEdit = (odc: ODC) => {
    setEditingOdc(odc);
    setFormData(odc);
    // Set available ports when editing
    const ports = Array.from({ length: 16 }, (_, i) => i + 1);
    setAvailablePorts(ports);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus ODC ini?')) {
      setOdcs(prev => prev.filter(odc => odc.id !== id));
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
      case 'splitter': return 'Splitter';
      case 'distribution': return 'Distribusi';
      case 'terminal': return 'Terminal';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'splitter': return 'bg-blue-100 text-blue-800';
      case 'distribution': return 'bg-purple-100 text-purple-800';
      case 'terminal': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOdcs = odcs.filter(odc => {
    const matchesSearch = odc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         odc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         odc.oltName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || odc.status === filterStatus;
    const matchesOlt = filterOlt === 'all' || odc.oltId === filterOlt;
    return matchesSearch && matchesStatus && matchesOlt;
  });

  const openGoogleMaps = (latitude: number, longitude: number) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  const handleOltChange = (oltId: string) => {
    const selectedOlt = olts.find(olt => olt.id === oltId);
    // Generate available ports (assuming OLT has 16 ports)
    const ports = Array.from({ length: 16 }, (_, i) => i + 1);
    setAvailablePorts(ports);
    setFormData(prev => ({
      ...prev,
      oltId,
      oltName: selectedOlt?.name || '',
      oltPort: 1 // Reset to port 1 when OLT changes
    }));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen ODC</h1>
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
              Tambah ODC
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari ODC</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nama, Lokasi, atau OLT..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter OLT</label>
              <select
                value={filterOlt}
                onChange={(e) => setFilterOlt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua OLT</option>
                {olts.map((olt) => (
                  <option key={olt.id} value={olt.id}>
                    {olt.name}
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
                  setFilterOlt('all');
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* ODC Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredOdcs.map((odc) => (
            <div key={odc.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Building2 className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{odc.name}</h3>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(odc.status)}`}>
                  {getStatusText(odc.status)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Network className="w-4 h-4 mr-2" />
                  <span className="font-medium">OLT:</span>
                  <span className="ml-1">{odc.oltName}</span>
                  <span className="ml-2 text-blue-600 font-medium">(Port {odc.oltPort})</span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Lokasi:</span> {odc.location}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <span className="font-medium">Kapasitas:</span> {odc.usedPorts}/{odc.capacity}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(odc.type)}`}>
                    {getTypeText(odc.type)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(odc.usedPorts / odc.capacity) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Instalasi:</span> {odc.installationDate}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => openGoogleMaps(odc.latitude, odc.longitude)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Lihat Lokasi
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(odc)}
                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(odc.id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOdcs.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data ODC</h3>
            <p className="text-gray-600">Tambahkan data ODC untuk memulai.</p>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingOdc ? 'Edit ODC' : 'Tambah ODC Baru'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama ODC *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: ODC-Central-01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">OLT *</label>
                      <select
                        required
                        value={formData.oltId}
                        onChange={(e) => handleOltChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih OLT</option>
                        {olts.map((olt) => (
                          <option key={olt.id} value={olt.id}>
                            {olt.name} - {olt.location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Port OLT *</label>
                      <select
                        required
                        value={formData.oltPort}
                        onChange={(e) => setFormData(prev => ({ ...prev, oltPort: parseInt(e.target.value) }))}
                        disabled={!formData.oltId}
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
                      placeholder="Contoh: Jl. Gatot Subroto Kav. 1, Jakarta"
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
                        placeholder="Contoh: -6.2155"
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
                        placeholder="Contoh: 106.8319"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ODC['status'] }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ODC['type'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="splitter">Splitter</option>
                        <option value="distribution">Distribusi</option>
                        <option value="terminal">Terminal</option>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {editingOdc ? 'Update' : 'Simpan'}
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
                  <h2 className="text-2xl font-bold text-gray-900">Peta Lokasi ODC</h2>
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
                    <p className="text-gray-600 mb-4">Peta Interaktif Lokasi ODC</p>
                    <div className="space-y-2">
                      {filteredOdcs.map((odc) => (
                        <button
                          key={odc.id}
                          onClick={() => openGoogleMaps(odc.latitude, odc.longitude)}
                          className="block w-full text-left px-4 py-2 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="font-medium">{odc.name}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <ArrowRight className="w-3 h-3 mr-1" />
                              <span>{odc.oltName}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{odc.location}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Klik tombol di atas untuk membuka lokasi di Google Maps</p>
                  <p className="mt-2 font-medium">Total ODC: {filteredOdcs.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ODCPage;