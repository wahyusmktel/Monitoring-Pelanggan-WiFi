import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  height?: string;
}

const MapPicker: React.FC<MapPickerProps> = ({ 
  onLocationSelect, 
  initialLat, 
  initialLng, 
  height = '100%' 
}) => {
  // 1. Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyDQSR0tu_uijvHsHMIMiMOcOVxbGIuPSpk', // Pastikan key ini sudah di-whitelist di Google Console
  });

  // Default Center (Lampung)
  const defaultCenter = { lat: -5.37491, lng: 105.08024 };

  // State
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  // 2. Sync Initial Position (jika sedang edit data)
  useEffect(() => {
    if (initialLat && initialLng) {
      const newPos = { lat: Number(initialLat), lng: Number(initialLng) };
      setCenter(newPos);
      setMarkerPosition(newPos);
    }
  }, [initialLat, initialLng]);

  // 3. Map Events Handlers
  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  // Logic Inti: Saat peta digeser, update posisi marker ke tengah peta
  const handleCenterChanged = () => {
    if (map) {
      const newCenter = map.getCenter();
      if (newCenter) {
        const lat = newCenter.lat();
        const lng = newCenter.lng();
        
        // Update visual marker agar selalu di tengah
        setMarkerPosition({ lat, lng });
      }
    }
  };

  // Logic Inti: Saat peta BERHENTI digeser (idle), kirim data ke parent
  const handleIdle = () => {
    if (map) {
      const newCenter = map.getCenter();
      if (newCenter) {
        const lat = newCenter.lat();
        const lng = newCenter.lng();
        
        // Kirim koordinat final ke form parent
        onLocationSelect(lat, lng);
      }
    }
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full bg-gray-100">Memuat Peta...</div>;
  }

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden h-full relative">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: height }}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onCenterChanged={handleCenterChanged} // Marker ikut gerak saat peta digeser
        onIdle={handleIdle} // Update data saat peta berhenti
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: false,
          // mapId diperlukan untuk menghilangkan warning deprecated marker
          // dan mengaktifkan rendering vektor yang lebih baru.
          // Anda bisa membuat Map ID sendiri di Google Cloud Console -> Maps Management -> Map IDs
          mapId: "DEMO_MAP_ID",
          mapTypeId: 'hybrid'
        }}
      >
        {/* Marker selalu di tengah (mengikuti markerPosition state) */}
        <MarkerF
          position={markerPosition}
          // animation={google.maps.Animation.DROP} // Opsional: Animasi drop kadang bikin pusing kalau geser cepat
        />
      </GoogleMap>

      {/* Indikator Koordinat di atas peta */}
      <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-90 p-2 rounded shadow text-xs text-gray-700 z-[100] text-center font-mono">
        Lat: {markerPosition.lat.toFixed(6)}, Lng: {markerPosition.lng.toFixed(6)}
      </div>
      
      {/* Crosshair / Titik Tengah (Opsional, visual bantu agar user tau titik tengahnya) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-50">
        <div className="w-4 h-4 border-2 border-black rounded-full"></div>
        <div className="w-1 h-1 bg-black rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default MapPicker;