import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Lock, ShieldCheck } from 'lucide-react';

const CustomerChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new_password !== formData.new_password_confirmation) {
      return toast.error('Konfirmasi password tidak cocok');
    }

    try {
      const token = localStorage.getItem('customer_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      
      await axios.post(`${apiUrl}/portal/change-password`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Password berhasil diubah!');
      navigate('/portal/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Ganti Password Default</h2>
          <p className="text-sm text-gray-600 mt-2">Demi keamanan, silakan ganti password Anda sebelum melanjutkan.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Password Lama (ID Pelanggan)</label>
            <input type="password" value={formData.current_password} onChange={e => setFormData({...formData, current_password: e.target.value})} className="w-full p-2 border rounded mt-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password Baru</label>
            <input type="password" value={formData.new_password} onChange={e => setFormData({...formData, new_password: e.target.value})} className="w-full p-2 border rounded mt-1" required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
            <input type="password" value={formData.new_password_confirmation} onChange={e => setFormData({...formData, new_password_confirmation: e.target.value})} className="w-full p-2 border rounded mt-1" required />
          </div>
          <button type="submit" className="w-full bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700 font-medium">Simpan & Lanjutkan</button>
        </form>
      </div>
    </div>
  );
};

export default CustomerChangePassword;