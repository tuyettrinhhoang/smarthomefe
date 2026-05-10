import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import AppSidebar from "@/components/AppSidebar";
import AccountMenu from "@/components/AccountMenu";
import { UI } from "@/constants/ui";
import {
  Bell, Search, Thermometer, Sun, AlertTriangle, RotateCcw, Save, Wifi, WifiOff,
} from "lucide-react";
import {
  automationService, dashboardService, deviceService, toErrorMessage,
} from "@/services/api";
import { useAppStore } from "@/store/appStore";
import type {
  AutomationConfigResponse, DeviceMode, DeviceStatusResponse, DeviceType,
} from "@/types";
import "./settings.css";

const SLIDER_STEP = 0.5;
const RANGE_MIN = 0;
const RANGE_MAX = 100;

type FanDraft = { lowTemp: number; highTemp: number };
type LedDraft = { onThreshold: number; offThreshold: number };

type StreamStatus = "connecting" | "connected" | "reconnecting";

function clamp(v: number, min = RANGE_MIN, max = RANGE_MAX): number {
  if (Number.isNaN(v)) return min;
  return Math.min(Math.max(v, min), max);
}

function fmt(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function formatTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("vi-VN");
  } catch {
    return "—";
  }
}

/* -------------------- DUAL-HANDLE RANGE SLIDER -------------------- */

type DualSliderProps = {
  min: number;
  max: number;
  step: number;
  low: number;
  high: number;
  onChange: (next: { low: number; high: number }) => void;
  lowColor?: string;
  highColor?: string;
  fillColor?: string;
  unit?: string;
  disabled?: boolean;
};

