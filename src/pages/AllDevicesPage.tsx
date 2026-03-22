import { useEffect, useMemo, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import AppSidebar from "@/components/AppSidebar";
import AccountMenu from "@/components/AccountMenu";
import { UI } from "@/constants/ui";
import {
  Bell, Search, Star, Fan, Monitor, Camera, ChevronDown, Settings, Zap, Home,
} from "lucide-react";
import "./all-devices.css";

type Device = {
  id: number;
  name: string;
  room: string;
  consumption: string;
  lastUsed: string;
  status: "Hoạt động" | "Tắt";
  active: boolean;
  iconType: "star" | "fan" | "monitor" | "camera" | "blank";
};

const initialDevices: Device[] = [
  { id: 1, name: "Smart LED", room: "Phòng khách", consumption: "12W", lastUsed: "1 giờ trước", status: "Hoạt động", active: true, iconType: "star" },
  { id: 2, name: "Smart Fan", room: "Phòng khách", consumption: "75W", lastUsed: "2 giờ trước", status: "Hoạt động", active: true, iconType: "fan" },
  { id: 3, name: "Air Conditioner", room: "Phòng khách", consumption: "0W", lastUsed: "Hôm qua", status: "Tắt", active: false, iconType: "blank" },
  { id: 4, name: "TV", room: "Phòng khách", consumption: "120W", lastUsed: "30 phút trước", status: "Hoạt động", active: true, iconType: "monitor" },
  { id: 5, name: "Bedroom Light", room: "Phòng ngủ", consumption: "0W", lastUsed: "8 giờ trước", status: "Tắt", active: false, iconType: "star" },
  { id: 6, name: "Ceiling Fan", room: "Phòng ngủ", consumption: "60W", lastUsed: "15 phút trước", status: "Hoạt động", active: true, iconType: "fan" },
  { id: 7, name: "AC Unit", room: "Phòng ngủ", consumption: "1400W", lastUsed: "3 giờ trước", status: "Hoạt động", active: true, iconType: "blank" },
  { id: 8, name: "Smart Speaker", room: "Phòng ngủ", consumption: "0W", lastUsed: "2 ngày trước", status: "Tắt", active: false, iconType: "blank" },
  { id: 9, name: "Kitchen Light", room: "Phòng bếp", consumption: "18W", lastUsed: "1 giờ trước", status: "Hoạt động", active: true, iconType: "star" },
  { id: 10, name: "Exhaust Fan", room: "Phòng bếp", consumption: "0W", lastUsed: "12 giờ trước", status: "Tắt", active: false, iconType: "blank" },
  { id: 11, name: "Security Camera", room: "Phòng bếp", consumption: "8W", lastUsed: "10 phút trước", status: "Hoạt động", active: true, iconType: "camera" },
  { id: 12, name: "Dining Light", room: "Nhà ăn", consumption: "0W", lastUsed: "3 ngày trước", status: "Tắt", active: false, iconType: "star" },
  { id: 13, name: "Smart TV", room: "Nhà ăn", consumption: "0W", lastUsed: "4 ngày trước", status: "Tắt", active: false, iconType: "monitor" },
  { id: 14, name: "Play Room Light", room: "Sân vườn", consumption: "25W", lastUsed: "4 giờ trước", status: "Hoạt động", active: true, iconType: "star" },
  { id: 15, name: "Game Console", room: "Phòng khách", consumption: "150W", lastUsed: "6 giờ trước", status: "Hoạt động", active: true, iconType: "monitor" },
];

const roomTabs = ["Tất Cả Phòng", "Phòng khách", "Phòng ngủ", "Nhà ăn", "Phòng bếp", "Sân vườn"] as const;
const statusOptions = ["Tất cả thiết bị", "Đang bật", "Đang tắt"] as const;
type StatusFilter = (typeof statusOptions)[number];
type RoomFilter = (typeof roomTabs)[number];

function DeviceCard({ device, onToggle }: { device: Device; onToggle: (id: number) => void }) {
  return (
    <div className={`device-card ${device.active ? "is-active" : "is-off"}`}>
      <div className="device-card-top">
        <div className={`device-icon-box ${device.active ? "active" : "off"}`}>
          {renderDeviceIcon(device.iconType, device.active)}
        </div>
        <button
          className={`device-switch ${device.active ? "on" : "off"}`}
          type="button"
          onClick={() => onToggle(device.id)}
        >
          <span className="device-switch-knob" />
        </button>
      </div>
      <div className="device-main">
        <h3>{device.name}</h3>
        <p>{device.room}</p>
      </div>
      <div className="device-divider" />
      <div className="device-meta">
        <div className="meta-row">
          <span>Tiêu thụ:</span>
          <strong className={device.active ? "blue" : "muted"}>{device.consumption}</strong>
        </div>
        <div className="meta-row">
          <span>Dùng lần cuối:</span>
          <strong className="normal">{device.lastUsed}</strong>
        </div>
        <div className="meta-row">
          <span>Trạng thái:</span>
          <strong className={device.active ? "green" : "normal"}>{device.active ? "Hoạt động" : "Tắt"}</strong>
        </div>
      </div>
    </div>
  );
}

function renderDeviceIcon(type: Device["iconType"], active: boolean) {
  const className = "device-svg-icon";
  if (!active && type === "blank") return <div className="device-placeholder-icon" />;
  switch (type) {
    case "star": return <Star className={className} size={UI.DEVICE_ICON_SIZE} />;
    case "fan": return <Fan className={className} size={UI.DEVICE_ICON_SIZE} />;
    case "monitor": return <Monitor className={className} size={UI.DEVICE_ICON_SIZE} />;
    case "camera": return <Camera className={className} size={UI.DEVICE_ICON_SIZE} />;
    default: return <div className="device-placeholder-icon" />;
  }
}

export default function AllDevicesPage() {
  const { themeMode, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [selectedRoom, setSelectedRoom] = useState<RoomFilter>("Tất Cả Phòng");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("Tất cả thiết bị");
  const [searchTerm, setSearchTerm] = useState("");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleDevice = (id: number) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, active: !d.active, status: !d.active ? "Hoạt động" : "Tắt" } : d
      )
    );
  };

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const matchRoom = selectedRoom === "Tất Cả Phòng" || d.room === selectedRoom;
      const matchStatus = selectedStatus === "Tất cả thiết bị" || (selectedStatus === "Đang bật" && d.active) || (selectedStatus === "Đang tắt" && !d.active);
      const keyword = searchTerm.trim().toLowerCase();
      const matchSearch = keyword === "" || d.name.toLowerCase().includes(keyword) || d.room.toLowerCase().includes(keyword);
      return matchRoom && matchStatus && matchSearch;
    });
  }, [devices, selectedRoom, selectedStatus, searchTerm]);

  const totalDevices = devices.length;
  const activeDevices = devices.filter((d) => d.active).length;
  const activeRooms = new Set(devices.filter((d) => d.active).map((d) => d.room)).size;

  return (
    <div className={`all-devices-page ${themeMode === "dark" ? "dark-mode" : ""}`}>
      <AppSidebar />

      <main className="home-main">
        <header className="home-topbar">
          <div className="home-topbar-left">
            <button
              type="button"
              className="home-avatar"
              onClick={() => setShowAccountMenu((prev) => !prev)}
            />
            <h2>Welcome to Meomeo's Home</h2>
            {showAccountMenu && (
              <AccountMenu onClose={() => setShowAccountMenu(false)} themeMode={themeMode} />
            )}
          </div>

          <div className="home-topbar-right">
            <div className="topbar-search-box">
              <Search size={UI.TOPBAR_ICON_SIZE} />
              <input
                type="text"
                placeholder="Search any devices here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
            <button className="app-bell-btn" type="button"><Bell size={UI.TOPBAR_ICON_SIZE} /></button>
          </div>
        </header>

        <section className="content-wrap">
          <div className="page-heading">
            <h1>Tất Cả Thiết Bị</h1>
            <p>Quản lý và điều khiển tất cả thiết bị trong nhà của bạn</p>
          </div>

          <section className="summary-grid">
            <div className="summary-card primary">
              <div>
                <p>Tổng Thiết Bị</p>
                <h3>{totalDevices}</h3>
                <span>{activeDevices} đang hoạt động</span>
              </div>
              <div className="summary-icon"><Settings size={UI.TOPBAR_ICON_SIZE} /></div>
            </div>
            <div className="summary-card">
              <div>
                <p>Tiêu Thụ Hiện Tại</p>
                <h3>1.87</h3>
                <span>kW (kilowatts)</span>
              </div>
              <div className="summary-icon soft"><Zap size={UI.TOPBAR_ICON_SIZE} /></div>
            </div>
            <div className="summary-card">
              <div>
                <p>Phòng Đang Dùng</p>
                <h3>{activeRooms}</h3>
                <span>/ 5 phòng</span>
              </div>
              <div className="summary-icon soft"><Home size={UI.TOPBAR_ICON_SIZE} /></div>
            </div>
          </section>

          <section className="filter-panel">
            <div className="filter-left">
              <h4>Chọn Phòng</h4>
              <div className="room-tabs">
                {roomTabs.map((room) => (
                  <button key={room} className={`room-tab ${selectedRoom === room ? "active" : ""}`} type="button" onClick={() => setSelectedRoom(room)}>
                    {room}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-right">
              <h4>Trạng Thái</h4>
              <div className="status-dropdown-wrap" ref={dropdownRef}>
                <button className={`status-dropdown-btn ${showStatusMenu ? "open" : ""}`} type="button" onClick={() => setShowStatusMenu((p) => !p)}>
                  <span>{selectedStatus}</span>
                  <ChevronDown size={UI.TOPBAR_ICON_SIZE} className="status-dropdown-arrow" />
                </button>
                {showStatusMenu && (
                  <div className="status-dropdown-menu">
                    {statusOptions.map((option, i) => (
                      <button key={option} type="button"
                        className={`status-dropdown-item ${selectedStatus === option ? "active" : ""} ${i < statusOptions.length - 1 ? "with-border" : ""}`}
                        onClick={() => { setSelectedStatus(option); setShowStatusMenu(false); }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="device-grid">
            {filteredDevices.map((device) => (
              <DeviceCard key={device.id} device={device} onToggle={handleToggleDevice} />
            ))}
          </section>
        </section>
      </main>
    </div>
  );
}
