import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Network,
  Search,
  User,
  MonitorPlay,
} from "lucide-react";
import {
  infrastructureService,
  CustomerMonitorData,
} from "@/services/infrastructureService";
import { toast } from "sonner";

const CustomerMonitoring: React.FC = () => {
  const [data, setData] = useState<CustomerMonitorData[]>([]);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "online" | "offline"
  >("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await infrastructureService.getFormattedMonitoring();
      setData(result.data);
      setStats(result.stats);
      toast.success("Data status koneksi diperbarui");
    } catch (error) {
      toast.error("Gagal mengambil data dari MikroTik");
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: FORMAT UPTIME MIKROTIK ---
  const formatUptime = (uptime: string) => {
    if (!uptime || uptime === "-" || uptime === "") return "-";

    // Regex untuk memecah string (misal: 4d5h -> ["4d", "5h"])
    const parts = uptime.match(/(\d+[wdhms])/g);

    if (!parts) return uptime; // Kembalikan aslinya jika format tidak dikenali

    const unitMap: { [key: string]: string } = {
      w: "Minggu",
      d: "Hari",
      h: "Jam",
      m: "Menit",
      s: "Detik",
    };

    return parts
      .map((part) => {
        const unit = part.slice(-1); // Ambil huruf terakhir (w/d/h/m/s)
        const value = part.slice(0, -1); // Ambil angkanya
        return `${value} ${unitMap[unit] || unit}`;
      })
      .join(" ");
  };

  useEffect(() => {
    fetchData();
    // Auto refresh setiap 60 detik (opsional)
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pppoe_user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MonitorPlay className="w-8 h-8 mr-3 text-blue-600" />
              Monitoring Koneksi
            </h1>
            <p className="text-gray-600 mt-1">
              Status realtime pelanggan dari MikroTik
            </p>
          </div>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Status
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Pelanggan Aktif</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </h3>
              </div>
              <User className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Sedang Online</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {stats.online}
                </h3>
              </div>
              <Wifi className="w-8 h-8 text-green-200" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-gray-400">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Sedang Offline</p>
                <h3 className="text-2xl font-bold text-gray-600">
                  {stats.offline}
                </h3>
              </div>
              <WifiOff className="w-8 h-8 text-gray-200" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari Nama atau Username PPPoE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStatus("online")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === "online"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Online
            </button>
            <button
              onClick={() => setFilterStatus("offline")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === "offline"
                  ? "bg-gray-300 text-gray-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Offline
            </button>
          </div>
        </div>

        {/* Grid Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
                item.status === "online"
                  ? "border-green-200"
                  : "border-gray-200 opacity-90"
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {item.name}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500 mt-1 font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">
                      <User className="w-3 h-3 mr-1" /> {item.pppoe_user}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center ${
                      item.status === "online"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.status === "online" ? (
                      <Wifi className="w-3 h-3 mr-1" />
                    ) : (
                      <WifiOff className="w-3 h-3 mr-1" />
                    )}
                    {item.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500 flex items-center">
                      <Network className="w-4 h-4 mr-2" /> IP Address
                    </span>
                    <span className="font-mono text-gray-800">
                      {item.ip_address}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-2" /> Uptime
                    </span>
                    <span className="text-gray-800 font-medium">
                      {formatUptime(item.uptime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Paket</span>
                    <span className="text-blue-600 font-medium">
                      {item.package}
                    </span>
                  </div>
                </div>
              </div>
              {item.status === "online" && (
                <div className="bg-green-50 px-5 py-2 text-xs text-green-700 flex justify-between rounded-b-lg">
                  <span>Caller ID: {item.caller_id}</span>
                  <span className="animate-pulse">● Connected</span>
                </div>
              )}
              {item.status === "offline" && (
                <div className="bg-gray-50 px-5 py-2 text-xs text-gray-500 flex justify-between rounded-b-lg">
                  <span>Terakhir dilihat: -</span>
                  <span>Disconnected</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {!loading && filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm">
            <WifiOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada data pelanggan yang sesuai filter.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomerMonitoring;
