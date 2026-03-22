import { useNavigate, useLocation } from "react-router-dom";
import { Home, Zap, LayoutGrid, Clock3, Settings } from "lucide-react";
import { UI } from "@/constants/ui";
import "./app-layout.css";

type AppSidebarProps = {
  className?: string;
};

export default function AppSidebar({ className = "" }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/home";
  const isDevices = location.pathname === "/devices";
  const isTimers = location.pathname === "/timers";
  const isSettings = location.pathname === "/settings";

  return (
    <aside className={`app-sidebar ${className}`}>
      <button
        className={`app-nav-btn ${isHome ? "active" : ""}`}
        type="button"
        title="Trang chủ"
        onClick={() => navigate("/home")}
      >
        <Home size={UI.SIDEBAR_ICON_SIZE} />
      </button>

      <div className="app-sidebar-links">
        <button className="app-nav-ghost" type="button" title="Điện năng">
          <Zap size={UI.SIDEBAR_ICON_SIZE} />
        </button>

        <button
          className={`app-nav-btn ${isDevices ? "active" : "ghost"}`}
          type="button"
          title="Thiết bị"
          onClick={() => navigate("/devices")}
        >
          <LayoutGrid size={UI.SIDEBAR_ICON_SIZE} />
        </button>

        <button
          className={`app-nav-btn ${isTimers ? "active" : "ghost"}`}
          type="button"
          title="Lịch hẹn giờ"
          onClick={() => navigate("/timers")}
        >
          <Clock3 size={UI.SIDEBAR_ICON_SIZE} />
        </button>

        <button className="app-nav-ghost" type="button" title="Bảng điều khiển">
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