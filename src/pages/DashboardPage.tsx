import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import AppSidebar from "@/components/AppSidebar";
import AccountMenu from "@/components/AccountMenu";
import { UI } from "@/constants/ui";
import { Bell, Search, Zap, TrendingUp, TrendingDown } from "lucide-react";
import "./dashboard.css";

type Period = "day" | "week" | "month";

const barData: Record<Period, { label: string; value: number }[]> = {
  day: [
    { label: "00h", value: 2  },
    { label: "03h", value: 1  },
    { label: "06h", value: 4  },
    { label: "09h", value: 9  },
    { label: "12h", value: 14 },
    { label: "15h", value: 11 },
    { label: "18h", value: 16 },
    { label: "21h", value: 10 },
  ],
  week: [
    { label: "T2", value: 28 },
    { label: "T3", value: 35 },
    { label: "T4", value: 22 },
    { label: "T5", value: 40 },
    { label: "T6", value: 38 },
    { label: "T7", value: 52 },
    { label: "CN", value: 45 },
  ],
  month: [
    { label: "T1",  value: 210 },
    { label: "T2",  value: 185 },
    { label: "T3",  value: 245 },
    { label: "T4",  value: 198 },
    { label: "T5",  value: 270 },
    { label: "T6",  value: 255 },
    { label: "T7",  value: 230 },
    { label: "T8",  value: 260 },
    { label: "T9",  value: 215 },
    { label: "T10", value: 240 },
    { label: "T11", value: 220 },
    { label: "T12", value: 280 },
  ],
};

const periodLabel: Record<Period, string> = {
  day: "Hôm nay",
  week: "Tuần này",
  month: "Năm này",
};

const deviceStats = [
  { name: "Air Conditioner", room: "Phòng ngủ",   kwh: 98,  color: "#5f9bf5" },
  { name: "TV",              room: "Phòng khách",  kwh: 52,  color: "#6ee7b7" },
  { name: "Smart Fan",       room: "Phòng khách",  kwh: 38,  color: "#fbbf24" },
  { name: "AC Unit",         room: "Phòng ngủ",    kwh: 35,  color: "#f87171" },
  { name: "Smart LED",       room: "Phòng khách",  kwh: 12,  color: "#a78bfa" },
  { name: "Kitchen Light",   room: "Phòng bếp",    kwh: 10,  color: "#34d399" },
];

const totalKwh = deviceStats.reduce((s, d) => s + d.kwh, 0);

// Build SVG donut chart
function buildDonut(devices: typeof deviceStats, size: number, stroke: number) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const slices = devices.map((d) => {
    const pct = d.kwh / totalKwh;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const slice = { ...d, dash, gap, offset };
    offset += dash;
    return slice;
  });
  return { slices, r, cx, cy, circumference };
}

