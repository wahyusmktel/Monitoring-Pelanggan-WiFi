import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Customers from "@/pages/Customers";
import Subscriptions from "@/pages/Subscriptions";
import OLTPage from "@/pages/OLT";
import ODCPage from "@/pages/ODC";
import ODPPage from "@/pages/ODP";
import PortMonitoring from "@/pages/PortMonitoring";
import Payments from "@/pages/Payments";
import PaymentMonitoring from "@/pages/PaymentMonitoring";
import Settings from "@/pages/Settings";
import NetworkMapPage from "@/pages/NetworkMapPage";

// --- KOMPONEN SATPAM (PROTECTED ROUTE) ---
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  // Jika tidak ada token, tendang ke halaman Login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Jika ada, izinkan masuk ke halaman anak (Outlet)
  return <Outlet />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Public (Login) */}
        <Route path="/" element={<Login />} />
          {/* Semua route di dalam sini dilindungi oleh ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payment-monitoring" element={<PaymentMonitoring />} />
          <Route path="/olt" element={<OLTPage />} />
          <Route path="/odc" element={<ODCPage />} />
          <Route path="/odp" element={<ODPPage />} />
          <Route path="/port-monitoring" element={<PortMonitoring />} />
          <Route path="/network-map" element={<NetworkMapPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
        </Route>
      </Routes>
    </Router>
  );
}
