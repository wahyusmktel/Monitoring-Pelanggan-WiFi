import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Search, DollarSign, Calendar, User, CheckCircle, XCircle, Clock, Plus, Edit, FileText, Key, Printer, AlertCircle, RefreshCw } from 'lucide-react';

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
  odpPort: number;
  packageId: string;
  packageName: string;
  monthlyFee: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  registrationDate: string;
  activationDate?: string;
  notes?: string;
  internetStatus: 'online' | 'offline';
  token?: string;
  tokenExpiry?: string;
}

// Interface untuk Pembayaran
interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod: string;
  packageName: string;
  description?: string;
  token?: string;
  tokenStatus?: 'active' | 'expired' | 'unused';
  tokenExpiry?: string;
  billingMonth: number;
  billingYear: number;
}

const Payments: React.FC = () => {
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
  const [customers] = useState<Customer[]>([
    {
      id: '1',
      customerId: 'CUST001',
      name: 'Budi Santoso',
      email: 'budi@email.com',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 1, Jakarta',
      odpId: '1',
      odpName: 'ODP-Central-01A',
      odpPort: 1,
      packageId: '2',
      packageName: 'Paket Standard',
      monthlyFee: 250000,
      status: 'active',
      registrationDate: '2023-01-15',
      activationDate: '2023-01-20',
      internetStatus: 'online',
      token: 'TOKEN123456789',
      tokenExpiry: '2024-02-20'
    },
    {
      id: '2',
      customerId: 'CUST002',
      name: 'Siti Nurhaliza',
      email: 'siti@email.com',
      phone: '082345678901',
      address: 'Jl. Sudirman No. 2, Jakarta',
      odpId: '1',
      odpName: 'ODP-Central-01A',
      odpPort: 2,
      packageId: '1',
      packageName: 'Paket Basic',
      monthlyFee: 150000,
      status: 'active',
      registrationDate: '2023-02-10',
      activationDate: '2023-02-15',
      internetStatus: 'offline'
    },
    {
      id: '3',
      customerId: 'CUST003',
      name: 'Ahmad Rahman',
      email: 'ahmad@email.com',
      phone: '083456789012',
      address: 'Jl. Gatot Subroto No. 3, Jakarta',
      odpId: '2',
      odpName: 'ODP-North-01B',
      odpPort: 1,
      packageId: '3',
      packageName: 'Paket Premium',
      monthlyFee: 400000,
      status: 'active',
      registrationDate: '2023-03-05',
      activationDate: '2023-03-10',
      internetStatus: 'online',
      token: 'TOKEN987654321',
      tokenExpiry: '2024-02-15'
    },
    {
      id: '4',
      customerId: 'CUST004',
      name: 'Maria Garcia',
      email: 'maria@email.com',
      phone: '084567890123',
      address: 'Jl. Rasuna Said No. 4, Jakarta',
      odpId: '2',
      odpName: 'ODP-North-01B',
      odpPort: 2,
      packageId: '2',
      packageName: 'Paket Standard',
      monthlyFee: 250000,
      status: 'pending',
      registrationDate: '2024-01-20',
      internetStatus: 'offline'
    }
  ]);

  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      customerId: 'CUST001',
      customerName: 'Budi Santoso',
      amount: 250000,
      paymentDate: '2024-01-15',
      dueDate: '2024-01-20',
      status: 'paid',
      paymentMethod: 'Transfer Bank',
      packageName: 'Paket Standard',
      description: 'Pembayaran bulan Januari 2024',
      token: 'TOKEN123456789',
      tokenStatus: 'active',
      billingMonth: 1,
      billingYear: 2024
    },
    {
      id: '2',
      customerId: 'CUST002',
      customerName: 'Siti Nurhaliza',
      amount: 150000,
      paymentDate: '',
      dueDate: '2024-01-25',
      status: 'pending',
      paymentMethod: '',
      packageName: 'Paket Basic',
      description: 'Pembayaran bulan Januari 2024',
      token: '',
      tokenStatus: 'unused',
      billingMonth: 1,
      billingYear: 2024
    },
    {
      id: '3',
      customerId: 'CUST003',
      customerName: 'Ahmad Rahman',
      amount: 400000,
      paymentDate: '2024-01-10',
      dueDate: '2024-01-10',
      status: 'paid',
      paymentMethod: 'Tunai',
      packageName: 'Paket Premium',
      description: 'Pembayaran bulan Januari 2024',
      token: 'TOKEN987654321',
      tokenStatus: 'active',
      billingMonth: 1,
      billingYear: 2024
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [billingMonth, setBillingMonth] = useState(new Date().getMonth() + 1);
  const [billingYear, setBillingYear] = useState(new Date().getFullYear());

  // Generate token function
  const generateToken = (): string => {
    const prefix = 'TOKEN';
    const randomNumbers = Math.floor(100000000 + Math.random() * 900000000);
    return `${prefix}${randomNumbers}`;
  };

  // Create billing for customers who haven't paid for the selected month
  const generateBilling = () => {
    const currentMonth = billingMonth;
    const currentYear = billingYear;
    
    // Find customers who don't have payments for this month/year
    const customersWithoutPayment = customers.filter(customer => {
      const hasPayment = payments.some(payment => 
        payment.customerId === customer.customerId &&
        payment.billingMonth === currentMonth &&
        payment.billingYear === currentYear
      );
      return !hasPayment && customer.status === 'active';
    });

    // Create new payments for these customers
    const newPayments: Payment[] = customersWithoutPayment.map(customer => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      customerId: customer.customerId,
      customerName: customer.name,
      amount: customer.monthlyFee,
      paymentDate: '',
      dueDate: new Date(currentYear, currentMonth, 20).toISOString().split('T')[0], // Due on 20th of the month
      status: 'pending',
      paymentMethod: '',
      packageName: customer.packageName,
      description: `Tagihan bulan ${getMonthName(currentMonth)} ${currentYear}`,
      token: '',
      tokenStatus: 'unused',
      billingMonth: currentMonth,
      billingYear: currentYear
    }));

    setPayments(prev => [...prev, ...newPayments]);
    setShowBillingModal(false);
  };

  // Process payment and generate token
  const processPayment = (paymentId: string) => {
    const token = generateToken();
    const tokenExpiry = new Date();
    tokenExpiry.setMonth(tokenExpiry.getMonth() + 1); // Token valid for 1 month

    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { 
            ...payment, 
            status: 'paid',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Manual',
            token: token,
            tokenStatus: 'active'
          }
        : payment
    ));

    // Update customer internet status to online
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      // In a real app, you would update the customer data here
      console.log(`Customer ${payment.customerName} token generated: ${token}`);
    }
  };

  // Print token functionality
  const printToken = (payment: Payment) => {
    if (payment.token) {
      const printContent = `
        =====================================
                TOKEN INTERNET
        =====================================
        
        ID Pelanggan: ${payment.customerId}
        Nama: ${payment.customerName}
        Paket: ${payment.packageName}
        
        TOKEN: ${payment.token}
        
        Berlaku sampai: ${payment.tokenExpiry || '1 bulan dari sekarang'}
        
        =====================================
        Terima kasih telah melakukan pembayaran!
        =====================================
      `;
      
      const printWindow = window.open('', '_blank', 'width=400,height=500');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Token Internet</title>
              <style>
                body { font-family: monospace; padding: 20px; }
                .token { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
                .info { margin: 10px 0; }
              </style>
            </head>
            <body>
              <pre>${printContent}</pre>
              <div class="token">${payment.token}</div>
              <button onclick="window.print()">Cetak</button>
              <button onclick="window.close()">Tutup</button>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const getMonthName = (month: number): string => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Lunas';
      case 'pending': return 'Menunggu';
      case 'overdue': return 'Jatuh Tempo';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTokenStatusColor = (tokenStatus: string) => {
    switch (tokenStatus) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'unused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = filteredPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalPending = filteredPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalOverdue = filteredPayments
    .filter(p => p.status === 'overdue')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingPaymentsCount = filteredPayments.filter(p => p.status === 'pending').length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Pembayaran</h1>
            <p className="text-gray-600 mt-1">Kelola tagihan dan pembayaran pelanggan</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowBillingModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Tagihan
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Manual
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menunggu Pembayaran</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Jatuh Tempo</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tagihan Pending</p>
                <p className="text-2xl font-bold text-blue-600">{pendingPaymentsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari Pembayaran</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nama pelanggan, ID, atau paket..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="paid">Lunas</option>
                <option value="pending">Menunggu</option>
                <option value="overdue">Jatuh Tempo</option>
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

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jatuh Tempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                          <div className="text-sm text-gray-500">{payment.customerId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                      {payment.paymentDate && (
                        <div className="text-sm text-gray-500">{payment.paymentDate}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.packageName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {getMonthName(payment.billingMonth)} {payment.billingYear}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {payment.dueDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{getStatusText(payment.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.token ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{payment.token}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getTokenStatusColor(payment.tokenStatus || 'unused')}`}>
                            {payment.tokenStatus || 'unused'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Belum ada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => processPayment(payment.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Proses Pembayaran"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                        {payment.status === 'paid' && payment.token && (
                          <button
                            onClick={() => printToken(payment)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Cetak Token"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                        {payment.token && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowTokenModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                            title="Lihat Token"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {}}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPayments.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data pembayaran</h3>
            <p className="text-gray-600">Tidak ada pembayaran yang sesuai dengan filter yang dipilih.</p>
          </div>
        )}

        {/* Billing Generation Modal */}
        {showBillingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate Tagihan</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                    <select
                      value={billingMonth}
                      onChange={(e) => setBillingMonth(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {getMonthName(i + 1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                    <select
                      value={billingYear}
                      onChange={(e) => setBillingYear(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <option key={2020 + i} value={2020 + i}>
                          {2020 + i}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Perhatian!</p>
                        <p>Tagihan akan dibuat untuk pelanggan aktif yang belum memiliki tagihan untuk periode yang dipilih.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowBillingModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={generateBilling}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Generate Tagihan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Token Display Modal */}
        {showTokenModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Token Internet</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
                    <p className="text-lg font-medium text-gray-900">{selectedPayment.customerName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-center text-gray-900 font-mono">
                        {selectedPayment.token}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTokenStatusColor(selectedPayment.tokenStatus || 'unused')}`}>
                      {selectedPayment.tokenStatus || 'unused'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
                    <p className="text-sm text-gray-600">
                      {getMonthName(selectedPayment.billingMonth)} {selectedPayment.billingYear}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowTokenModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      printToken(selectedPayment);
                      setShowTokenModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Cetak
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Payments;