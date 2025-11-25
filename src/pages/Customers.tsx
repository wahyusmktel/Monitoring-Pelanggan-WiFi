import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Edit, Trash2, Search, User, MapPin, Network, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import MapPicker from '@/components/MapPicker';
import { customerService, Customer, CustomerCreate, CustomerUpdate } from '@/services/customerService';
import { infrastructureService } from '@/services/infrastructureService';
import { servicesService } from '@/services/servicesService';

// Interface untuk ODP (dari API)
interface ODP {
  id: number;
  name: string;
  location: string;
  total_ports: number;
  used_ports: number;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
}

// Interface untuk Paket Layanan (dari API)
interface Package {
  id: number;
  name: string;
  speed: string;
  price: number;
  description?: string | null;
}

const Customers: React.FC = () => {
  // State untuk data dari API
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [odps, setOdps] = useState<ODP[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  
  // State untuk loading dan error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // State untuk form dan UI
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOdp, setFilterOdp] = useState<string>('all');

  // State untuk form
  const [formData, setFormData] = useState<Partial<CustomerCreate>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    latitude: null,
    longitude: null,
    odp_id: null,
    package_id: null,
    status: 'pending',
    installation_date: new Date().toISOString().split('T')[0],
    notes: '',
    is_active: true,
  });

  // State untuk dropdown yang bergantung
  const [availablePorts, setAvailablePorts] = useState<number[]>([]);
  const [selectedOdpDetails, setSelectedOdpDetails] = useState<ODP | null>(null);

  // Fetch data dari API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch semua data secara parallel
      const [customersData, odpsData, packagesData] = await Promise.all([
        customerService.getCustomers(),
        infrastructureService.getODPs(),
        servicesService.getPackages(),
      ]);
      
      setCustomers(customersData);
      setOdps(odpsData);
      setPackages(packagesData);
    } catch (err) {
      setError('Gagal memuat data dari server. Silakan coba lagi.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      alert('Semua field wajib diisi!');
      return;
    }

    // Validasi ODP selection
    if (!formData.odp_id) {
      alert('Silakan pilih ODP terlebih dahulu');
      return;
    }

    // Validasi paket
    if (!formData.package_id) {
      alert('Silakan pilih paket layanan terlebih dahulu');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingCustomer) {
        // Update existing customer
        const updatedCustomer = await customerService.updateCustomer(editingCustomer.id!, formData);
        setCustomers(prev => prev.map(customer => 
          customer.id === editingCustomer.id ? updatedCustomer : customer
        ));
      } else {
        // Create new customer
        const newCustomer = await customerService.createCustomer(formData as CustomerCreate);
        setCustomers(prev => [...prev, newCustomer]);
      }
      
      resetForm();
      alert(editingCustomer ? 'Pelanggan berhasil diupdate!' : 'Pelanggan baru berhasil ditambahkan!');
    } catch (err) {
      console.error('Error submitting customer:', err);
      alert('Gagal menyimpan data pelanggan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      latitude: null,
      longitude: null,
      odp_id: null,
      package_id: null,
      status: 'pending',
      installation_date: new Date().toISOString().split('T')[0],
      notes: '',
      is_active: true,
    });
    setAvailablePorts([]);
    setSelectedOdpDetails(null);
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      latitude: customer.latitude,
      longitude: customer.longitude,
      odp_id: customer.odp_id,
      package_id: customer.package_id,
      status: customer.status,
      installation_date: customer.installation_date,
      notes: customer.notes,
      is_active: customer.is_active,
    });
    
    // Set available ports dan detail ODP saat editing
    if (customer.odp_id) {
      const odp = odps.find(o => o.id === customer.odp_id);
      if (odp) {
        const ports = Array.from({ length: odp.total_ports }, (_, i) => i + 1);
        setAvailablePorts(ports);
        setSelectedOdpDetails(odp);
      }
    }
    
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
      try {
        await customerService.deleteCustomer(id);
        setCustomers(prev => prev.filter(customer => customer.id !== id));
        alert('Pelanggan berhasil dihapus!');
      } catch (err) {
        console.error('Error deleting customer:', err);
        alert('Gagal menghapus pelanggan. Silakan coba lagi.');
      }
    }
  };

  const handleOdpChange = (odpId: number | null) => {
    if (odpId) {
      const selectedOdp = odps.find(odp => odp.id === odpId);
      if (selectedOdp) {
        // Generate available ports based on ODP capacity
        const ports = Array.from({ length: selectedOdp.total_ports }, (_, i) => i + 1);
        setAvailablePorts(ports);
        setSelectedOdpDetails(selectedOdp);
        
        setFormData(prev => ({
          ...prev,
          odp_id: odpId,
          latitude: selectedOdp.latitude,
          longitude: selectedOdp.longitude,
        }));
      }
    } else {
      setAvailablePorts([]);
      setSelectedOdpDetails(null);
      setFormData(prev => ({
        ...prev,
        odp_id: null,
        latitude: null,
        longitude: null,
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

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    const matchesOdp = filterOdp === 'all' || customer.odp_id === parseInt(filterOdp);
    
    return matchesSearch && matchesStatus && matchesOdp;
  });

  const openGoogleMaps = (address: string) => {
    window.open(`https://www.google.com/maps?q=${encodeURIComponent(address)}`, '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat data pelanggan...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-red-800">Terjadi Kesalahan</h3>
            </div>
            <p className="mt-2 text-red-700">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
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
          <h1 className="text-3xl font-bold text-gray-900">Data Pelanggan</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Aktivasi Pelanggan Baru
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Non-Aktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>
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
                  placeholder="Nama, email, telepon, atau alamat..."
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
                    <p className="text-sm text-gray-500">{customer.email}</p>
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
                  <span className="ml-1">
                    {odps.find(o => o.id === customer.odp_id)?.name || 'Tidak diketahui'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="w-4 h-4 mr-2" />
                  <span className="font-medium">Paket:</span>
                  <span className="ml-1">
                    {packages.find(p => p.id === customer.package_id)?.name || 'Tidak diketahui'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Telepon:</span> {customer.phone}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Alamat:</span> {customer.address}
                </p>
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
                  {customer.latitude && customer.longitude && (
                    <button
                      onClick={() => alert(`Koordinat: ${customer.latitude?.toFixed(6)}, ${customer.longitude?.toFixed(6)}`)}
                      className="text-green-600 hover:text-green-800 text-sm flex items-center"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Koordinat
                    </button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id!)}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telepon *</label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={formData.status || 'pending'}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Non-Aktif</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ODP *</label>
                      <select
                        value={formData.odp_id || ''}
                        onChange={(e) => handleOdpChange(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Pilih ODP</option>
                        {odps.map((odp) => (
                          <option key={odp.id} value={odp.id}>
                            {odp.name} - {odp.location}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Paket Layanan *</label>
                      <select
                        value={formData.package_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, package_id: e.target.value ? parseInt(e.target.value) : null }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Pilih Paket</option>
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} - {pkg.speed} (Rp {pkg.price.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Catatan tambahan..."
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={submitting}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      disabled={submitting}
                    >
                      {submitting ? 'Menyimpan...' : (editingCustomer ? 'Update' : 'Simpan')}
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