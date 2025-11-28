import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Wifi } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    navigate('/portal/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Wifi className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Portal Pelanggan</span>
            </div>
            <div className="flex items-center">
              <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-600">
                <LogOut className="h-5 w-5 mr-1" /> Keluar
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;