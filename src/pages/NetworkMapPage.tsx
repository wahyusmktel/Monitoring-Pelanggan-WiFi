import React, { useState, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import NetworkMap from "@/components/NetworkMap";
import {
  MapPin,
  Users,
  Server,
  Router,
  Box,
  RefreshCw,
  Download,
  Loader2,
  Search,
} from "lucide-react";
import {
  infrastructureService,
  MapLocation,
} from "@/services/infrastructureService";
import { toast } from "sonner";

const NetworkMapPage: React.FC = () => {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCoverage, setShowCoverage] = useState(true);
  const [coverageRadius, setCoverageRadius] = useState(1000);

  // Fetch Data dari API
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await infrastructureService.getNetworkMapLocations();
      console.log("Data Peta Diterima:", data); // Debugging
      setLocations(data);
    } catch (error) {
      toast.error("Gagal memuat data peta");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Filter locations
  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const matchesSearch =
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (location.address &&
          location.address.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = filterType === "all" || location.type === filterType;
      const matchesStatus =
        filterStatus === "all" || location.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [locations, searchTerm, filterType, filterStatus]);

  // LOGIC BARU: Tentukan Titik Tengah Peta Dinamis
  const mapCenter: [number, number] = useMemo(() => {
    if (filteredLocations.length > 0) {
      // Jika ada data, ambil koordinat data pertama sebagai pusat
      return [
        Number(filteredLocations[0].lat),
        Number(filteredLocations[0].lng),
      ];
    }
    // Default ke SMK Telkom Lampung (Sesuai datamu) jika kosong
    return [-5.3738973, 105.0782348];
  }, [filteredLocations]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = locations.length;
    const customers = locations.filter((l) => l.type === "customer").length;
    const olt = locations.filter((l) => l.type === "olt").length;
    const odc = locations.filter((l) => l.type === "odc").length;
    const odp = locations.filter((l) => l.type === "odp").length;

    const active = locations.filter((l) => l.status === "active").length;
    const inactive = locations.filter((l) => l.status === "inactive").length;
    const maintenance = locations.filter(
      (l) =>
        l.status === "maintenance" ||
        l.status === "suspended" ||
        l.status === "pending"
    ).length;

    return { total, customers, olt, odc, odp, active, inactive, maintenance };
  }, [locations]);

  const handleExportData = () => {
    const data = filteredLocations.map((loc) => ({
      Nama: loc.name,
      Tipe: loc.type.toUpperCase(),
      Status: loc.status || "-",
      Alamat: loc.address || "-",
      Latitude: loc.lat,
      Longitude: loc.lng,
    }));

    const csvContent = [
      ["Nama", "Tipe", "Status", "Alamat", "Latitude", "Longitude"],
      ...data.map((row) => Object.values(row).map((val) => `"${val}"`)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "network-infrastructure.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            <span className="ml-3 text-gray-600">Memuat peta jaringan...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Peta Infrastruktur Jaringan
            </h1>
            <p className="text-gray-600 mt-1">
              Visualisasi sebaran pelanggan dan infrastruktur jaringan
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-xs font-medium text-gray-600">
                  Total Lokasi
                </p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-xs font-medium text-gray-600">Pelanggan</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.customers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <Server className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-xs font-medium text-gray-600">OLT</p>
                <p className="text-xl font-bold text-gray-900">{stats.olt}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <Router className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-xs font-medium text-gray-600">ODC</p>
                <p className="text-xl font-bold text-gray-900">{stats.odc}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <Box className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-xs font-medium text-gray-600">ODP</p>
                <p className="text-xl font-bold text-gray-900">{stats.odp}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Aktif</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Problem</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.maintenance}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cari Lokasi
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nama atau alamat..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter Tipe
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Tipe</option>
                <option value="customer">Pelanggan</option>
                <option value="olt">OLT</option>
                <option value="odc">ODC</option>
                <option value="odp">ODP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Non-Aktif</option>
                <option value="maintenance">Maintenance</option>
                <option value="pending">Pending (Cust)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterStatus("all");
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2 inline" />
                Reset
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCoverage}
                  onChange={(e) => setShowCoverage(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Tampilkan Area Jangkauan
                </span>
              </label>

              {showCoverage && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Radius:</label>
                  <select
                    value={coverageRadius}
                    onChange={(e) => setCoverageRadius(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={500}>500m</option>
                    <option value={1000}>1km</option>
                    <option value={1500}>1.5km</option>
                    <option value={2000}>2km</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Component */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Peta Sebaran
            </h2>
            <div className="text-sm text-gray-600">
              Menampilkan {filteredLocations.length} dari {locations.length}{" "}
              lokasi
            </div>
          </div>

          {/* Container Peta dengan CSS Manual */}
          <div
            style={{
              height: 'calc(100vh - 200px)',
              width: "100%",
              position: "relative",
              zIndex: 0,
            }}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <NetworkMap
              locations={filteredLocations as any}
              height="100%"
              // PENTING: Gunakan mapCenter yang sudah dihitung dinamis
              center={mapCenter}
              zoom={13} // Zoom agak diperbesar karena kita fokus ke area data
              showCoverage={showCoverage}
              coverageRadius={coverageRadius}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NetworkMapPage;
