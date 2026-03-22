import { useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import AccountMenu from "@/components/AccountMenu";
import { UI } from "@/constants/ui";
import {
  Home, Zap, LayoutGrid, Clock3, Settings, Layers,
  Bell, Search, Droplets, Thermometer, Star, Fan, Monitor,
  Plus, X,
} from "lucide-react";
import "./home.css";

type SmartDevice = {
  id: number;
  name: string;
  room: string;
  subtitle: string;
  statusText: string;
  active: boolean;
  iconType: "star" | "fan" | "monitor" | "blank";
  level: number;
  mode: "OFF" | "AUTO" | "SWING";
  percent: number;
};

const initialDevices: SmartDevice[] = [
  { id: 1, name: "Smart LED",       room: "Phòng khách", subtitle: "ON",        statusText: "Active",   active: true,  iconType: "blank",   level: 3, mode: "AUTO", percent: 65 },
  { id: 2, name: "Smart Fan",       room: "Phòng khách", subtitle: "Level 3",   statusText: "Active",   active: true,  iconType: "fan",     level: 3, mode: "AUTO", percent: 65 },
  { id: 3, name: "Air Conditioner", room: "Phòng khách", subtitle: "24°C",      statusText: "Inactive", active: false, iconType: "blank",   level: 1, mode: "OFF",  percent: 0  },
  { id: 4, name: "TV",              room: "Phòng khách", subtitle: "Channel 5", statusText: "Active",   active: true,  iconType: "monitor", level: 2, mode: "AUTO", percent: 40 },
];

const initialRooms = ["Phòng khách", "Phòng ngủ", "Phòng bếp", "Phòng tắm", "Sân vườn"];

/* ── RING SVG ── */
function Ring({ percent, size = 160 }: { percent: number; size?: number }) {
  const stroke = 14;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const fill   = (percent / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8edf2" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="url(#ringGrad)" strokeWidth={stroke}
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9ed8e1" />
          <stop offset="100%" stopColor="#5f9bf5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── DEVICE MODAL ── */
function DeviceModal({
  device, onClose, onUpdate, themeMode,
}: {
  device: SmartDevice;
  onClose: () => void;
  onUpdate: (id: number, changes: Partial<SmartDevice>) => void;
  themeMode: "light" | "dark";
}) {
  const [level,   setLevel]   = useState(device.level);
  const [mode,    setMode]    = useState(device.mode);
  const [percent, setPercent] = useState(device.percent);

  const handleLevel = (l: number) => {
    setLevel(l);
    setPercent(Math.round((l / 5) * 100));
    if (mode === "OFF") setMode("AUTO");
  };

  const handleMode = (m: "OFF" | "AUTO" | "SWING") => {
    setMode(m);
    if (m === "OFF") { setPercent(0); setLevel(0); }
    else { setLevel(device.level || 3); setPercent(device.percent || 65); }
  };

  const handleSave = () => {
    onUpdate(device.id, { level, mode, percent, subtitle: mode === "OFF" ? "OFF" : `Level ${level}` });
    onClose();
  };

  return (
    <div className="device-modal-overlay" onClick={onClose}>
      <div className={`device-modal ${themeMode === "dark" ? "dark-mode" : ""}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="device-modal-header">
          <div>
            <h2>{device.name}</h2>
            <p>{device.room}</p>
          </div>
          <button type="button" className="device-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Ring */}
        <div className="device-modal-ring-wrap">
          <Ring percent={percent} />
          <div className="device-modal-ring-value">{percent},0%</div>
        </div>

        {/* Mode label */}
        <div className="device-modal-mode-label">
          <span>MODE</span>
          <strong>{mode}</strong>
        </div>

        {/* Level buttons */}
        <div className="device-modal-levels">
          {[1, 2, 3, 4, 5].map((l) => (
            <button
              key={l} type="button"
              className={`device-modal-level-btn ${level === l && mode !== "OFF" ? "active" : ""}`}
              onClick={() => handleLevel(l)}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Mode buttons */}
        <div className="device-modal-modes">
          {(["OFF", "AUTO", "SWING"] as const).map((m) => (
            <button
              key={m} type="button"
              className={`device-modal-mode-btn ${mode === m ? "active" : ""}`}
              onClick={() => handleMode(m)}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Save */}
        <button type="button" className="device-modal-save" onClick={handleSave}>
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

/* ── ADD POPUP ── */
function AddPopup({
  onAddRoom, onAddDevice, onClose, themeMode,
}: {
  onAddRoom: () => void;
  onAddDevice: () => void;
  onClose: () => void;
  themeMode: "light" | "dark";
}) {
  return (
    <>
      <div className="add-popup-overlay" onClick={onClose} />
      <div className={`add-popup ${themeMode === "dark" ? "dark-mode" : ""}`}>
        <button type="button" className="add-popup-item" onClick={() => { onAddRoom(); onClose(); }}>
          Thêm phòng
        </button>
        <button type="button" className="add-popup-item" onClick={() => { onAddDevice(); onClose(); }}>
          Thêm thiết bị
        </button>
      </div>
    </>
  );
}

/* ── DEVICE CARD ── */
function DeviceCard({
  device, onToggle, onOpen,
}: {
  device: SmartDevice;
  onToggle: (id: number) => void;
  onOpen: (d: SmartDevice) => void;
}) {
  return (
    <div className="home-device-card" style={{ cursor: "pointer" }} onClick={() => onOpen(device)}>
      <div className="home-device-top">
        <div className={`home-device-icon-box ${device.active ? "active" : "off"}`}>
          {renderDeviceIcon(device.iconType, device.active)}
        </div>
        <button
          type="button"
          className={`home-device-switch ${device.active ? "on" : "off"}`}
          onClick={(e) => { e.stopPropagation(); onToggle(device.id); }}
        >
          <span className="home-device-switch-knob" />
        </button>
      </div>
      <div className="home-device-main">
        <h3>{device.name}</h3>
        <p>{device.subtitle}</p>
      </div>
      <div className="home-device-divider" />
      <div className="home-device-status">
        <span>Status:</span>
        <strong className={device.active ? "active" : "inactive"}>
          {device.active ? "Active" : "Inactive"}
        </strong>
      </div>
    </div>
  );
}

function renderDeviceIcon(type: SmartDevice["iconType"], active: boolean) {
  const cls = "home-device-svg";
  if (!active && type === "blank") return <div className="home-device-placeholder" />;
  switch (type) {
    case "star":    return <Star    className={cls} size={UI.DEVICE_ICON_SIZE} />;
    case "fan":     return <Fan     className={cls} size={UI.DEVICE_ICON_SIZE} />;
    case "monitor": return <Monitor className={cls} size={UI.DEVICE_ICON_SIZE} />;
    default:        return <div className="home-device-placeholder" />;
  }
}

/* ── HOME PAGE ── */
export default function HomePage() {
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useTheme();

  const [devices,         setDevices]         = useState(initialDevices);
  const [rooms,           setRooms]           = useState(initialRooms);
  const [selectedRoom,    setSelectedRoom]    = useState("Phòng khách");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [selectedDevice,  setSelectedDevice]  = useState<SmartDevice | null>(null);
  const [showAddPopup,    setShowAddPopup]    = useState(false);

  const handleToggleDevice = (id: number) => {
    setDevices((prev) => prev.map((d) =>
      d.id === id ? { ...d, active: !d.active, statusText: !d.active ? "Active" : "Inactive" } : d
    ));
  };

  const handleUpdateDevice = (id: number, changes: Partial<SmartDevice>) => {
    setDevices((prev) => prev.map((d) => d.id === id ? { ...d, ...changes } : d));
  };

  const handleAddRoom = () => {
    const name = prompt("Tên phòng mới:");
    if (name?.trim()) setRooms((prev) => [...prev, name.trim()]);
  };

  const handleAddDevice = () => {
    const name = prompt("Tên thiết bị mới:");
    if (name?.trim()) {
      setDevices((prev) => [...prev, {
        id: Date.now(), name: name.trim(), room: selectedRoom,
        subtitle: "OFF", statusText: "Inactive", active: false,
        iconType: "blank", level: 1, mode: "OFF", percent: 0,
      }]);
    }
  };

  const filteredDevices = useMemo(() => {
    const kw = searchTerm.trim().toLowerCase();
    return devices.filter((d) =>
      d.room === selectedRoom &&
      (kw === "" || d.name.toLowerCase().includes(kw) || d.subtitle.toLowerCase().includes(kw))
    );
  }, [devices, selectedRoom, searchTerm]);

  return (
    <div className={`home-page ${themeMode === "dark" ? "dark-mode" : ""}`}>
      {/* Sidebar */}
      <aside className="home-sidebar">
        <button className="home-nav-btn active" type="button" title="Trang chủ" onClick={() => navigate("/home")}>
          <Home size={UI.SIDEBAR_ICON_SIZE} />
        </button>
        <div className="home-sidebar-links">
          <button className="home-nav-ghost" type="button" title="Thông báo" onClick={() => navigate("/notifications")}>
            <Zap size={UI.SIDEBAR_ICON_SIZE} />
          </button>
          <button className="home-nav-ghost" type="button" title="Thiết bị" onClick={() => navigate("/devices")}>
            <Layers size={UI.SIDEBAR_ICON_SIZE} />
          </button>
          <button className="home-nav-ghost" type="button" title="Lịch hẹn giờ" onClick={() => navigate("/timers")}>
            <Clock3 size={UI.SIDEBAR_ICON_SIZE} />
          </button>
          <button className="home-nav-ghost" type="button" title="Bảng điều khiển" onClick={() => navigate("/dashboard")}>
            <LayoutGrid size={UI.SIDEBAR_ICON_SIZE} />
          </button>
          <button className="home-nav-ghost" type="button" title="Cài đặt" onClick={() => navigate("/settings")}>
            <Settings size={UI.SIDEBAR_ICON_SIZE} />
          </button>
        </div>
      </aside>

      <main className="home-main">
        <header className="home-topbar">
          <div className="home-topbar-left">
            <button type="button" className="home-avatar" onClick={() => setShowAccountMenu((p) => !p)} />
            <h2>Welcome to Meomeo's Home</h2>
            {showAccountMenu && <AccountMenu onClose={() => setShowAccountMenu(false)} themeMode={themeMode} />}
          </div>
          <div className="home-topbar-right">
            <div className="topbar-search-box">
              <Search size={UI.TOPBAR_ICON_SIZE} />
              <input type="text" placeholder="Search any devices here" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
            <button className="home-bell-btn" type="button"><Bell size={UI.TOPBAR_ICON_SIZE} /></button>
          </div>
        </header>

        <section className="home-content">
          <section className="home-summary-grid">
            <div className="home-circle-card">
              <div className="home-card-head"><h4>Độ ẩm</h4><Droplets size={UI.TOPBAR_ICON_SIZE} /></div>
              <div className="home-ring-wrap"><div className="home-ring"><div className="home-ring-value">65,0%</div></div></div>
            </div>
            <div className="home-circle-card">
              <div className="home-card-head"><h4>Nhiệt độ</h4><Thermometer size={18} /></div>
              <div className="home-ring-wrap"><div className="home-ring"><div className="home-ring-value">24°C</div></div></div>
            </div>
            <div className="home-energy-card">
              <h3>Tổng tiêu thụ</h3>
              <div className="home-energy-row"><span>Tháng 3</span><strong>245 kWh</strong></div>
              <div className="home-energy-bar"><div className="home-energy-bar-fill" /></div>
              <div className="home-energy-divider" />
              <div className="home-energy-stats">
                <div><span>Phòng khách</span><strong>98 kWh</strong></div>
                <div><span>Phòng ngủ</span><strong>76 kWh</strong></div>
                <div><span>Phòng bếp</span><strong>71 kWh</strong></div>
              </div>
            </div>
          </section>

          <section className="home-device-section">
            <h1>Thiết bị thông minh</h1>
            <div className="home-device-grid">
              {filteredDevices.map((device) => (
                <DeviceCard key={device.id} device={device} onToggle={handleToggleDevice} onOpen={setSelectedDevice} />
              ))}
            </div>
          </section>

          <section className="home-room-bar">
            <div className="home-room-tabs">
              {rooms.map((room) => (
                <button key={room} type="button"
                  className={`home-room-tab ${selectedRoom === room ? "active" : ""}`}
                  onClick={() => setSelectedRoom(room)}
                >
                  {room}
                </button>
              ))}
            </div>
            <div style={{ position: "relative" }}>
              <button className="home-room-add-btn" type="button" onClick={() => setShowAddPopup((p) => !p)}>
                <Plus size={24} />
              </button>
              {showAddPopup && (
                <AddPopup
                  onAddRoom={handleAddRoom}
                  onAddDevice={handleAddDevice}
                  onClose={() => setShowAddPopup(false)}
                  themeMode={themeMode}
                />
              )}
            </div>
          </section>
        </section>
      </main>

      {/* Device modal */}
      {selectedDevice && (
        <DeviceModal
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
          onUpdate={handleUpdateDevice}
          themeMode={themeMode}
        />
      )}
    </div>
  );
}
