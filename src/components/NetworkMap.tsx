import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- FIX ICON LEAFLET (Sama seperti di MapPicker) ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;
// ----------------------------------------------------

// Custom icons generator
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const customerIcon = createCustomIcon("#3B82F6"); // Blue
const oltIcon = createCustomIcon("#EF4444"); // Red
const odcIcon = createCustomIcon("#F59E0B"); // Yellow
const odpIcon = createCustomIcon("#10B981"); // Green

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
  height?: string;
  center?: [number, number];
  zoom?: number;
  showCoverage?: boolean;
  coverageRadius?: number;
}

// Komponen helper untuk update view peta saat props center berubah
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const NetworkMap: React.FC<NetworkMapProps> = ({
  locations,
  height = "600px",
  center = [-5.3738973, 105.0782348], // Default Lampung (sesuaikan kebutuhan)
  zoom = 13,
  showCoverage = true,
  coverageRadius = 1000,
}) => {
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "customer":
        return customerIcon;
      case "olt":
        return oltIcon;
      case "odc":
        return odcIcon;
      case "odp":
        return odpIcon;
      default:
        return DefaultIcon;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "text-gray-600";
    switch (status.toLowerCase()) {
      case "active":
        return "text-green-600";
      case "inactive":
        return "text-red-600";
      case "maintenance":
        return "text-yellow-600";
      case "pending":
        return "text-orange-500";
      case "suspended":
        return "text-gray-500";
      default:
        return "text-gray-600";
    }
  };

  // Validasi koordinat valid sebelum render
  const validLocations = locations.filter(
    (loc) =>
      loc.lat !== null &&
      loc.lng !== null &&
      !isNaN(Number(loc.lat)) &&
      !isNaN(Number(loc.lng))
  );

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: height, width: "100%", minHeight: "400px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Komponen ini penting agar peta mau pindah posisi saat data berubah */}
        <MapUpdater center={center} zoom={zoom} />

        {validLocations.map((location) => (
          <React.Fragment key={location.id}>
            <Marker
              position={[Number(location.lat), Number(location.lng)]}
              icon={getIcon(location.type)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-gray-900">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {location.address ||
                      `${Number(location.lat).toFixed(6)}, ${Number(
                        location.lng
                      ).toFixed(6)}`}
                  </p>

                  {location.status && (
                    <p
                      className={`text-sm ${getStatusColor(
                        location.status
                      )} font-medium capitalize`}
                    >
                      Status: {location.status}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    Tipe: {location.type.toUpperCase()}
                  </p>

                  {location.details && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      {Object.entries(location.details).map(([key, value]) =>
                        value ? (
                          <p key={key} className="text-xs text-gray-600">
                            <span className="font-medium">{key}:</span> {value}
                          </p>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* Show coverage area */}
            {showCoverage &&
              ["olt", "odc", "odp"].includes(location.type.toLowerCase()) && (
                <Circle
                  center={[Number(location.lat), Number(location.lng)]}
                  radius={coverageRadius}
                  pathOptions={{
                    color:
                      location.type.toLowerCase() === "olt"
                        ? "#EF4444"
                        : location.type.toLowerCase() === "odc"
                        ? "#F59E0B"
                        : "#10B981",
                    weight: 1,
                    opacity: 0.3,
                    fillOpacity: 0.1,
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
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2 border-2 border-white shadow-sm"></div>
            <span>Pelanggan</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2 border-2 border-white shadow-sm"></div>
            <span>OLT</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2 border-2 border-white shadow-sm"></div>
            <span>ODC</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2 border-2 border-white shadow-sm"></div>
            <span>ODP</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          Total: {validLocations.length} lokasi valid ditampilkan
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;
