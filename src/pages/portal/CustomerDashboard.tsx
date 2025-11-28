import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerLayout from '@/components/CustomerLayout';
import { Wifi, Calendar, CheckCircle, XCircle, Clock, Package, Download } from 'lucide-react';
import { toast } from 'sonner';

// Interface khusus untuk data dashboard pelanggan
interface CustomerData {
  id: number;
  customer_number: string;
  name: string;
  email: string;
  address: string;
  status: string;
  package?: {
    name: string;
    speed: number;
    price: number;
  };
  payments?: Array<{
    id: number;
    billing_month: number;
    billing_year: number;
    amount: number;
    status: string;
    payment_date: string;
    token?: string;
  }>;
}

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('customer_token');
        if (!token) {
          navigate('/portal/login');
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
        const response = await axios.get(`${apiUrl}/portal/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCustomer(response.data);
      } catch (error: any) {
        console.error(error);
        if (error.response?.status === 401) {
          localStorage.removeItem('customer_token');
          navigate('/portal/login');
        }
        toast.error('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (!customer) return null;

  // Helper format rupiah
  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  
  // Helper status warna
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Halo, {customer.name}! 👋</h1>
          <p className="text-blue-100">ID Pelanggan: <span className="font-mono font-bold bg-white/20 px-2 py-1 rounded">{customer.customer_number}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info Paket */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-50 rounded-lg mr-4">
                <Wifi className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Paket Internet</p>
                <h3 className="font-bold text-gray-900">{customer.package?.name || 'Tidak ada paket'}</h3>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 mt-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Kecepatan</span>
                <span className="font-medium">{customer.package?.speed} Mbps</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tagihan Bulanan</span>
                <span className="font-medium text-blue-600">{formatRupiah(customer.package?.price || 0)}</span>
              </div>
            </div>
          </div>

          {/* Status Langganan */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-50 rounded-lg mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Status Layanan</p>
                <h3 className="font-bold text-gray-900 capitalize">{customer.status}</h3>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 mt-2">
               <p className="text-sm text-gray-500 mb-2">Alamat Pemasangan:</p>
               <p className="text-sm font-medium text-gray-900 line-clamp-2">{customer.address}</p>
            </div>
          </div>

          {/* Tagihan Pending (Jika Ada) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center mb-4">
              <div className="p-3 bg-yellow-50 rounded-lg mr-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tagihan Belum Dibayar</p>
                <h3 className="font-bold text-gray-900">
                   {customer.payments?.filter(p => p.status === 'pending' || p.status === 'overdue').length || 0} Tagihan
                </h3>
              </div>
            </div>
             <div className="border-t border-gray-100 pt-4 mt-2">
                <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Bayar Sekarang (Hubungi Admin)
                </button>
             </div>
          </div>
        </div>

        {/* Riwayat Pembayaran Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Riwayat Pembayaran</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Periode</th>
                  <th className="px-6 py-3 font-medium">Jumlah</th>
                  <th className="px-6 py-3 font-medium">Tanggal Bayar</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customer.payments && customer.payments.length > 0 ? (
                  customer.payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">
                        {new Date(payment.billing_year, payment.billing_month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">{formatRupiah(payment.amount)}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          {payment.status === 'paid' ? 'Lunas' : payment.status === 'pending' ? 'Menunggu' : 'Jatuh Tempo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-blue-600 font-medium">
                        {payment.token || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada riwayat pembayaran</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;