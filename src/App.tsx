import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/payment-monitoring" element={<PaymentMonitoring />} />
        <Route path="/olt" element={<OLTPage />} />
        <Route path="/odc" element={<ODCPage />} />
        <Route path="/odp" element={<ODPPage />} />
        <Route path="/port-monitoring" element={<PortMonitoring />} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}