function BarChart({ period }: { period: Period }) {
  const data   = barData[period];
  const max    = Math.max(...data.map((d) => d.value));
  const H      = 180;
  const BAR_W  = 32;
  const GAP    = 16;
  const W      = data.length * (BAR_W + GAP) - GAP + 20;

  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} className="dash-bar-svg">
      {data.map((d, i) => {
        const barH  = (d.value / max) * H;
        const x     = i * (BAR_W + GAP) + 10;
        const y     = H - barH;
        const isMax = d.value === max;
        return (
          <g key={d.label}>
            <rect
              x={x} y={y}
              width={BAR_W} height={barH}
              rx={8}
              fill={isMax ? "url(#barGradientPeak)" : "url(#barGradient)"}
              opacity={isMax ? 1 : 0.75}
            />
            <text x={x + BAR_W / 2} y={H + 18} textAnchor="middle" className="dash-bar-label">
              {d.label}
            </text>
            {isMax && (
              <text x={x + BAR_W / 2} y={y - 6} textAnchor="middle" className="dash-bar-peak">
                {d.value}
              </text>
            )}
          </g>
        );
      })}
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ed8e1" />
          <stop offset="100%" stopColor="#6aaef8" />
        </linearGradient>
        <linearGradient id="barGradientPeak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5f9bf5" />
          <stop offset="100%" stopColor="#3a7bd5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function DonutChart() {
  const SIZE   = 200;
  const STROKE = 32;
  const { slices, r, cx, cy } = buildDonut(deviceStats, SIZE, STROKE);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="dash-donut-svg">
      {slices.map((s) => (
        <circle
          key={s.name}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={STROKE}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
      <text x={cx} y={cy - 8}  textAnchor="middle" className="donut-center-value">{totalKwh}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="donut-center-label">kWh</text>
    </svg>
  );
}

export default function DashboardPage() {
  const { themeMode, toggleTheme } = useTheme();
  const [period, setPeriod]               = useState<Period>("month");
  const [searchTerm, setSearchTerm]       = useState("");
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const data    = barData[period];
  const total   = data.reduce((s, d) => s + d.value, 0);
  const avg     = (total / data.length).toFixed(1);
  const peak    = Math.max(...data.map((d) => d.value));
  const prevTotal = total * (period === "month" ? 0.93 : 0.88);
  const trendPct  = (((total - prevTotal) / prevTotal) * 100).toFixed(1);
  const isUp      = total > prevTotal;

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
              <input type="text" placeholder="Search any devices here"
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
              <p>Thống kê tiêu thụ điện năng của ngôi nhà bạn</p>
            </div>
            {/* Period tabs */}
            <div className="dash-period-tabs">
              {(["day", "week", "month"] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`dash-period-tab ${period === p ? "active" : ""}`}
                  onClick={() => setPeriod(p)}
                >
                  {periodLabel[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Summary cards */}
          <div className="dash-summary-grid">
            <div className="dash-summary-card primary">
              <div className="dash-summary-icon"><Zap size={22} /></div>
              <div>
                <p>Tổng tiêu thụ</p>
                <h3>{total} kWh</h3>
                <span className={isUp ? "trend up" : "trend down"}>
                  {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {Math.abs(Number(trendPct))}% so với kỳ trước
                </span>
              </div>
            </div>
            <div className="dash-summary-card">
              <div className="dash-summary-icon soft"><Zap size={20} /></div>
              <div>
                <p>Trung bình</p>
                <h3>{avg} kWh</h3>
                <span>mỗi {period === "day" ? "giờ" : period === "week" ? "ngày" : "tháng"}</span>
              </div>
            </div>
            <div className="dash-summary-card">
              <div className="dash-summary-icon soft"><TrendingUp size={20} /></div>
              <div>
                <p>Đỉnh tiêu thụ</p>
                <h3>{peak} kWh</h3>
                <span>{periodLabel[period]}</span>
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="dash-charts-row">
            {/* Bar chart */}
            <div className="dash-card dash-bar-card">
              <div className="dash-card-head">
                <h3>Tiêu thụ theo {period === "day" ? "giờ" : period === "week" ? "ngày" : "tháng"}</h3>
                <span className="dash-unit">kWh</span>
              </div>
              <div className="dash-bar-wrap">
                <BarChart period={period} />
              </div>
            </div>

            {/* Donut chart */}
            <div className="dash-card dash-donut-card">
              <div className="dash-card-head">
                <h3>Phân bổ theo thiết bị</h3>
                <span className="dash-unit">Tháng 3</span>
              </div>
              <div className="dash-donut-wrap">
                <DonutChart />
              </div>
              <div className="dash-legend">
                {deviceStats.map((d) => (
                  <div key={d.name} className="dash-legend-item">
                    <span className="dash-legend-dot" style={{ background: d.color }} />
                    <span className="dash-legend-name">{d.name}</span>
                    <span className="dash-legend-pct">{((d.kwh / totalKwh) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Device table */}
          <div className="dash-card dash-table-card">
            <div className="dash-card-head">
              <h3>Chi tiết thiết bị</h3>
              <span className="dash-unit">Tháng 3 • Tổng: {totalKwh} kWh</span>
            </div>
            <div className="dash-table">
              <div className="dash-table-head">
                <span>Thiết bị</span>
                <span>Phòng</span>
                <span>Tiêu thụ</span>
                <span>Tỷ lệ</span>
                <span>Thanh tiến trình</span>
              </div>
              {deviceStats.map((d) => {
                const pct = ((d.kwh / totalKwh) * 100).toFixed(1);
                return (
                  <div key={d.name} className="dash-table-row">
                    <span className="dash-device-name">
                      <span className="dash-device-dot" style={{ background: d.color }} />
                      {d.name}
                    </span>
                    <span className="dash-device-room">{d.room}</span>
                    <span className="dash-device-kwh">{d.kwh} kWh</span>
                    <span className="dash-device-pct">{pct}%</span>
                    <div className="dash-progress-wrap">
                      <div
                        className="dash-progress-fill"
                        style={{ width: `${pct}%`, background: d.color }}
                      />
                    </div>
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
