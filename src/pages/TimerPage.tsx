import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import AppSidebar from "@/components/AppSidebar";
import AccountMenu from "@/components/AccountMenu";
import { UI } from "@/constants/ui";
import {
    Home, Bell, Search, Plus, CalendarDays, Trash2, CheckCircle, Clock3,
} from "lucide-react";
import "./timer.css";

type TimerItem = {
    id: number;
    time: string;
    device: string;
    room: string;
    repeat: string;
    mode: "BẬT" | "TẮT";
    enabled: boolean;
};

const initialTimerList: TimerItem[] = [
    { id: 1, time: "07:00", device: "Smart LED", room: "Phòng khách", repeat: "Các ngày trong tuần", mode: "BẬT", enabled: true },
    { id: 2, time: "23:00", device: "Air Conditioner", room: "Phòng ngủ", repeat: "Hàng ngày", mode: "TẮT", enabled: true },
    { id: 3, time: "18:00", device: "Smart Fan", room: "Phòng khách", repeat: "Cuối tuần", mode: "BẬT", enabled: false },
];

function TimerCard({ item, onToggle, onDelete }: { item: TimerItem; onToggle: (id: number) => void; onDelete: (id: number) => void }) {
    return (
        <div className="timer-item-card">
            <div className="timer-item-left">
                <div className="timer-time-box">{item.time}</div>
                <div className="timer-item-content">
                    <div className="timer-item-title-row">
                        <h3>{item.device}</h3>
                        <span className={`timer-badge ${item.mode === "BẬT" ? "on" : "off"}`}>{item.mode}</span>
                    </div>
                    <div className="timer-item-meta">
                        <span><Home size={16} />{item.room}</span>
                        <span><CalendarDays size={16} />{item.repeat}</span>
                    </div>
                </div>
            </div>
            <div className="timer-item-actions">
                <button className={`toggle-switch ${item.enabled ? "on" : "off"}`} type="button" onClick={() => onToggle(item.id)}>
                    <span className="toggle-knob" />
                </button>
                <button className="delete-btn" type="button" onClick={() => onDelete(item.id)}>
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}

export default function TimerPage() {
    const { themeMode, toggleTheme } = useTheme();

    const [timers, setTimers] = useState<TimerItem[]>(initialTimerList);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAccountMenu, setShowAccountMenu] = useState(false);

    const totalCount = timers.length;
    const activeCount = timers.filter((t) => t.enabled).length;
    const inactiveCount = timers.filter((t) => !t.enabled).length;

    const timerStats = [
        { id: 1, title: "Tổng số lịch", value: String(totalCount), icon: <Clock3 size={20} />, theme: "blue" },
        { id: 2, title: "Đang hoạt động", value: String(activeCount), icon: <CheckCircle size={20} />, theme: "green" },
        { id: 3, title: "Đã tắt", value: String(inactiveCount), icon: <Clock3 size={20} />, theme: "gray" },
    ];

    const handleToggleTimer = (id: number) => {
        setTimers((prev) => prev.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t));
    };

    const handleDeleteTimer = (id: number) => {
        setTimers((prev) => prev.filter((t) => t.id !== id));
    };

    const handleCreateTimer = () => {
        setTimers((prev) => [{
            id: Date.now(), time: "20:30", device: "New Device",
            room: "Phòng khách", repeat: "Hàng ngày", mode: "BẬT", enabled: true,
        }, ...prev]);
    };

    return (
        <div className={`timer-page ${themeMode === "dark" ? "dark-mode" : ""}`}>
            <AppSidebar />

            <main className="timer-main">
                <header className="timer-topbar">
                    <div className="timer-topbar-left">
                        <button
                            type="button"
                            className="timer-avatar"
                            onClick={() => setShowAccountMenu((p) => !p)}
                        />
                        <h2>Welcome to Meomeo's Home</h2>
                        {showAccountMenu && (
                            <AccountMenu onClose={() => setShowAccountMenu(false)} themeMode={themeMode} />
                        )}
                    </div>

                    <div className="timer-topbar-right">
                        <div className="topbar-search-box">
                            <Search size={UI.TOPBAR_ICON_SIZE} />
                            <input type="text" placeholder="Search any devices here" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
                        <button className="timer-bell-btn" type="button"><Bell size={UI.TOPBAR_ICON_SIZE} /></button>
                    </div>
                </header>

                <section className="timer-content">
                    <div className="timer-header-row">
                        <div>
                            <h1>Lịch Hẹn Giờ</h1>
                            <p>Quản lý và theo dõi lịch trình của bạn</p>
                        </div>
                        <button className="create-timer-btn" type="button" onClick={handleCreateTimer}>
                            <Plus size={18} /><span>Tạo Lịch Mới</span>
                        </button>
                    </div>

                    <div className="timer-stats-grid">
                        {timerStats.map((stat) => (
                            <div className="timer-stat-card" key={stat.id}>
                                <div className={`timer-stat-icon ${stat.theme}`}>{stat.icon}</div>
                                <div className="timer-stat-text"><p>{stat.title}</p><h3>{stat.value}</h3></div>
                            </div>
                        ))}
                    </div>

                    <div className="timer-list">
                        {timers.map((item) => (
                            <TimerCard key={item.id} item={item} onToggle={handleToggleTimer} onDelete={handleDeleteTimer} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
