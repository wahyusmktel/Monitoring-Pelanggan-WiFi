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
import CustomerLogin from "@/pages/portal/CustomerLogin";
import CustomerChangePassword from "@/pages/portal/CustomerChangePassword";
import CustomerDashboard from "@/pages/portal/CustomerDashboard";
import MikrotikSecrets from "@/pages/MikrotikSecrets";
import CustomerMonitoring from "@/pages/CustomerMonitoring";

// --- SATPAM ADMIN (Cek 'token') ---
const AdminRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

// --- SATPAM PELANGGAN (Cek 'customer_token') ---
const CustomerRoute = () => {
  const token = localStorage.getItem('customer_token');
  return token ? <Outlet /> : <Navigate to="/portal/login" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Public (Login) */}
        <Route path="/" element={<Login />} />
          {/* Semua route di dalam sini dilindungi oleh ProtectedRoute */}
        <Route element={<AdminRoute />}>
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
          <Route path="/mikrotik/secrets" element={<MikrotikSecrets />} />
          <Route path="/customer-monitoring" element={<CustomerMonitoring />} />
        </Route>
        {/* --- AREA PELANGGAN (PORTAL) --- */}
        <Route path="/portal/login" element={<CustomerLogin />} />
        
        <Route element={<CustomerRoute />}>
            <Route path="/portal/change-password" element={<CustomerChangePassword />} />
            <Route path="/portal/dashboard" element={<CustomerDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
