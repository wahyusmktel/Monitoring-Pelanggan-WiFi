import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, Download, Calendar, Filter, BarChart3, PieChart, RefreshCw, Eye, Printer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
  billingMonth: number;
  billingYear: number;
  token?: string;
}

// Interface untuk Ringkasan Bulanan
interface MonthlySummary {
  month: string;
  year: number;
  totalRevenue: number;
  totalPayments: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

// Interface untuk Ringkasan Pelanggan
interface CustomerSummary {
  customerId: string;
  customerName: string;
  totalPayments: number;
  totalAmount: number;
  averagePayment: number;
  lastPayment?: string;
  status: 'active' | 'inactive';
}

const PaymentMonitoring: React.FC = () => {
  // Data pembayaran (simulasi dari data yang ada)
  const [payments] = useState<Payment[]>([
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
      billingMonth: 1,
      billingYear: 2024,
      token: 'TOKEN123456789'
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
      billingMonth: 1,
      billingYear: 2024,
      token: 'TOKEN987654321'
    },
    {
      id: '4',
      customerId: 'CUST004',
      customerName: 'Maria Garcia',
      amount: 250000,
      paymentDate: '2024-01-18',
      dueDate: '2024-01-22',
      status: 'paid',
      paymentMethod: 'E-Wallet',
      packageName: 'Paket Standard',
      billingMonth: 1,
      billingYear: 2024,
      token: 'TOKEN456789123'
    }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState<'current' | 'last3' | 'last6' | 'year'>('current');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'customers' | 'reports'>('overview');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Helper function untuk nama bulan
  const getMonthName = (month: number): string => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  // Calculate monthly summaries
  const getMonthlySummaries = (): MonthlySummary[] => {
    const summaries: { [key: string]: MonthlySummary } = {};
    
    payments.forEach(payment => {
      const monthKey = `${payment.billingYear}-${payment.billingMonth}`;
      const monthName = getMonthName(payment.billingMonth);
      
      if (!summaries[monthKey]) {
        summaries[monthKey] = {
          month: monthName,
          year: payment.billingYear,
          totalRevenue: 0,
          totalPayments: 0,
          paidCount: 0,
          pendingCount: 0,
          overdueCount: 0
        };
      }
      
      summaries[monthKey].totalPayments++;
      if (payment.status === 'paid') {
        summaries[monthKey].totalRevenue += payment.amount;
        summaries[monthKey].paidCount++;
      } else if (payment.status === 'pending') {
        summaries[monthKey].pendingCount++;
      } else if (payment.status === 'overdue') {
        summaries[monthKey].overdueCount++;
      }
    });
    
    return Object.values(summaries).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month.localeCompare(b.month);
    });
  };

