import React from 'react';
import Layout from '@/components/Layout';

const SettingsSimple: React.FC = () => {
  console.log('SettingsSimple component rendered');
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="mt-2 text-gray-600">Halaman pengaturan sederhana untuk testing</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Testing Settings Page</h2>
          <p className="text-gray-600">Jika Anda melihat halaman ini, berarti routing dan Layout bekerja dengan baik.</p>
          
          <div className="mt-6">
            <button 
              onClick={() => console.log('Settings button clicked')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Button
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsSimple;