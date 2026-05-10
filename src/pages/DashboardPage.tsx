import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import AppSidebar from "@/components/AppSidebar";
import AccountMenu from "@/components/AccountMenu";
import { UI } from "@/constants/ui";
import { Bell, Search, Zap } from "lucide-react";
import { dashboardService, toErrorMessage } from "@/services/api";
import { useAppStore } from "@/store/appStore";
import "./dashboard.css";

export default function DashboardPage() {
  const { themeMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<"connecting" | "connected" | "reconnecting">("connecting");
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const dashboard = useAppStore((state) => state.dashboard);
  const setDashboard = useAppStore((state) => state.setDashboard);

  useEffect(() => {
    let isUnmounted = false;
    setStreamStatus("connecting");

    const start = async () => {
      try {
        const snapshot = await dashboardService.getSnapshot();
        if (isUnmounted) return;
        setDashboard(snapshot);
        setLastUpdated(new Date().toLocaleTimeString("vi-VN"));
        setError("");
        setIsLoading(false);
      } catch (err) {
        if (isUnmounted) return;
        setError(toErrorMessage(err, "Không thể tải dữ liệu dashboard"));
        setIsLoading(false);
      }
    };

    void start();

    const stopStream = dashboardService.streamDashboard({
      onOpen: () => {
        if (isUnmounted) return;
        setStreamStatus("connected");
      },
      onSnapshot: (snapshot) => {
        if (isUnmounted) return;
        setDashboard(snapshot);
        setLastUpdated(new Date().toLocaleTimeString("vi-VN"));
        setError("");
        setIsLoading(false);
      },
      onHeartbeat: () => {
        if (isUnmounted) return;
        setLastHeartbeat(new Date().toLocaleTimeString("vi-VN"));
      },
      onError: (message) => {
        if (isUnmounted) return;
        setStreamStatus("reconnecting");
        setError(message);
      },
    });

    return () => {
      isUnmounted = true;
      stopStream();
    };
  }, [setDashboard]);

  const sensorCards = useMemo(
    () => [
      { title: "Nhiệt độ", value: dashboard?.temp?.value, suffix: "°C" },
      { title: "Độ ẩm", value: dashboard?.humi?.value, suffix: "%" },
      { title: "Ánh sáng", value: dashboard?.light?.value, suffix: "lux" },
      { title: "PIR", value: dashboard?.pir?.value, suffix: "" },
    ],
    [dashboard]
  );

  const deviceRows = useMemo(
    () => [dashboard?.led, dashboard?.fan].filter(Boolean),
    [dashboard]
  );

  const filteredRows = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return deviceRows;
    return deviceRows.filter((item) => {
      if (!item) return false;
      const text = `${item.deviceType} ${item.mode} ${item.state} ${item.lastCommandSource}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [deviceRows, searchTerm]);

  return (
    <div className={`dashboard-page ${themeMode === "dark" ? "dark-mode" : ""}`}>
      <AppSidebar />

      <main className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button
              type="button"
              className="dashboard-avatar"
              onClick={() => setShowAccountMenu((p) => !p)}
            />
            <h2>Welcome to Meomeo's Home</h2>
            {showAccountMenu && (
              <AccountMenu onClose={() => setShowAccountMenu(false)} themeMode={themeMode} />
            )}
          </div>
          <div className="dashboard-topbar-right">
            <div className="topbar-search-box">
              <Search size={UI.TOPBAR_ICON_SIZE} />
              <input type="text" placeholder="Tìm theo thiết bị, mode, trạng thái"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
            <button className="dashboard-bell-btn" type="button">
              <Bell size={UI.TOPBAR_ICON_SIZE} />
            </button>
          </div>
        </header>

        {/* Content */}
        <section className="dashboard-content">
          <div className="dashboard-page-header">
            <div>
              <h1>Bảng Điều Khiển</h1>
              <p>Dữ liệu realtime từ backend qua SSE có Authorization header</p>
              <p>
                Trạng thái stream: {streamStatus === "connected" ? "Đã kết nối" : streamStatus === "connecting" ? "Đang kết nối" : "Đang kết nối lại"}
              </p>
              {lastHeartbeat && <p>Heartbeat: {lastHeartbeat}</p>}
              {lastUpdated && <p>Cập nhật lần cuối: {lastUpdated}</p>}
              {error && <p style={{ color: "#d14343" }}>{error}</p>}
            </div>
          </div>

          {/* Sensor cards row 1 */}
          <div className="dash-summary-grid">
            {sensorCards.slice(0, 2).map((sensor) => (
              <div className="dash-summary-card" key={sensor.title}>
                <div className="dash-summary-icon soft"><Zap size={20} /></div>
                <div>
                  <p>{sensor.title}</p>
                  <h3>{sensor.value ?? "--"}{sensor.value !== undefined && sensor.value !== null ? sensor.suffix : ""}</h3>
                  <span>Dữ liệu sensor mới nhất</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sensor cards row 2 */}
          <div className="dash-summary-grid" style={{ marginTop: 16 }}>
            {sensorCards.slice(2).map((sensor) => (
              <div className="dash-summary-card" key={sensor.title}>
                <div className="dash-summary-icon soft"><Zap size={20} /></div>
                <div>
                  <p>{sensor.title}</p>
                  <h3>{sensor.value ?? "--"}{sensor.value !== undefined && sensor.value !== null ? sensor.suffix : ""}</h3>
                  <span>Dữ liệu sensor mới nhất</span>
                </div>
              </div>
            ))}
          </div>

          {/* Device table */}
          <div className="dash-card dash-table-card" style={{ marginTop: 16 }}>
            <div className="dash-card-head">
              <h3>Trạng thái thiết bị từ BE</h3>
              <span className="dash-unit">LED / FAN</span>
            </div>
            <div className="dash-table">
              <div className="dash-table-head">
                <span>Thiết bị</span>
                <span>Mode</span>
                <span>State</span>
                <span>Nguồn lệnh</span>
                <span>Cập nhật</span>
              </div>
              {isLoading && <div className="dash-table-row"><span>Đang tải...</span></div>}
              {!isLoading && filteredRows.length === 0 && (
                <div className="dash-table-row"><span>Không có dữ liệu thiết bị</span></div>
              )}
              {filteredRows.map((d, index) => {
                if (!d) return null;
                const color = index % 2 === 0 ? "#5f9bf5" : "#fbbf24";
                return (
                  <div key={d.deviceType} className="dash-table-row">
                    <span className="dash-device-name">
                      <span className="dash-device-dot" style={{ background: color }} />
                      {d.deviceType}
                    </span>
                    <span className="dash-device-room">{d.mode}</span>
                    <span className="dash-device-kwh">{d.state}</span>
                    <span className="dash-device-pct">{d.lastCommandSource}</span>
                    <span>{d.updatedAt ? new Date(d.updatedAt).toLocaleString("vi-VN") : "--"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
