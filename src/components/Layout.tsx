import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Package, 
  DollarSign, 
  Settings, 
  LogOut,
  Menu,
  X,
  Server,
  Network,
  MapPin,
  Box,
  Activity,
  Map
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [serverMenuOpen, setServerMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Pelanggan', href: '/customers', icon: Users },
    { name: 'Peta Infrastruktur', href: '/network-map', icon: Map },
    { name: 'Langganan', href: '/subscriptions', icon: Package },
    { name: 'Pembayaran', href: '/payments', icon: DollarSign },
    { name: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  // Tambahkan state untuk payment menu
  const [paymentMenuOpen, setPaymentMenuOpen] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Internet Manager</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          {navigation.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}

          {/* Payment Menu with Dropdown */}
          <div className="mb-1">
            <button
              onClick={() => setPaymentMenuOpen(!paymentMenuOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                paymentMenuOpen || isActive('/payments') || isActive('/payment-monitoring')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center">
                <DollarSign className="mr-3 h-5 w-5" />
                Pembayaran
              </div>
              <svg
                className={`h-4 w-4 transform transition-transform duration-200 ${
                  paymentMenuOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {paymentMenuOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <Link
                  to="/payments"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive('/payments')
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Manajemen Pembayaran
                </Link>
                <Link
                  to="/payment-monitoring"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive('/payment-monitoring')
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Monitoring & Laporan
                </Link>
              </div>
            )}
          </div>
          
          {/* Server Menu with Dropdown */}
          <div className="mb-1">
            <button
              onClick={() => setServerMenuOpen(!serverMenuOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                serverMenuOpen || isActive('/olt') || isActive('/odc') || isActive('/odp') || isActive('/port-monitoring')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center">
                <Server className="mr-3 h-5 w-5" />
                Server
              </div>
              <svg
                className={`h-4 w-4 transform transition-transform duration-200 ${
                  serverMenuOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {serverMenuOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <Link
                  to="/olt"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive('/olt')
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <Network className="mr-2 h-4 w-4" />
                  Manajemen OLT
                </Link>
                <Link
                  to="/odc"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive('/odc')
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Manajemen ODC
                </Link>
                <Link
                  to="/odp"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive('/odp')
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <Box className="mr-2 h-4 w-4" />
                  Manajemen ODP
                </Link>
                <Link
                  to="/port-monitoring"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive('/port-monitoring')
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Monitoring Port
                </Link>
              </div>
            )}
          </div>
          
          {/* Settings Menu */}
          <Link
            to="/settings"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 transition-colors duration-200 ${
              isActive('/settings')
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings className="mr-3 h-5 w-5" />
            Pengaturan
          </Link>
        </nav>
        
        <div className="absolute bottom-0 w-full px-3 py-4 border-t border-gray-200">
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg w-full transition-colors duration-200">
            <LogOut className="mr-3 h-5 w-5" />
            Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin</span>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;