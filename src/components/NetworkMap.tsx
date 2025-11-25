import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different infrastructure types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const customerIcon = createCustomIcon('#3B82F6'); // Blue
const oltIcon = createCustomIcon('#EF4444'); // Red
const odcIcon = createCustomIcon('#F59E0B'); // Yellow
const odpIcon = createCustomIcon('#10B981'); // Green

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  type: 'customer' | 'olt' | 'odc' | 'odp';
  status?: 'active' | 'inactive' | 'maintenance';
  details?: Record<string, any>;
}

interface NetworkMapProps {
  locations: Location[];
  height?: string;
  center?: [number, number];
  zoom?: number;
  showCoverage?: boolean;
  coverageRadius?: number; // in meters
}

const NetworkMap: React.FC<NetworkMapProps> = ({ 
  locations, 
  height = '600px',
  center = [-6.2088, 106.8456], // Jakarta coordinates
  zoom = 11,
  showCoverage = true,
  coverageRadius = 1000 // 1km radius
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'customer': return customerIcon;
      case 'olt': return oltIcon;
      case 'odc': return odcIcon;
      case 'odp': return odpIcon;
      default: return DefaultIcon;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-red-600';
      case 'maintenance': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radius bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Jarak dalam km
  };

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((location) => (
          <React.Fragment key={location.id}>
            <Marker
              position={[location.lat, location.lng]}
              icon={getIcon(location.type)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-gray-900">{location.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
                  </p>
                  {location.status && (
                    <p className={`text-sm ${getStatusColor(location.status)} font-medium`}>
                      Status: {location.status}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Tipe: {location.type.toUpperCase()}
                  </p>
                  
                  {location.details && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      {Object.entries(location.details).map(([key, value]) => (
                        <p key={key} className="text-xs text-gray-600">
                          <span className="font-medium">{key}:</span> {value}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
            
            {/* Show coverage area for infrastructure points */}
            {showCoverage && (location.type === 'olt' || location.type === 'odc' || location.type === 'odp') && (
              <Circle
                center={[location.lat, location.lng]}
                radius={coverageRadius}
                pathOptions={{
                  color: location.type === 'olt' ? '#EF4444' : 
                         location.type === 'odc' ? '#F59E0B' : '#10B981',
                  weight: 1,
                  opacity: 0.3,
                  fillOpacity: 0.1
                }}
              />
            )}
          </React.Fragment>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-300">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <span>Pelanggan</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span>OLT</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span>ODC</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span>ODP</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          Total: {locations.length} lokasi
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;