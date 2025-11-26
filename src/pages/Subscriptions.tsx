import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Edit, Trash2, Search, Filter, Package as PackageIcon, DollarSign, Wifi, Users, Clock, AlertCircle } from 'lucide-react';
import { servicesService, PackageCreate } from '@/services/servicesService'; // Import service
import { toast } from 'sonner'; // Pakai toast biar keren

// Interface disamakan dengan backend response
interface Package {
  id: number; // Backend ID number
  name: string;
  description: string;
  speed: number;
  quota: number;
  price: number;
  duration: number;
  is_active: boolean; // Backend pake snake_case
  features: string[];
  category: 'basic' | 'standard' | 'premium' | 'enterprise';
  max_devices: number; // Backend snake_case
  setup_fee: number; // Backend snake_case
  color?: string;
}

// Interface untuk Form
interface PackageForm {
  name: string;
  description: string;
  speed: number;
  quota: number;
  price: number;
  duration: number;
  features: string[];
  category: 'basic' | 'standard' | 'premium' | 'enterprise';
  maxDevices: number;
  setupFee: number;
}

const Subscriptions: React.FC = () => {
  // State untuk data paket
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true); // Loading state

  // State untuk form dan modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'speed'>('name');

  // State untuk form
  const [formData, setFormData] = useState<PackageForm>({
    name: '',
    description: '',
    speed: 10,
    quota: 0,
    price: 150000,
    duration: 30,
    features: [''],
    category: 'basic',
    maxDevices: 3,
    setupFee: 50000
  });

  // State untuk error
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch Data dari API saat komponen dimuat
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await servicesService.getPackages();
      
      // Mapping data backend (snake_case) ke frontend (kalau perlu, atau pakai langsung)
      // Karena di Interface Package di atas sudah kita sesuaikan, bisa langsung set
      // Tapi pastikan tipe datanya cocok.
      // Backend return: id, name, ..., is_active, max_devices
      // Frontend butuh: color (opsional, ada di append backend)
      
      setPackages(data as unknown as Package[]); // Type assertion aman karena strukturnya mirip
    } catch (error) {
      toast.error('Gagal memuat data paket');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Filter dan search packages
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (pkg.description ? pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    const matchesCategory = filterCategory === 'all' || pkg.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && pkg.is_active) ||
                          (filterStatus === 'inactive' && !pkg.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'speed':
        return a.speed - b.speed;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Validasi form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama paket wajib diisi';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi wajib diisi';
    }
    
    if (formData.speed <= 0) {
      newErrors.speed = 'Kecepatan harus lebih dari 0';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Harga harus lebih dari 0';
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = 'Durasi harus lebih dari 0 hari';
    }
    
    if (formData.maxDevices <= 0) {
      newErrors.maxDevices = 'Jumlah perangkat maksimal harus lebih dari 0';
    }
    
    if (formData.setupFee < 0) {
      newErrors.setupFee = 'Biaya setup tidak boleh negatif';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Siapkan payload sesuai struktur backend (snake_case)
    const payload = {
      name: formData.name,
      description: formData.description,
      speed: Number(formData.speed), // Perlu convert ke string sesuai interface
      quota: formData.quota, // Perlu handle number vs string conversion jika perlu
      price: formData.price,
      duration: formData.duration,
      features: formData.features.filter(f => f.trim() !== ''),
      category: formData.category,
      max_devices: Number(formData.maxDevices),
      setup_fee: Number(formData.setupFee),     // Perhatikan camelCase ke snake_case mapping di backend
      is_active: true
    };

    try {
      if (isEditing && editingPackage) {
        // @ts-ignore - Partial update properties mismatch
        await servicesService.updatePackage(editingPackage.id, payload);
        toast.success('Paket berhasil diperbarui');
      } else {
        // @ts-ignore - Type mismatch handling
        await servicesService.createPackage(payload);
        toast.success('Paket berhasil ditambahkan');
      }
      
      fetchPackages(); // Refresh data
      closeModal();
    } catch (error) {
      toast.error('Gagal menyimpan paket');
      console.error(error);
    }
  };

  // Get color based on category
  const getCategoryColor = (category: string): string => {
    const colors = {
      basic: 'blue',
      standard: 'green',
      premium: 'purple',
      enterprise: 'red'
    };
    return colors[category as keyof typeof colors] || 'blue';
  };

  // Handle edit
  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      speed: Number(pkg.speed),
      quota: pkg.quota,
      price: pkg.price,
      duration: pkg.duration,
      features: pkg.features && pkg.features.length > 0 ? pkg.features : [''],
      category: pkg.category,
      maxDevices: pkg.max_devices,
      setupFee: pkg.setup_fee
    });
    setIsEditing(true);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus paket ini?')) {
      try {
        await servicesService.deletePackage(id);
        toast.success('Paket berhasil dihapus');
        fetchPackages();
      } catch (error) {
        toast.error('Gagal menghapus paket');
      }
    }
  };

  // Toggle package status
  const togglePackageStatus = async (pkg: Package) => {
    try {
      await servicesService.updatePackage(pkg.id, {
        // @ts-ignore - partial update
        is_active: !pkg.is_active 
      });
      toast.success(`Paket ${!pkg.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchPackages();
    } catch (error) {
      toast.error('Gagal mengubah status paket');
    }
  };

  // Handle feature change
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  // Add feature
  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  // Remove feature
  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingPackage(null);
    setFormData({
      name: '',
      description: '',
      speed: 10,
      quota: 0,
      price: 150000,
      duration: 30,
      features: [''],
      category: 'basic',
      maxDevices: 3,
      setupFee: 50000
    });
    setErrors({});
  };

  // Statistics
  const totalPackages = packages.length;
  const activePackages = packages.filter(pkg => pkg.is_active).length;
  const totalRevenue = packages.reduce((sum, pkg) => sum + (pkg.is_active ? Number(pkg.price) : 0), 0);
  const avgPackagePrice = packages.length > 0 ? Math.round(packages.reduce((sum, pkg) => sum + Number(pkg.price), 0) / packages.length) : 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Paket Langganan</h1>
            <p className="text-gray-600 mt-1">Kelola paket internet dan langganan pelanggan</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah Paket
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <PackageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Paket</p>
                <p className="text-2xl font-bold text-gray-900">{totalPackages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Wifi className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paket Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{activePackages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendapatan/Bulan</p>
                <p className="text-2xl font-bold text-gray-900">Rp {totalRevenue.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Harga Rata-rata</p>
                <p className="text-2xl font-bold text-gray-900">Rp {avgPackagePrice.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari Paket</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Nama atau deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Kategori</option>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'speed')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Nama</option>
                <option value="price">Harga</option>
                <option value="speed">Kecepatan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Memuat data paket...</span>
          </div>
        ) : (
          <>
            {/* Package List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <div key={pkg.id} className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-${pkg.color || getCategoryColor(pkg.category)}-500`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pkg.category === 'basic' ? 'bg-blue-100 text-blue-800' :
                          pkg.category === 'standard' ? 'bg-green-100 text-green-800' :
                          pkg.category === 'premium' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {pkg.category.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit Paket"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Hapus Paket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Kecepatan:</span>
                        <span className="text-sm font-medium">{pkg.speed} Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Kuota:</span>
                        <span className="text-sm font-medium">{pkg.quota === 0 ? 'Unlimited' : `${pkg.quota} GB`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Perangkat:</span>
                        <span className="text-sm font-medium">{pkg.max_devices} device</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Durasi:</span>
                        <span className="text-sm font-medium">{pkg.duration} hari</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Biaya Setup:</span>
                        <span className="text-sm font-medium">Rp {Number(pkg.setup_fee).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Fitur:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {pkg.features && pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">Rp {Number(pkg.price).toLocaleString('id-ID')}</p>
                        <p className="text-sm text-gray-500">/ {pkg.duration} hari</p>
                      </div>
                      <button
                        onClick={() => togglePackageStatus(pkg)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pkg.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPackages.length === 0 && (
              <div className="text-center py-12">
                <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada paket ditemukan</h3>
                <p className="text-gray-600">Coba ubah filter pencarian atau tambahkan paket baru.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal untuk Tambah/Edit Paket */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Paket' : 'Tambah Paket Baru'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Paket *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Contoh: Paket Basic"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jelaskan keunggulan paket ini..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kecepatan (Mbps) *</label>
                  <input
                    type="number"
                    value={formData.speed}
                    onChange={(e) => setFormData({ ...formData, speed: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.speed ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                  />
                  {errors.speed && <p className="text-red-500 text-xs mt-1">{errors.speed}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kuota (GB)</label>
                  <input
                    type="number"
                    value={formData.quota}
                    onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                  <p className="text-gray-500 text-xs mt-1">0 = Unlimited</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (Hari) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                  />
                  {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perangkat Maksimal *</label>
                  <input
                    type="number"
                    value={formData.maxDevices}
                    onChange={(e) => setFormData({ ...formData, maxDevices: parseInt(e.target.value) || 1 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.maxDevices ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                  />
                  {errors.maxDevices && <p className="text-red-500 text-xs mt-1">{errors.maxDevices}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Setup (Rp) *</label>
                  <input
                    type="number"
                    value={formData.setupFee}
                    onChange={(e) => setFormData({ ...formData, setupFee: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.setupFee ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                  {errors.setupFee && <p className="text-red-500 text-xs mt-1">{errors.setupFee}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fitur Paket</label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Kecepatan tinggi"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                      disabled={formData.features.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Fitur
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Update Paket' : 'Simpan Paket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Subscriptions;