  // Calculate customer summaries with detailed payment history
  const getCustomerSummaries = (): CustomerSummary[] => {
    const summaries: { [key: string]: CustomerSummary } = {};
    
    payments.forEach(payment => {
      if (!summaries[payment.customerId]) {
        summaries[payment.customerId] = {
          customerId: payment.customerId,
          customerName: payment.customerName,
          totalPayments: 0,
          totalAmount: 0,
          averagePayment: 0,
          status: 'active'
        };
      }
      
      summaries[payment.customerId].totalPayments++;
      if (payment.status === 'paid') {
        summaries[payment.customerId].totalAmount += payment.amount;
      }
      
      if (payment.paymentDate && (!summaries[payment.customerId].lastPayment || payment.paymentDate > summaries[payment.customerId].lastPayment!)) {
        summaries[payment.customerId].lastPayment = payment.paymentDate;
      }
    });
    
    return Object.values(summaries).map(summary => ({
      ...summary,
      averagePayment: summary.totalPayments > 0 ? Math.round(summary.totalAmount / summary.totalPayments) : 0
    })).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  // Get detailed customer payment history
  const getCustomerPaymentHistory = (customerId: string) => {
    return payments
      .filter(payment => payment.customerId === customerId)
      .sort((a, b) => new Date(b.paymentDate || b.dueDate).getTime() - new Date(a.paymentDate || a.dueDate).getTime())
      .slice(0, 10); // Last 10 payments
  };

  // Get payment statistics by customer
  const getCustomerPaymentStats = (customerId: string) => {
    const customerPayments = payments.filter(payment => payment.customerId === customerId);
    const paidPayments = customerPayments.filter(p => p.status === 'paid');
    const pendingPayments = customerPayments.filter(p => p.status === 'pending');
    const overduePayments = customerPayments.filter(p => p.status === 'overdue');
    
    return {
      totalPayments: customerPayments.length,
      paidCount: paidPayments.length,
      pendingCount: pendingPayments.length,
      overdueCount: overduePayments.length,
      paymentRate: customerPayments.length > 0 ? Math.round((paidPayments.length / customerPayments.length) * 100) : 0,
      totalPaidAmount: paidPayments.reduce((sum, p) => sum + p.amount, 0)
    };
  };

  // Handle customer row click
  const handleCustomerClick = (customerId: string) => {
    setSelectedCustomer(customerId);
    setShowCustomerModal(true);
  };

  // Close customer modal
  const closeCustomerModal = () => {
    setShowCustomerModal(false);
    setSelectedCustomer(null);
  };

  // Get filtered data based on date range
  const getFilteredPayments = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case 'last3':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last6':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return payments.filter(payment => {
      const paymentDate = new Date(payment.billingYear, payment.billingMonth - 1, 1);
      return paymentDate >= startDate;
    });
  };

  // Calculate weekly revenue data for charts dengan error handling
  const getWeeklyRevenueData = () => {
    try {
      const weeklyData: { [key: string]: { week: string; revenue: number; payments: number } } = {};
      
      getFilteredPayments().forEach(payment => {
        if (payment.status === 'paid' && payment.paymentDate) {
          try {
            const date = new Date(payment.paymentDate);
            if (!isNaN(date.getTime())) { // Valid date check
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              const weekNumber = Math.ceil((weekStart.getDate() + weekStart.getDay()) / 7);
              const weekKey = `${weekStart.getFullYear()}-W${weekNumber}`;
              
              if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = {
                  week: `Minggu ${weekNumber}`,
                  revenue: 0,
                  payments: 0
                };
              }
              
              weeklyData[weekKey].revenue += payment.amount || 0;
              weeklyData[weekKey].payments++;
            }
          } catch (dateError) {
            console.warn('Error parsing payment date:', payment.paymentDate, dateError);
          }
        }
      });
      
      return Object.values(weeklyData).slice(-8); // Last 8 weeks
    } catch (error) {
      console.error('Error in getWeeklyRevenueData:', error);
      return [];
    }
  };

  // Calculate monthly revenue trend dengan error handling
  const getMonthlyRevenueTrend = () => {
    try {
      const monthlyTrend: { [key: string]: { month: string; revenue: number; target: number } } = {};
      
      // Set monthly targets (example targets)
      const monthlyTargets = {
        'Januari': 50000000, 'Februari': 55000000, 'Maret': 60000000, 'April': 58000000,
        'Mei': 62000000, 'Juni': 65000000, 'Juli': 68000000, 'Agustus': 70000000,
        'September': 72000000, 'Oktober': 75000000, 'November': 78000000, 'Desember': 80000000
      };
      
      getFilteredPayments().forEach(payment => {
        if (payment.status === 'paid' && payment.billingMonth && payment.billingYear) {
          try {
            const monthKey = getMonthName(payment.billingMonth);
            const yearKey = `${monthKey} ${payment.billingYear}`;
            
            if (!monthlyTrend[yearKey]) {
              monthlyTrend[yearKey] = {
                month: monthKey,
                revenue: 0,
                target: monthlyTargets[monthKey] || 60000000
              };
            }
            
            monthlyTrend[yearKey].revenue += payment.amount || 0;
          } catch (monthError) {
            console.warn('Error processing payment month/year:', payment.billingMonth, payment.billingYear, monthError);
          }
        }
      });
      
      return Object.values(monthlyTrend).slice(-6); // Last 6 months
    } catch (error) {
      console.error('Error in getMonthlyRevenueTrend:', error);
      return [];
    }
  };

  // Calculate payment method distribution dengan error handling
  const getPaymentMethodDistribution = () => {
    try {
      const methodData: { [key: string]: { name: string; value: number; count: number } } = {};
      
      getFilteredPayments().forEach(payment => {
        if (payment.status === 'paid' && payment.paymentMethod) {
          if (!methodData[payment.paymentMethod]) {
            methodData[payment.paymentMethod] = {
              name: payment.paymentMethod,
              value: 0,
              count: 0
            };
          }
          
          methodData[payment.paymentMethod].value += payment.amount || 0;
          methodData[payment.paymentMethod].count++;
        }
      });
      
      return Object.values(methodData);
    } catch (error) {
      console.error('Error in getPaymentMethodDistribution:', error);
      return [];
    }
  };

  // Calculate current statistics dengan error handling
  const currentStats = React.useMemo(() => {
    try {
      const filteredPayments = getFilteredPayments();
      const paidPayments = filteredPayments.filter(p => p.status === 'paid');
      const pendingPayments = filteredPayments.filter(p => p.status === 'pending');
      const overduePayments = filteredPayments.filter(p => p.status === 'overdue');
      
      const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const paidCount = paidPayments.length;
      const totalPayments = filteredPayments.length;
      
      return {
        totalRevenue: totalRevenue || 0,
        totalPayments: totalPayments || 0,
        paidCount: paidCount || 0,
        pendingCount: pendingPayments.length || 0,
        overdueCount: overduePayments.length || 0,
        averagePayment: paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalRevenue: 0,
        totalPayments: 0,
        paidCount: 0,
        pendingCount: 0,
        overdueCount: 0,
        averagePayment: 0
      };
    }
  }, [getFilteredPayments]);

  // Chart data dengan error handling
  const chartData = React.useMemo(() => {
    try {
      return getMonthlySummaries().map(item => ({
        name: `${item.month} ${item.year}`,
        revenue: item.totalRevenue || 0,
        payments: item.totalPayments || 0,
        paid: item.paidCount || 0,
        pending: item.pendingCount || 0
      }));
    } catch (error) {
      console.error('Error creating chart data:', error);
      return [];
    }
  }, [getMonthlySummaries]);

  const statusData = React.useMemo(() => [
    { name: 'Lunas', value: currentStats.paidCount, color: '#10B981' },
    { name: 'Menunggu', value: currentStats.pendingCount, color: '#F59E0B' },
    { name: 'Jatuh Tempo', value: currentStats.overdueCount, color: '#EF4444' }
  ], [currentStats]);

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const monthlyData = getMonthlySummaries();
    const customerData = getCustomerSummaries();
    const methodData = getPaymentMethodDistribution();
    
    // Title
    doc.setFontSize(20);
    doc.text('Laporan Monitoring Pembayaran', 14, 22);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Periode: ${getMonthName(selectedMonth)} ${selectedYear}`, 14, 32);
    doc.text(`Dibuat: ${new Date().toLocaleDateString('id-ID')}`, 14, 40);
    
    // Summary Statistics
    doc.setFontSize(16);
    doc.text('Ringkasan Pembayaran', 14, 55);
    
    doc.setFontSize(12);
    doc.text(`Total Pendapatan: Rp ${currentStats.totalRevenue.toLocaleString('id-ID')}`, 14, 65);
    doc.text(`Total Pembayaran: ${currentStats.totalPayments}`, 14, 72);
    doc.text(`Pembayaran Lunas: ${currentStats.paidCount}`, 14, 79);
    doc.text(`Menunggu Pembayaran: ${currentStats.pendingCount}`, 14, 86);
    doc.text(`Jatuh Tempo: ${currentStats.overdueCount}`, 14, 93);
    
    // Monthly Summary Table
    doc.setFontSize(16);
    doc.text('Ringkasan Bulanan', 14, 110);
    
    (doc as any).autoTable({
      startY: 115,
      head: [['Bulan', 'Tahun', 'Pendapatan', 'Pembayaran', 'Lunas', 'Menunggu', 'Jatuh Tempo']],
      body: monthlyData.map(item => [
        item.month,
        item.year.toString(),
        `Rp ${item.totalRevenue.toLocaleString('id-ID')}`,
        item.totalPayments.toString(),
        item.paidCount.toString(),
        item.pendingCount.toString(),
        item.overdueCount.toString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    });

    // Payment Methods Distribution
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(16);
    doc.text('Distribusi Metode Pembayaran', 14, finalY);
    
    (doc as any).autoTable({
      startY: finalY + 5,
      head: [['Metode Pembayaran', 'Total (Rp)', 'Jumlah Transaksi']],
      body: methodData.map(item => [
        item.name,
        `Rp ${item.value.toLocaleString('id-ID')}`,
        item.count.toString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    });

    // Top Customers
    const finalY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(16);
    doc.text('Top Pelanggan Berdasarkan Pembayaran', 14, finalY2);
    
    (doc as any).autoTable({
      startY: finalY2 + 5,
      head: [['ID Pelanggan', 'Nama', 'Total Pembayaran', 'Jumlah (Rp)', 'Rata-rata (Rp)']],
      body: customerData.slice(0, 10).map(item => [
        item.customerId,
        item.customerName,
        item.totalPayments.toString(),
        `Rp ${item.totalAmount.toLocaleString('id-ID')}`,
        `Rp ${item.averagePayment.toLocaleString('id-ID')}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    });

    // Save the PDF
    doc.save(`Laporan_Pembayaran_${getMonthName(selectedMonth)}_${selectedYear}.pdf`);
  };

  // Export to Excel
  const exportToExcel = () => {
    const monthlyData = getMonthlySummaries();
    const customerData = getCustomerSummaries();
    const methodData = getPaymentMethodDistribution();
    const filteredPayments = getFilteredPayments();
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Monthly summary sheet
    const monthlyWS = XLSX.utils.json_to_sheet(monthlyData.map(item => ({
      'Bulan': item.month,
      'Tahun': item.year,
      'Total Pendapatan (Rp)': item.totalRevenue,
      'Total Pembayaran': item.totalPayments,
      'Pembayaran Lunas': item.paidCount,
      'Menunggu Pembayaran': item.pendingCount,
      'Jatuh Tempo': item.overdueCount
    })));
    
    // Customer summary sheet
    const customerWS = XLSX.utils.json_to_sheet(customerData.map(item => ({
      'ID Pelanggan': item.customerId,
      'Nama Pelanggan': item.customerName,
      'Total Pembayaran': item.totalPayments,
      'Total Jumlah (Rp)': item.totalAmount,
      'Rata-rata (Rp)': item.averagePayment,
      'Status': item.status === 'active' ? 'Aktif' : 'Tidak Aktif'
    })));
    
    // Payment methods sheet
    const methodsWS = XLSX.utils.json_to_sheet(methodData.map(item => ({
      'Metode Pembayaran': item.name,
      'Total (Rp)': item.value,
      'Jumlah Transaksi': item.count,
      'Rata-rata per Transaksi (Rp)': item.count > 0 ? Math.round(item.value / item.count) : 0
    })));
    
    // Detailed payments sheet
    const paymentsWS = XLSX.utils.json_to_sheet(filteredPayments.map(payment => ({
      'ID Pembayaran': payment.id,
      'ID Pelanggan': payment.customerId,
      'Nama Pelanggan': payment.customerName,
      'Paket': payment.packageName,
      'Jumlah (Rp)': payment.amount,
      'Tanggal Pembayaran': payment.paymentDate || 'Belum Bayar',
      'Tanggal Jatuh Tempo': payment.dueDate,
      'Status': payment.status === 'paid' ? 'Lunas' : payment.status === 'pending' ? 'Menunggu' : 'Jatuh Tempo',
      'Metode Pembayaran': payment.paymentMethod || 'Belum Dipilih',
      'Token': payment.token || 'Belum Ada',
      'Bulan Tagihan': getMonthName(payment.billingMonth),
      'Tahun Tagihan': payment.billingYear
    })));
    
    // Summary statistics sheet
    const summaryWS = XLSX.utils.json_to_sheet([{
      'Keterangan': 'Total Pendapatan',
      'Nilai (Rp)': currentStats.totalRevenue
    }, {
      'Keterangan': 'Total Pembayaran',
      'Nilai': currentStats.totalPayments
    }, {
      'Keterangan': 'Pembayaran Lunas',
      'Nilai': currentStats.paidCount
    }, {
      'Keterangan': 'Menunggu Pembayaran',
      'Nilai': currentStats.pendingCount
    }, {
      'Keterangan': 'Jatuh Tempo',
      'Nilai': currentStats.overdueCount
    }, {
      'Keterangan': 'Rata-rata Pembayaran',
      'Nilai (Rp)': currentStats.averagePayment
    }, {
      'Keterangan': 'Periode Laporan',
      'Nilai': `${getMonthName(selectedMonth)} ${selectedYear}`
    }, {
      'Keterangan': 'Tanggal Dibuat',
      'Nilai': new Date().toLocaleDateString('id-ID')
    }]);
    
    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Ringkasan');
    XLSX.utils.book_append_sheet(wb, monthlyWS, 'Bulanan');
    XLSX.utils.book_append_sheet(wb, customerWS, 'Pelanggan');
    XLSX.utils.book_append_sheet(wb, methodsWS, 'Metode Pembayaran');
    XLSX.utils.book_append_sheet(wb, paymentsWS, 'Detail Pembayaran');
    
    // Save the file
    XLSX.writeFile(wb, `Laporan_Pembayaran_${getMonthName(selectedMonth)}_${selectedYear}.xlsx`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoring Pembayaran & Pendapatan</h1>
            <p className="text-gray-600 mt-1">Pantau kinerja pembayaran dan analisis pendapatan</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportToPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'monthly' | 'weekly')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="monthly">Bulanan</option>
                <option value="weekly">Mingguan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Waktu</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'current' | 'last3' | 'last6' | 'year')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="current">Bulan Ini</option>
                <option value="last3">3 Bulan Terakhir</option>
                <option value="last6">6 Bulan Terakhir</option>
                <option value="year">1 Tahun Terakhir</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
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
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={2020 + i} value={2020 + i}>
                    {2020 + i}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900">Rp {currentStats.totalRevenue.toLocaleString('id-ID')}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12% dari bulan lalu</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pembayaran</p>
                <p className="text-2xl font-bold text-gray-900">{currentStats.totalPayments}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8% dari bulan lalu</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pembayaran Lunas</p>
                <p className="text-2xl font-bold text-gray-900">{currentStats.paidCount}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15% dari bulan lalu</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menunggu Pembayaran</p>
                <p className="text-2xl font-bold text-gray-900">{currentStats.pendingCount}</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-5% dari bulan lalu</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rata-rata Pembayaran</p>
                <p className="text-2xl font-bold text-gray-900">Rp {currentStats.averagePayment.toLocaleString('id-ID')}</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-3% dari bulan lalu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Ringkasan', icon: BarChart3 },
                { id: 'analytics', label: 'Analitik', icon: PieChart },
                { id: 'customers', label: 'Pelanggan', icon: Users },
                { id: 'reports', label: 'Laporan', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Revenue Trend Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tren Pendapatan {selectedPeriod === 'monthly' ? 'Bulanan' : 'Mingguan'}
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                {selectedPeriod === 'monthly' ? (
                  getMonthlyRevenueTrend().length > 0 ? (
                    <LineChart data={getMonthlyRevenueTrend()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [
                        name === 'revenue' ? `Rp ${value.toLocaleString('id-ID')}` : `Rp ${value.toLocaleString('id-ID')}`,
                        name === 'revenue' ? 'Pendapatan' : 'Target'
                      ]} />
                      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} name="revenue" />
                      <Line type="monotone" dataKey="target" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="target" />
                    </LineChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Tidak ada data untuk ditampilkan
                    </div>
                  )
                ) : (
                  getWeeklyRevenueData().length > 0 ? (
                    <BarChart data={getWeeklyRevenueData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [
                        name === 'revenue' ? `Rp ${value.toLocaleString('id-ID')}` : `${value} pembayaran`,
                        name === 'revenue' ? 'Pendapatan' : 'Jumlah'
                      ]} />
                      <Bar dataKey="revenue" fill="#3B82F6" name="revenue" />
                    </BarChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Tidak ada data untuk ditampilkan
                    </div>
                  )
                )}
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Status Distribution */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status Pembayaran</h3>
                <ResponsiveContainer width="100%" height={300}>
                {currentStats.paidCount + currentStats.pendingCount + currentStats.overdueCount > 0 ? (
                  <RePieChart>
                    <Pie
                      data={[
                        { name: 'Lunas', value: currentStats.paidCount, color: '#10B981' },
                        { name: 'Pending', value: currentStats.pendingCount, color: '#F59E0B' },
                        { name: 'Jatuh Tempo', value: currentStats.overdueCount, color: '#EF4444' }
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Lunas', value: currentStats.paidCount, color: '#10B981' },
                        { name: 'Pending', value: currentStats.pendingCount, color: '#F59E0B' },
                        { name: 'Jatuh Tempo', value: currentStats.overdueCount, color: '#EF4444' }
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} pembayaran`, name]} />
                  </RePieChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Tidak ada data status pembayaran
                  </div>
                )}
              </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {[{ name: 'Lunas', value: currentStats.paidCount, color: '#10B981' },
                    { name: 'Pending', value: currentStats.pendingCount, color: '#F59E0B' },
                    { name: 'Jatuh Tempo', value: currentStats.overdueCount, color: '#EF4444' }]
                    .filter(entry => entry.value > 0)
                    .map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Payment Method Distribution */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Metode Pembayaran</h3>
                <ResponsiveContainer width="100%" height={300}>
                {getPaymentMethodDistribution().length > 0 ? (
                  <BarChart data={getPaymentMethodDistribution()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'value' ? `Rp ${value.toLocaleString('id-ID')}` : `${value} transaksi`,
                      name === 'value' ? 'Total' : 'Jumlah'
                    ]} />
                    <Bar dataKey="value" fill="#8B5CF6" name="value" />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Tidak ada data metode pembayaran
                  </div>
                )}
              </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Detailed Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Detail</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round((currentStats.paidCount / currentStats.totalPayments) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Tingkat Pembayaran Berhasil</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    Rp {Math.round(currentStats.totalRevenue / 1000000)}M
                  </div>
                  <div className="text-sm text-gray-600">Total Pendapatan (Juta)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {currentStats.totalPayments}
                  </div>
                  <div className="text-sm text-gray-600">Total Transaksi</div>
                </div>
              </div>
            </div>

            {/* Payment Methods Analysis */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Metode Pembayaran</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <RePieChart>
                      <Pie
                        data={getPaymentMethodDistribution()}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {getPaymentMethodDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Total']} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {getPaymentMethodDistribution().map((method, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5] }}
                        ></div>
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">Rp {method.value.toLocaleString('id-ID')}</div>
                        <div className="text-sm text-gray-600">{method.count} transaksi</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Revenue Trend */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Pendapatan Mingguan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getWeeklyRevenueData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `Rp ${value.toLocaleString('id-ID')}` : `${value} pembayaran`,
                    name === 'revenue' ? 'Pendapatan' : 'Jumlah'
                  ]} />
                  <Bar dataKey="revenue" fill="#3B82F6" name="revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-8">
            {/* Customer Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performa Pelanggan</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pelanggan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pembayaran</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah (Rp)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata (Rp)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getCustomerSummaries().map((customer) => (
                      <tr 
                        key={customer.customerId} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleCustomerClick(customer.customerId)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.customerId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.totalPayments}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {customer.totalAmount.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {customer.averagePayment.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8">
            {/* Report Generation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pembuatan Laporan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Laporan PDF</h4>
                  <p className="text-sm text-gray-600 mb-4">Buat laporan lengkap dalam format PDF dengan grafik dan tabel.</p>
                  <button
                    onClick={exportToPDF}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Laporan Excel</h4>
                  <p className="text-sm text-gray-600 mb-4">Buat laporan dengan data mentah dalam format Excel.</p>
                  <button
                    onClick={exportToExcel}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Detail Modal */}
        {showCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detail Pelanggan - {selectedCustomer}
                </h3>
                <button
                  onClick={closeCustomerModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {(() => {
                const customer = getCustomerSummaries().find(c => c.customerId === selectedCustomer);
                const paymentHistory = getCustomerPaymentHistory(selectedCustomer);
                const stats = getCustomerPaymentStats(selectedCustomer);
                
                if (!customer) return null;
                
                return (
                  <div className="space-y-6">
                    {/* Customer Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalPayments}</div>
                        <div className="text-sm text-blue-800">Total Pembayaran</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.paymentRate}%</div>
                        <div className="text-sm text-green-800">Tingkat Pembayaran</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">Rp {stats.totalPaidAmount.toLocaleString('id-ID')}</div>
                        <div className="text-sm text-purple-800">Total Dibayar</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">Rp {customer.averagePayment.toLocaleString('id-ID')}</div>
                        <div className="text-sm text-yellow-800">Rata-rata Pembayaran</div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Status Pembayaran</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">{stats.paidCount}</div>
                          <div className="text-sm text-green-800">Lunas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-yellow-600">{stats.pendingCount}</div>
                          <div className="text-sm text-yellow-800">Menunggu</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-red-600">{stats.overdueCount}</div>
                          <div className="text-sm text-red-800">Jatuh Tempo</div>
                        </div>
                      </div>
                    </div>

                    {/* Payment History */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Riwayat Pembayaran Terakhir</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paket</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {paymentHistory.map((payment, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900">{payment.id}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{payment.packageName}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">Rp {payment.amount.toLocaleString('id-ID')}</td>
                                <td className="px-4 py-2">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {payment.status === 'paid' ? 'Lunas' : payment.status === 'pending' ? 'Menunggu' : 'Jatuh Tempo'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {payment.paymentDate || payment.dueDate}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {payment.token || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={closeCustomerModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PaymentMonitoring;