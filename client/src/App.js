import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import Dashboard from "./pages/Dashboard";
import Donors from "./pages/Donors";
import MyRequests from "./pages/MyRequests";
import IncomingRequests from "./pages/IncomingRequests";
import MapView from "./pages/MapView";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Protected */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/donors" element={<PrivateRoute><Donors /></PrivateRoute>} />
        <Route path="/my-requests" element={<PrivateRoute><MyRequests /></PrivateRoute>} />
        <Route path="/incoming-requests" element={<PrivateRoute><IncomingRequests /></PrivateRoute>} />
        <Route path="/map" element={<PrivateRoute><MapView /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}