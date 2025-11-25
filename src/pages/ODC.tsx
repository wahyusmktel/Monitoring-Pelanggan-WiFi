import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Edit, Trash2, MapPin, Building2, Search, Network, ArrowRight, X } from 'lucide-react';
import { odcService, ODC as ODCType, ODCCreate, ODCUpdate } from '@/services/odcService';
import { oltService, OLT } from '@/services/oltService';
import { toast } from 'sonner';

// Remove local interfaces since we're using the API interfaces

const ODCPage: React.FC = () => {
  const [olts, setOlts] = useState<OLT[]>([]);
  const [odcs, setOdcs] = useState<ODCType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingOdc, setEditingOdc] = useState<ODCType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOlt, setFilterOlt] = useState<string>('all');
  const [showMap, setShowMap] = useState(false);

  const [formData, setFormData] = useState<Partial<ODCCreate>>({
    name: '',
    location: '',
    latitude: null,
    longitude: null,
    olt_id: 0,
    capacity: 32,
    used_capacity: 0,
    status: 'active',
  });

  // Fetch ODC data
  const fetchOdcs = async () => {
    try {
      setLoading(true);
      const response = await odcService.getAll(
        currentPage, 
        12, 
        searchTerm, 
        filterStatus === 'all' ? undefined : filterStatus,
        filterOlt === 'all' ? undefined : parseInt(filterOlt)
      );
      setOdcs(response.data);
      setTotalItems(response.total);
      setTotalPages(Math.ceil(response.total / response.size));
    } catch (error) {
      toast.error('Gagal memuat data ODC');
      console.error('Error fetching ODCs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch OLT data for dropdown
  const fetchOlts = async () => {
    try {
      const response = await oltService.getAll(1, 100); // Get all OLTs for dropdown
      setOlts(response.data);
    } catch (error) {
      console.error('Error fetching OLTs:', error);
    }
  };

  useEffect(() => {
    fetchOlts();
    fetchOdcs();
  }, [currentPage, searchTerm, filterStatus, filterOlt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi OLT selection
    if (!formData.olt_id) {
      toast.error('Silakan pilih OLT terlebih dahulu');
      return;
    }

    try {
      if (editingOdc) {
        // Update existing ODC
        const updateData: ODCUpdate = {
          name: formData.name,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          olt_id: formData.olt_id,
          capacity: formData.capacity,
          used_capacity: formData.used_capacity,
          status: formData.status,
        };
        
        await odcService.update(editingOdc.id, updateData);
        toast.success('ODC berhasil diperbarui');
      } else {
        // Add new ODC
        const createData: ODCCreate = {
          name: formData.name || '',
          location: formData.location || '',
          latitude: formData.latitude,
          longitude: formData.longitude,
          olt_id: formData.olt_id,
          capacity: formData.capacity || 32,
          used_capacity: formData.used_capacity || 0,
          status: formData.status || 'active',
        };
        
        await odcService.create(createData);
        toast.success('ODC berhasil ditambahkan');
      }
      
      fetchOdcs();
      resetForm();
    } catch (error) {
      toast.error(editingOdc ? 'Gagal memperbarui ODC' : 'Gagal menambahkan ODC');
      console.error('Error saving ODC:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      latitude: null,
      longitude: null,
      olt_id: 0,
      capacity: 32,
      used_capacity: 0,
      status: 'active',
    });
    setShowForm(false);
    setEditingOdc(null);
  };

  const handleEdit = (odc: ODCType) => {
    setEditingOdc(odc);
    setFormData({
      name: odc.name,
      location: odc.location,
      latitude: odc.latitude,
      longitude: odc.longitude,
      olt_id: odc.olt_id,
      capacity: odc.capacity,
      used_capacity: odc.used_capacity,
      status: odc.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus ODC ini?')) {
      try {
        await odcService.delete(id);
        toast.success('ODC berhasil dihapus');
        fetchOdcs();
      } catch (error) {
        toast.error('Gagal menghapus ODC');
        console.error('Error deleting ODC:', error);
      }
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

  // Removed getTypeText and getTypeColor functions - type field not in API

  // No need for local filtering since we're using API filtering
  const filteredOdcs = odcs;

  const openGoogleMaps = (latitude: number, longitude: number) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  // Removed handleOltChange function - not needed since we don't have oltPort in API

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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Memuat data ODC...</span>
          </div>
        )}

        {/* ODC Cards */}
        {!loading && (
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
                  <span className="ml-1">{odc.olt_name}</span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Lokasi:</span> {odc.location}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <span className="font-medium">Kapasitas:</span> {odc.used_capacity}/{odc.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(odc.used_capacity / odc.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => openGoogleMaps(odc.latitude || 0, odc.longitude || 0)}
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
        )}

        {!loading && filteredOdcs.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data ODC</h3>
            <p className="text-gray-600">Tambahkan data ODC untuk memulai.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sebelumnya
            </button>
            <span className="px-4 py-2 text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Selanjutnya
            </button>
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
                        value={formData.olt_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, olt_id: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={0}>Pilih OLT</option>
                        {olts.map((olt) => (
                          <option key={olt.id} value={olt.id}>
                            {olt.name} - {olt.location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Port OLT field removed - not in API schema */}
                  
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.latitude || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : null }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: -6.2155"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.longitude || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : null }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Non-Aktif</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
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
                        value={formData.used_capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, used_capacity: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Description field removed - not in API schema */}
                  
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
                          onClick={() => openGoogleMaps(odc.latitude || 0, odc.longitude || 0)}
                          className="block w-full text-left px-4 py-2 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="font-medium">{odc.name}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <ArrowRight className="w-3 h-3 mr-1" />
                              <span>{odc.olt_name}</span>
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