import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Wifi, User, Lock, ArrowRight } from 'lucide-react';

const CustomerLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ customer_number: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const response = await axios.post(`${apiUrl}/portal/login`, formData);
      
      const { access_token, customer, must_change_password } = response.data;

      // Simpan Token Khusus Customer (Beda key dengan admin biar ga bentrok)
      localStorage.setItem('customer_token', access_token);
      localStorage.setItem('customer_data', JSON.stringify(customer));

      if (must_change_password) {
        navigate('/portal/change-password');
      } else {
        navigate('/portal/dashboard');
      }
    } catch (error: any) {
        const msg = error.response?.data?.message || 'Login gagal. Periksa koneksi Anda.';
        setErrorMessage(msg); // <--- TAMPILKAN PESAN ERROR DI ALERT
        toast.error(msg);     // (Opsional) Tetap munculkan toast juga
      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <div className="mx-auto bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Wifi className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-white">Area Pelanggan</h2>
          <p className="text-blue-100 mt-2">Masuk untuk cek tagihan & layanan</p>
        </div>
        <div className="p-8">
          {/* --- ALERT ERROR --- */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center flex items-center justify-center animate-pulse">
              <span className="font-medium mr-1">Error:</span> {errorMessage}
            </div>
          )}
          {/* ------------------- */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Pelanggan</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.customer_number}
                  onChange={e => setFormData({...formData, customer_number: e.target.value})}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: 790001"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Password (Default: ID Pelanggan)"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {loading ? 'Memproses...' : <>Masuk <ArrowRight className="ml-2 h-4 w-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;