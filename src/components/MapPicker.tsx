import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface MapPickerProps {
  value?: Location;
  onChange: (location: Location) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

const LocationMarker: React.FC<{ position: L.LatLngExpression; onDragEnd: (latlng: L.LatLng) => void }> = ({ position, onDragEnd }) => {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (marker != null) {
            onDragEnd(marker.getLatLng());
          }
        },
      }}
    >
      <Popup>Drag untuk memindahkan lokasi</Popup>
    </Marker>
  );
};

const MapClickHandler: React.FC<{ onMapClick: (latlng: L.LatLng) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const MapPicker: React.FC<MapPickerProps> = ({ 
  value, 
  onChange, 
  height = '400px',
  center = [-6.2088, 106.8456], // Jakarta coordinates
  zoom = 13
}) => {
  const [position, setPosition] = React.useState<L.LatLngExpression>(
    value ? [value.lat, value.lng] : center
  );

  const handlePositionChange = (latlng: L.LatLng) => {
    const newLocation = {
      lat: latlng.lat,
      lng: latlng.lng,
      address: value?.address || ''
    };
    setPosition([latlng.lat, latlng.lng]);
    onChange(newLocation);
  };

  const handleMapClick = (latlng: L.LatLng) => {
    handlePositionChange(latlng);
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
        <MapClickHandler onMapClick={handleMapClick} />
        {position && (
          <LocationMarker
            position={position}
            onDragEnd={handlePositionChange}
          />
        )}
      </MapContainer>
      {value && (
        <div className="p-3 bg-gray-50 border-t border-gray-300">
          <p className="text-sm text-gray-600">
            <strong>Koordinat:</strong> {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </p>
          {value.address && (
            <p className="text-sm text-gray-600 mt-1">
              <strong>Alamat:</strong> {value.address}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MapPicker;