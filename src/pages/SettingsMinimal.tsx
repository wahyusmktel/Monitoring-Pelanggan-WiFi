import React from 'react';

const SettingsMinimal: React.FC = () => {
  console.log('SettingsMinimal rendered');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings Page Test</h1>
        <p className="mt-2 text-gray-600">This is a minimal settings page to test if routing works.</p>
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900">Test Content</h2>
          <p className="text-gray-600 mt-2">If you can see this, the routing is working correctly.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsMinimal;