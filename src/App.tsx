import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AllDevicesPage from "./pages/AllDevicesPage";
import TimerPage from "./pages/TimerPage";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import { useAppStore } from "./store/appStore";

import "@/styles/global.css"; 

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = useAppStore((state) => state.accessToken);
  if (!token) return <Navigate to="/" replace />;
  return children;
}

function PublicLoginRoute() {
  const token = useAppStore((state) => state.accessToken);
  if (token) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLoginRoute />} />
        <Route path="/devices" element={<ProtectedRoute><AllDevicesPage /></ProtectedRoute>} />
        <Route path="/timers" element={<ProtectedRoute><TimerPage /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;