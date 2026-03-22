import { SunMedium, MoonStar } from "lucide-react";
import "./theme-toggle.css";

type ThemeToggleProps = {
  mode: "light" | "dark";
  onToggle: () => void;
};

export default function ThemeToggle({ mode, onToggle }: ThemeToggleProps) {
  return (
    <button type="button" className="theme-toggle-btn" onClick={onToggle}>
      {mode === "light" ? <SunMedium size={16} /> : <MoonStar size={16} />}
      <span>{mode === "light" ? "Light" : "Dark"}</span>
    </button>
  );
}