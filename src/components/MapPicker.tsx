import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- FIX ICON LEAFLET YANG HILANG DI REACT ---
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
// ---------------------------------------------

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  height?: string;
}

// Komponen Kontroller Peta (Logic Inti)
const MapController: React.FC<{
  onSelect: (lat: number, lng: number) => void;
  position: L.LatLngExpression;
  setPosition: (pos: L.LatLng) => void;
}> = ({ onSelect, position, setPosition }) => {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  // Event Listener untuk Peta
  useMapEvents({
    // Saat peta sedang digeser (drag)
    move: () => {
      const center = map.getCenter();
      // Update posisi marker secara visual realtime agar tetap di tengah
      if (markerRef.current) {
        markerRef.current.setLatLng(center);
      }
    },
    // Saat peta selesai digeser (lepas klik)
    moveend: () => {
      const center = map.getCenter();
      // Update state lokal & kirim data ke parent
      setPosition(center);
      onSelect(center.lat, center.lng);
    },
    // Klik peta untuk pindah cepat
    click: (e) => {
        map.flyTo(e.latlng, map.getZoom());
        // Data akan terupdate oleh event moveend setelah flyTo selesai
    }
  });

  return (
    <Marker 
        position={position} 
        ref={markerRef}
        // Z-index offset tinggi agar marker selalu di atas
        zIndexOffset={1000} 
    >
      <Popup>Lokasi Terpilih</Popup>
    </Marker>
  );
};

// Komponen untuk Inisialisasi View Awal (Hanya jalan sekali atau saat props berubah drastis)
const InitialView: React.FC<{ center: L.LatLngExpression }> = ({ center }) => {
    const map = useMap();
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!initializedRef.current && center) {
            map.setView(center, 15);
            initializedRef.current = true;
        }
    }, [center, map]);

    return null;
};

const MapPicker: React.FC<MapPickerProps> = ({ 
  onLocationSelect, 
  initialLat, 
  initialLng, 
  height = '100%' 
}) => {
  // Default Jakarta
  const defaultCenter = new L.LatLng(-5.37491, 105.08024);
  
  // State lokal untuk posisi marker
  const [currentPosition, setCurrentPosition] = useState<L.LatLng>(
    (initialLat && initialLng) 
      ? new L.LatLng(initialLat, initialLng) 
      : defaultCenter
  );

  // Sinkronisasi jika parent mengubah koordinat (misal saat edit data)
  useEffect(() => {
    if (initialLat && initialLng) {
        const newPos = new L.LatLng(initialLat, initialLng);
        // Hanya update jika jaraknya cukup jauh (untuk menghindari infinite loop render)
        if (newPos.distanceTo(currentPosition) > 10) {
            setCurrentPosition(newPos);
        }
    }
  }, [initialLat, initialLng]);

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden h-full relative">
      <MapContainer
        center={currentPosition}
        zoom={15}
        style={{ height: height, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <InitialView center={currentPosition} />

        <MapController 
            onSelect={onLocationSelect} 
            position={currentPosition}
            setPosition={setCurrentPosition}
        />
      </MapContainer>
      
      {/* Indikator Koordinat di atas peta (Opsional, visual feedback) */}
      <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-90 p-2 rounded shadow text-xs text-gray-700 z-[1000] text-center">
        Lat: {currentPosition.lat.toFixed(6)}, Lng: {currentPosition.lng.toFixed(6)}
      </div>
    </div>
  );
};

export default MapPicker;