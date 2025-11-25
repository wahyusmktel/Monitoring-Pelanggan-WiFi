import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Edit, Trash2, MapPin, Wifi, Router, Search, X } from 'lucide-react';

interface OLT {
  id: string;
  name: string;
  ipAddress: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive' | 'maintenance';
  ports: number;
  usedPorts: number;
  brand: string;
  model: string;
  description?: string;
}

const OLTPage: React.FC = () => {
  const [olts, setOlts] = useState<OLT[]>([
    {
      id: '1',
      name: 'OLT-Central-01',
      ipAddress: '192.168.1.10',
      location: 'Jl. Merdeka No. 1, Jakarta',
      latitude: -6.2088,
      longitude: 106.8456,
      status: 'active',
      ports: 128,
      usedPorts: 85,
      brand: 'Huawei',
      model: 'MA5800-X17',
      description: 'OLT utama untuk area pusat Jakarta'
    },
    {
      id: '2',
      name: 'OLT-North-02',
      ipAddress: '192.168.1.11',
      location: 'Jl. Sudirman No. 45, Jakarta',
      latitude: -6.2024,
      longitude: 106.8205,
      status: 'active',
      ports: 64,
      usedPorts: 42,
      brand: 'ZTE',
      model: 'C300',
      description: 'OLT untuk area bisnis Jakarta'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingOlt, setEditingOlt] = useState<OLT | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showMap, setShowMap] = useState(false);

  const [formData, setFormData] = useState<Partial<OLT>>({
    name: '',
    ipAddress: '',
    location: '',
    latitude: 0,
    longitude: 0,
    status: 'active',
    ports: 128,
    usedPorts: 0,
    brand: '',
    model: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingOlt) {
      // Update existing OLT
      setOlts(prev => prev.map(olt => 
        olt.id === editingOlt.id 
          ? { ...olt, ...formData } as OLT
          : olt
      ));
    } else {
      // Add new OLT
      const newOlt: OLT = {
        id: Date.now().toString(),
        name: formData.name || '',
        ipAddress: formData.ipAddress || '',
        location: formData.location || '',
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
        status: formData.status || 'active',
        ports: formData.ports || 128,
        usedPorts: formData.usedPorts || 0,
        brand: formData.brand || '',
        model: formData.model || '',
        description: formData.description
      };
      setOlts(prev => [...prev, newOlt]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ipAddress: '',
      location: '',
      latitude: 0,
      longitude: 0,
      status: 'active',
      ports: 128,
      usedPorts: 0,
      brand: '',
      model: '',
      description: ''
    });
    setShowForm(false);
    setEditingOlt(null);
  };

  const handleEdit = (olt: OLT) => {
    setEditingOlt(olt);
    setFormData(olt);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus OLT ini?')) {
      setOlts(prev => prev.filter(olt => olt.id !== id));
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

  const filteredOlts = olts.filter(olt => {
    const matchesSearch = olt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         olt.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         olt.ipAddress.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || olt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openGoogleMaps = (latitude: number, longitude: number) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen OLT</h1>
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
              Tambah OLT
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari OLT</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nama, Lokasi, atau IP Address..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
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
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* OLT Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredOlts.map((olt) => (
            <div key={olt.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Router className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{olt.name}</h3>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(olt.status)}`}>
                  {getStatusText(olt.status)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">IP:</span> {olt.ipAddress}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Lokasi:</span> {olt.location}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Brand:</span> {olt.brand} {olt.model}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Port:</span> {olt.usedPorts}/{olt.ports} digunakan
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(olt.usedPorts / olt.ports) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => openGoogleMaps(olt.latitude, olt.longitude)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Lihat Lokasi
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(olt)}
                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(olt.id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOlts.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Router className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data OLT</h3>
            <p className="text-gray-600">Tambahkan data OLT untuk memulai.</p>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingOlt ? 'Edit OLT' : 'Tambah OLT Baru'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama OLT *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: OLT-Central-01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IP Address *</label>
                      <input
                        type="text"
                        required
                        value={formData.ipAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, ipAddress: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: 192.168.1.10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi *</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Jl. Merdeka No. 1, Jakarta"
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
                        placeholder="Contoh: -6.2088"
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
                        placeholder="Contoh: 106.8456"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                      <input
                        type="text"
                        required
                        value={formData.brand}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: Huawei"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                      <input
                        type="text"
                        required
                        value={formData.model}
                        onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: MA5800-X17"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as OLT['status'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Non-Aktif</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Port *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.ports}
                        onChange={(e) => setFormData(prev => ({ ...prev, ports: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Port Terpakai *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max={formData.ports}
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
                      {editingOlt ? 'Update' : 'Simpan'}
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
                  <h2 className="text-2xl font-bold text-gray-900">Peta Lokasi OLT</h2>
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
                    <p className="text-gray-600 mb-4">Peta Interaktif Lokasi OLT</p>
                    <div className="space-y-2">
                      {olts.map((olt) => (
                        <button
                          key={olt.id}
                          onClick={() => openGoogleMaps(olt.latitude, olt.longitude)}
                          className="block w-full text-left px-4 py-2 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium">{olt.name}</span>
                            <span className="text-gray-500 ml-2">- {olt.location}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Klik tombol di atas untuk membuka lokasi di Google Maps</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OLTPage;