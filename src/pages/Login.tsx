import React, { useState, useEffect } from 'react';
import { Wifi, Eye, EyeOff, User, Lock } from 'lucide-react';
import axios from 'axios'; // Pastikan install axios: npm install axios
import { useNavigate } from 'react-router-dom'; // Untuk redirect

const Login: React.FC = () => {
  const navigate = useNavigate(); // Hook untuk navigasi
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // State untuk error

  useEffect(() => {
    // Cek apakah ada token di localStorage
    const token = localStorage.getItem('token');
    
    // Jika token ada, lempar user ke dashboard
    if (token) {
      // replace: true agar user tidak bisa kembali ke halaman login pakai tombol Back browser
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrorMessage(''); // Hapus error saat ketik ulang
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Ambil URL API dari .env
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      
      // Request ke Laravel Backend
      const response = await axios.post(`${apiUrl}/api/login`, formData);

      // Jika sukses
      console.log('Login success:', response.data);
      
      // Simpan Token & User ke LocalStorage
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect ke Dashboard
      navigate('/dashboard'); // Sesuaikan dengan route dashboardmu

    } catch (error: any) {
      console.error('Login failed:', error);
      // Tampilkan pesan error dari backend atau default
      setErrorMessage(error.response?.data?.message || 'Gagal login, periksa koneksi atau kredensial.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center p-4">
      {/* Background Pattern tetap sama... */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Container */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-lg bg-opacity-95 border border-white border-opacity-20 transform transition-all duration-300 hover:scale-105">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110">
                <Wifi className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Selamat Datang</h1>
            <p className="text-gray-600">Manajemen Langganan Internet</p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center animate-pulse">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password (Static for now) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Ingat saya</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">Lupa password?</a>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Memproses...
                </div>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun? <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">Hubungi admin</a>
            </p>
          </div>
        </div>
        {/* Floating Elements Tetap Sama */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-300 rounded-full animate-pulse animation-delay-1000"></div>
      </div>
      {/* Styles Tetap Sama */}
      <style>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Login;