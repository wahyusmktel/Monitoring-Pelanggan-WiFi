import React from 'react';

const SettingsTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings Page Test</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Test Content</h2>
        <p className="text-gray-600">If you can see this, the routing is working correctly.</p>
        <button 
          onClick={() => alert('Settings button clicked!')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default SettingsTest;