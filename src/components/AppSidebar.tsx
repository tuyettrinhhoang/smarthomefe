import { useNavigate, useLocation } from "react-router-dom";
import { Home, Zap, Layers, Clock3, LayoutGrid, Settings } from "lucide-react";
import { UI } from "@/constants/ui";
import "./app-layout.css";

type AppSidebarProps = {
  className?: string;
};

export default function AppSidebar({ className = "" }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome          = location.pathname === "/home";
  const isNotifications = location.pathname === "/notifications";
  const isDevices       = location.pathname === "/devices";
  const isTimers        = location.pathname === "/timers";
  const isDashboard     = location.pathname === "/dashboard";
  const isSettings      = location.pathname === "/settings";

  return (
    <aside className={`app-sidebar ${className}`}>
      <button
        className={`app-nav-btn ${isHome ? "active" : "ghost"}`}
        type="button"
        title="Trang chủ"
        onClick={() => navigate("/home")}
      >
        <Home size={UI.SIDEBAR_ICON_SIZE} />
      </button>

      <div className="app-sidebar-links">
        <button
          className={`app-nav-btn ${isNotifications ? "active" : "ghost"}`}
          type="button"
          title="Thông báo"
          onClick={() => navigate("/notifications")}
        >
          <Zap size={UI.SIDEBAR_ICON_SIZE} />
        </button>

        <button
          className={`app-nav-btn ${isDevices ? "active" : "ghost"}`}
          type="button"
          title="Thiết bị"
          onClick={() => navigate("/devices")}
        >
          <Layers size={UI.SIDEBAR_ICON_SIZE} />
        </button>

        <button
          className={`app-nav-btn ${isTimers ? "active" : "ghost"}`}
          type="button"
          title="Lịch hẹn giờ"
          onClick={() => navigate("/timers")}
        >
          <Clock3 size={UI.SIDEBAR_ICON_SIZE} />
        </button>

        <button
          className={`app-nav-btn ${isDashboard ? "active" : "ghost"}`}
          type="button"
          title="Bảng điều khiển"
          onClick={() => navigate("/dashboard")}
        >
          <LayoutGrid size={UI.SIDEBAR_ICON_SIZE} />
        </button>

        <button
          className={`app-nav-btn ${isSettings ? "active blue" : "ghost"}`}
          type="button"
          title="Cài đặt"
          onClick={() => navigate("/settings")}
        >
          <Settings size={UI.SIDEBAR_ICON_SIZE} />
        </button>
      </div>
    </aside>
  );
}