function DualRangeSlider({
  min, max, step, low, high, onChange,
  lowColor = "#5f9bf5", highColor = "#ff6b6b", fillColor = "#bcd9ff",
  unit = "", disabled,
}: DualSliderProps) {
  const range = max - min;
  const lowPct = ((clamp(low, min, max) - min) / range) * 100;
  const highPct = ((clamp(high, min, max) - min) / range) * 100;

  const handleLow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    onChange({ low: Math.min(v, high), high });
  };
  const handleHigh = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    onChange({ low, high: Math.max(v, low) });
  };

  return (
    <div className={`dual-slider ${disabled ? "is-disabled" : ""}`}>
      <div className="dual-slider-track">
        <div
          className="dual-slider-fill"
          style={{
            left: `${lowPct}%`,
            width: `${Math.max(highPct - lowPct, 0)}%`,
            background: fillColor,
          }}
        />
      </div>

      <input
        type="range" min={min} max={max} step={step}
        value={low} onChange={handleLow} disabled={disabled}
        className="dual-slider-input low"
        style={{ ["--thumb-color" as string]: lowColor }}
        aria-label="Low threshold"
      />
      <input
        type="range" min={min} max={max} step={step}
        value={high} onChange={handleHigh} disabled={disabled}
        className="dual-slider-input high"
        style={{ ["--thumb-color" as string]: highColor }}
        aria-label="High threshold"
      />

      <div className="dual-slider-bubbles" aria-hidden>
        <span className="dual-slider-bubble low" style={{ left: `${lowPct}%`, background: lowColor }}>
          {fmt(low)}{unit}
        </span>
        <span className="dual-slider-bubble high" style={{ left: `${highPct}%`, background: highColor }}>
          {fmt(high)}{unit}
        </span>
      </div>

      <div className="dual-slider-axis">
        <span>{min}</span>
        <span>{Math.round((min + max) / 2)}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/* -------------------- DEVICE CARD -------------------- */

type DeviceCardProps<TDraft> = {
  title: string;
  subtitle: string;
  icon: JSX.Element;
  iconClass: string;
  device: DeviceStatusResponse | null;
  draft: TDraft;
  committed: TDraft;
  isDirty: boolean;
  isInvalid: string | null;
  isSaving: boolean;
  isModeChanging: boolean;
  onDraftChange: (next: { low: number; high: number }) => void;
  onReset: () => void;
  onSave: () => void;
  onSwitchMode: (mode: DeviceMode) => void;
  lowLabel: string;
  highLabel: string;
  lowColor: string;
  highColor: string;
  fillColor: string;
  unit: string;
  hint: string;
};

function DeviceCard<TDraft extends { low?: number; high?: number } | object>({
  title, subtitle, icon, iconClass, device, draft, committed, isDirty,
  isInvalid, isSaving, isModeChanging, onDraftChange, onReset, onSave, onSwitchMode,
  lowLabel, highLabel, lowColor, highColor, fillColor, unit, hint,
}: DeviceCardProps<TDraft>) {
  const mode = device?.mode ?? "AUTO";
  const state = device?.state ?? "OFF";
  const isOn = state === "ON";

  const draftAny = draft as unknown as Record<string, number>;
  const committedAny = committed as unknown as Record<string, number>;
  const draftKeys = Object.keys(draftAny);
  const lowKey = draftKeys[0];
  const highKey = draftKeys[1];

  return (
    <div className="auto-card">
      <header className="auto-card-head">
        <div className="auto-card-title">
          <div className={`auto-card-icon ${iconClass}`}>{icon}</div>
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>

        <div className="auto-card-status">
          <span className={`state-dot ${isOn ? "on" : "off"}`} aria-hidden />
          <span className="state-text">{state}</span>
        </div>
      </header>

      <div className="auto-mode-row">
        <span className="auto-mode-label">Chế độ</span>
        <div className="auto-mode-segment" role="radiogroup" aria-label="Mode">
          {(["AUTO", "MANUAL"] as DeviceMode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              className={`auto-mode-pill ${mode === m ? "active" : ""}`}
              onClick={() => mode !== m && onSwitchMode(m)}
              disabled={isModeChanging || !device}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === "MANUAL" && (
        <div className="auto-warn">
          <AlertTriangle size={16} />
          <span>
            Đang ở <strong>MANUAL</strong> — ngưỡng dưới sẽ chỉ có tác dụng khi chuyển sang <strong>AUTO</strong>.
          </span>
          <button
            type="button"
            className="auto-warn-action"
            onClick={() => onSwitchMode("AUTO")}
            disabled={isModeChanging || !device}
          >
            Bật AUTO
          </button>
        </div>
      )}

      <div className="auto-slider-block">
        <DualRangeSlider
          min={RANGE_MIN}
          max={RANGE_MAX}
          step={SLIDER_STEP}
          low={Number(draftAny[lowKey] ?? 0)}
          high={Number(draftAny[highKey] ?? 0)}
          onChange={onDraftChange}
          lowColor={lowColor}
          highColor={highColor}
          fillColor={fillColor}
          unit={unit}
          disabled={isSaving}
        />

        <div className="auto-legend">
          <div className="auto-legend-item">
            <span className="legend-swatch" style={{ background: lowColor }} />
            <span>{lowLabel}: <strong>{fmt(Number(draftAny[lowKey] ?? 0))}{unit}</strong></span>
          </div>
          <div className="auto-legend-item">
            <span className="legend-swatch" style={{ background: highColor }} />
            <span>{highLabel}: <strong>{fmt(Number(draftAny[highKey] ?? 0))}{unit}</strong></span>
          </div>
        </div>
      </div>

      <p className="auto-hint">{hint}</p>

      {isInvalid && <p className="auto-error">{isInvalid}</p>}

      <footer className="auto-card-foot">
        <div className="auto-last-cmd">
          {device?.lastCommandSource ? (
            <>
              <span className="muted">Lệnh gần nhất:</span>{" "}
              <strong>{device.lastCommandSource}</strong>
              {device.lastCommandReason ? <> · {device.lastCommandReason}</> : null}
              <span className="muted"> · {formatTime(device.lastCommandAt)}</span>
            </>
          ) : (
            <span className="muted">Chưa có lệnh nào.</span>
          )}
        </div>

        <div className="auto-card-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={onReset}
            disabled={!isDirty || isSaving}
          >
            <RotateCcw size={14} /> Đặt lại
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onSave}
            disabled={!isDirty || !!isInvalid || isSaving}
          >
            <Save size={14} /> {isSaving ? "Đang lưu…" : "Lưu ngưỡng"}
          </button>
        </div>
      </footer>

      {isDirty && (
        <div className="auto-dirty-hint">
          Có thay đổi chưa lưu so với cấu hình hiện tại
          ({fmt(Number(committedAny[lowKey] ?? 0))} → {fmt(Number(committedAny[highKey] ?? 0))})
        </div>
      )}
    </div>
  );
}

/* -------------------- PAGE -------------------- */

export default function SettingsPage() {
  const { themeMode, toggleTheme } = useTheme();

  const dashboard = useAppStore((s) => s.dashboard);
  const led = useAppStore((s) => s.led);
  const fan = useAppStore((s) => s.fan);
  const setDashboard = useAppStore((s) => s.setDashboard);
  const setDeviceStatus = useAppStore((s) => s.setDeviceStatus);

  const [config, setConfig] = useState<AutomationConfigResponse | null>(null);
  const [fanDraft, setFanDraft] = useState<FanDraft>({ lowTemp: 26, highTemp: 30 });
  const [ledDraft, setLedDraft] = useState<LedDraft>({ onThreshold: 50, offThreshold: 70 });

  const [searchTerm, setSearchTerm] = useState("");
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingFan, setIsSavingFan] = useState(false);
  const [isSavingLed, setIsSavingLed] = useState(false);
  const [modeChanging, setModeChanging] = useState<DeviceType | null>(null);

  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [streamStatus, setStreamStatus] = useState<StreamStatus>("connecting");

  const fanDirtyRef = useRef(false);
  const ledDirtyRef = useRef(false);

  const fanIsDirty = useMemo(() => {
    if (!config) return false;
    return fanDraft.lowTemp !== config.fanLowTemp || fanDraft.highTemp !== config.fanHighTemp;
  }, [fanDraft, config]);

  const ledIsDirty = useMemo(() => {
    if (!config) return false;
    return ledDraft.onThreshold !== config.ledOnThreshold || ledDraft.offThreshold !== config.ledOffThreshold;
  }, [ledDraft, config]);

  useEffect(() => { fanDirtyRef.current = fanIsDirty; }, [fanIsDirty]);
  useEffect(() => { ledDirtyRef.current = ledIsDirty; }, [ledIsDirty]);

  const fanError = useMemo(() => {
    if (fanDraft.lowTemp < RANGE_MIN || fanDraft.highTemp > RANGE_MAX) return `Giá trị phải nằm trong [${RANGE_MIN}, ${RANGE_MAX}].`;
    if (fanDraft.highTemp < fanDraft.lowTemp) return "Nhiệt độ cao phải ≥ nhiệt độ thấp.";
    return null;
  }, [fanDraft]);

  const ledError = useMemo(() => {
    if (ledDraft.onThreshold < RANGE_MIN || ledDraft.offThreshold > RANGE_MAX) return `Giá trị phải nằm trong [${RANGE_MIN}, ${RANGE_MAX}].`;
    if (ledDraft.offThreshold < ledDraft.onThreshold) return "Ngưỡng tắt phải ≥ ngưỡng bật.";
    return null;
  }, [ledDraft]);

  const applyConfig = useCallback((next: AutomationConfigResponse, force = false) => {
    setConfig(next);
    if (force || !fanDirtyRef.current) {
      setFanDraft({ lowTemp: next.fanLowTemp, highTemp: next.fanHighTemp });
    }
    if (force || !ledDirtyRef.current) {
      setLedDraft({ onThreshold: next.ledOnThreshold, offThreshold: next.ledOffThreshold });
    }
  }, []);

  useEffect(() => {
    let unmounted = false;
    setStreamStatus("connecting");

    (async () => {
      try {
        const [cfg, snapshot] = await Promise.all([
          automationService.getConfig(),
          dashboardService.getSnapshot().catch(() => null),
        ]);
        if (unmounted) return;
        applyConfig(cfg, true);
        if (snapshot) setDashboard(snapshot);
        setError("");
      } catch (err) {
        if (!unmounted) setError(toErrorMessage(err, "Không thể tải cấu hình automation"));
      } finally {
        if (!unmounted) setIsLoading(false);
      }
    })();

    const stop = dashboardService.streamDashboard({
      onOpen: () => !unmounted && setStreamStatus("connected"),
      onSnapshot: (snapshot) => {
        if (unmounted) return;
        setDashboard(snapshot);
        if (snapshot.automationConfig) applyConfig(snapshot.automationConfig);
        setStreamStatus("connected");
      },
      onError: () => !unmounted && setStreamStatus("reconnecting"),
    });

    return () => { unmounted = true; stop(); };
  }, [applyConfig, setDashboard]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const handleSaveFan = async () => {
    if (fanError) return;
    setIsSavingFan(true);
    try {
      const updated = await automationService.updateFanThreshold({
        lowTemp: fanDraft.lowTemp,
        highTemp: fanDraft.highTemp,
      });
      applyConfig(updated, true);
      setToast("Đã lưu ngưỡng FAN");
      setError("");
    } catch (err) {
      setError(toErrorMessage(err, "Không thể lưu ngưỡng FAN"));
    } finally {
      setIsSavingFan(false);
    }
  };

  const handleSaveLed = async () => {
    if (ledError) return;
    setIsSavingLed(true);
    try {
      const updated = await automationService.updateLedThreshold({
        onThreshold: ledDraft.onThreshold,
        offThreshold: ledDraft.offThreshold,
      });
      applyConfig(updated, true);
      setToast("Đã lưu ngưỡng LED");
      setError("");
    } catch (err) {
      setError(toErrorMessage(err, "Không thể lưu ngưỡng LED"));
    } finally {
      setIsSavingLed(false);
    }
  };

  const handleSwitchMode = async (deviceType: DeviceType, mode: DeviceMode) => {
    setModeChanging(deviceType);
    try {
      const updated = await deviceService.updateMode(deviceType, { mode });
      setDeviceStatus(updated);
      setToast(`${deviceType} → ${mode}`);
      setError("");
    } catch (err) {
      setError(toErrorMessage(err, "Không thể đổi mode thiết bị"));
    } finally {
      setModeChanging(null);
    }
  };

  return (
    <div className={`settings-page ${themeMode === "dark" ? "dark-mode" : ""}`}>
      <AppSidebar />

      <main className="settings-main">
        <header className="settings-topbar">
          <div className="settings-topbar-left">
            <button
              type="button"
              className="settings-avatar"
              style={{ border: "none", cursor: "pointer" }}
              onClick={() => setShowAccountMenu((p) => !p)}
            />
            <h2>Welcome to Meomeo's Home</h2>
            {showAccountMenu && (
              <AccountMenu onClose={() => setShowAccountMenu(false)} themeMode={themeMode} />
            )}
          </div>

          <div className="settings-topbar-right">
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
            <button className="settings-bell-btn" type="button"><Bell size={UI.TOPBAR_ICON_SIZE} /></button>
          </div>
        </header>

        <section className="settings-content">
          <div className="settings-header">
            <div>
              <h1>Cài đặt tự động</h1>
              <p>Cấu hình ngưỡng cảm biến cho FAN và LED. Ngưỡng chỉ kích hoạt khi thiết bị ở chế độ <strong>AUTO</strong>.</p>
            </div>

            <div className={`stream-pill ${streamStatus}`}>
              {streamStatus === "connected" ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>
                {streamStatus === "connected" ? "Realtime" :
                 streamStatus === "connecting" ? "Đang kết nối…" : "Đang kết nối lại…"}
              </span>
            </div>
          </div>

          {error && <div className="auto-banner error">{error}</div>}
          {toast && <div className="auto-banner success">{toast}</div>}
          {isLoading && !config && <div className="auto-banner info">Đang tải cấu hình…</div>}

          <div className="auto-cards">
            <DeviceCard<FanDraft>
              title="Quạt (FAN)"
              subtitle="Điều khiển theo nhiệt độ • °C"
              icon={<Thermometer size={20} />}
              iconClass="red"
              device={fan ?? dashboard?.fan ?? null}
              draft={fanDraft}
              committed={config ? { lowTemp: config.fanLowTemp, highTemp: config.fanHighTemp } : { lowTemp: 0, highTemp: 0 }}
              isDirty={fanIsDirty}
              isInvalid={fanError}
              isSaving={isSavingFan}
              isModeChanging={modeChanging === "FAN"}
              onDraftChange={({ low, high }) => setFanDraft({ lowTemp: low, highTemp: high })}
              onReset={() => config && setFanDraft({ lowTemp: config.fanLowTemp, highTemp: config.fanHighTemp })}
              onSave={handleSaveFan}
              onSwitchMode={(m) => handleSwitchMode("FAN", m)}
              lowLabel="Ngưỡng tắt (Low)"
              highLabel="Ngưỡng bật (High)"
              lowColor="#5f9bf5"
              highColor="#ff6b6b"
              fillColor="rgba(255,107,107,0.18)"
              unit="°C"
              hint={`Nhiệt độ ≤ ${fmt(fanDraft.lowTemp)}°C → tắt quạt. Nhiệt độ ≥ ${fmt(fanDraft.highTemp)}°C → bật quạt. Vùng giữa giữ nguyên trạng thái.`}
            />

            <DeviceCard<LedDraft>
              title="Đèn (LED)"
              subtitle="Điều khiển theo cường độ ánh sáng"
              icon={<Sun size={20} />}
              iconClass="yellow"
              device={led ?? dashboard?.led ?? null}
              draft={ledDraft}
              committed={config ? { onThreshold: config.ledOnThreshold, offThreshold: config.ledOffThreshold } : { onThreshold: 0, offThreshold: 0 }}
              isDirty={ledIsDirty}
              isInvalid={ledError}
              isSaving={isSavingLed}
              isModeChanging={modeChanging === "LED"}
              onDraftChange={({ low, high }) => setLedDraft({ onThreshold: low, offThreshold: high })}
              onReset={() => config && setLedDraft({ onThreshold: config.ledOnThreshold, offThreshold: config.ledOffThreshold })}
              onSave={handleSaveLed}
              onSwitchMode={(m) => handleSwitchMode("LED", m)}
              lowLabel="Bật khi tối ≤"
              highLabel="Tắt khi sáng ≥"
              lowColor="#ffb84d"
              highColor="#9c6bff"
              fillColor="rgba(255,184,77,0.18)"
              unit=""
              hint={`Ánh sáng ≤ ${fmt(ledDraft.onThreshold)} → bật đèn (đủ tối). Ánh sáng ≥ ${fmt(ledDraft.offThreshold)} → tắt đèn (đủ sáng). Vùng giữa giữ nguyên.`}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
