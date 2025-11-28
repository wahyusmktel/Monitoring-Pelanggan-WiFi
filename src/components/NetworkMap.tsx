import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, CircleF } from '@react-google-maps/api';

// --- KONFIGURASI ICON GOOGLE MAPS ---
const getMarkerIcon = (type: string) => {
  // Menggunakan icon default Google Maps beda warna
  switch (type.toLowerCase()) {
    case 'customer': // Biru
      return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    case 'olt': // Merah
      return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    case 'odc': // Kuning
      return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    case 'odp': // Hijau
      return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    default:
      return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  }
};

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  type: string;
  status?: string;
  details?: Record<string, any>;
}

interface NetworkMapProps {
  locations: MapLocation[];
  height?: string; // Props ini diabaikan krn pakai flex-1
  center?: [number, number];
  zoom?: number;
  showCoverage?: boolean;
  coverageRadius?: number;
}

const NetworkMap: React.FC<NetworkMapProps> = ({ 
  locations, 
  center = [-5.3738973, 105.0782348], // Default Center (Lampung)
  zoom = 13,
  showCoverage = true,
  coverageRadius = 1000 
}) => {
  
  // Load Google Maps Script
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyDQSR0tu_uijvHsHMIMiMOcOVxbGIuPSpk', // API Key Kamu
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  // Effect untuk update center saat props center berubah (Penting!)
  useEffect(() => {
    if (map && center) {
      map.panTo({ lat: Number(center[0]), lng: Number(center[1]) });
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  const getStatusColor = (status?: string) => {
    if (!status) return '#4B5563'; // Gray
    switch (status.toLowerCase()) {
      case 'active': return '#10B981'; // Green
      case 'inactive': return '#EF4444'; // Red
      case 'maintenance': return '#F59E0B'; // Yellow
      case 'pending': return '#F97316'; // Orange
      default: return '#4B5563';
    }
  };

  // Validasi koordinat
  const validLocations = locations.filter(loc => 
    loc.lat !== null && loc.lng !== null && !isNaN(Number(loc.lat)) && !isNaN(Number(loc.lng))
  );

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full bg-gray-100">Memuat Google Maps...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col border border-gray-300 rounded-lg overflow-hidden relative">
      {/* Peta akan memenuhi sisa ruang (flex-1) */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={{ lat: Number(center[0]), lng: Number(center[1]) }}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
            mapTypeId: 'hybrid', // Default Tampilan Satelit Hybrid
            mapId: "DEMO_MAP_ID" // Fix warning deprecated marker
          }}
        >
          {validLocations.map((location) => (
            <React.Fragment key={location.id}>
              {/* Marker */}
              <MarkerF
                position={{ lat: Number(location.lat), lng: Number(location.lng) }}
                icon={{
                  url: getMarkerIcon(location.type),
                  scaledSize: new window.google.maps.Size(40, 40) // Ukuran icon
                }}
                onClick={() => setSelectedLocation(location)}
              />

              {/* Coverage Radius (Lingkaran) */}
              {showCoverage && ['olt', 'odc', 'odp'].includes(location.type.toLowerCase()) && (
                <CircleF
                  center={{ lat: Number(location.lat), lng: Number(location.lng) }}
                  radius={coverageRadius}
                  options={{
                    strokeColor: location.type.toLowerCase() === 'olt' ? '#EF4444' : 
                                 location.type.toLowerCase() === 'odc' ? '#F59E0B' : '#10B981',
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                    fillColor: location.type.toLowerCase() === 'olt' ? '#EF4444' : 
                               location.type.toLowerCase() === 'odc' ? '#F59E0B' : '#10B981',
                    fillOpacity: 0.15,
                  }}
                />
              )}
            </React.Fragment>
          ))}

          {/* Info Window (Popup saat marker diklik) */}
          {selectedLocation && (
            <InfoWindowF
              position={{ lat: Number(selectedLocation.lat), lng: Number(selectedLocation.lng) }}
              onCloseClick={() => setSelectedLocation(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
            >
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-gray-900 text-base mb-1">{selectedLocation.name}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  {selectedLocation.address || `${Number(selectedLocation.lat).toFixed(6)}, ${Number(selectedLocation.lng).toFixed(6)}`}
                </p>
                
                <div className="flex items-center gap-2 mb-2">
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase" style={{ backgroundColor: getStatusColor(selectedLocation.status) }}>
                      {selectedLocation.status || 'Unknown'}
                   </span>
                   <span className="text-xs text-gray-500 border border-gray-300 px-2 py-0.5 rounded uppercase">
                      {selectedLocation.type}
                   </span>
                </div>

                {selectedLocation.details && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    {Object.entries(selectedLocation.details).map(([key, value]) => (
                      value ? (
                        <div key={key} className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500 font-medium">{key}:</span>
                          <span className="text-gray-800 font-semibold">{value}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>

      {/* Legend */}
      <div className="p-4 bg-white border-t border-gray-300 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 relative">
        <div className="flex flex-wrap gap-6 text-sm justify-center">
          <div className="flex items-center">
            <img src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" className="w-5 h-5 mr-2" alt="Pelanggan" />
            <span>Pelanggan</span>
          </div>
          <div className="flex items-center">
            <img src="http://maps.google.com/mapfiles/ms/icons/red-dot.png" className="w-5 h-5 mr-2" alt="OLT" />
            <span>OLT</span>
          </div>
          <div className="flex items-center">
            <img src="http://maps.google.com/mapfiles/ms/icons/yellow-dot.png" className="w-5 h-5 mr-2" alt="ODC" />
            <span>ODC</span>
          </div>
          <div className="flex items-center">
            <img src="http://maps.google.com/mapfiles/ms/icons/green-dot.png" className="w-5 h-5 mr-2" alt="ODP" />
            <span>ODP</span>
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">
          Total: {validLocations.length} lokasi valid ditampilkan
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;