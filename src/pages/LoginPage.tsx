import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { authService, toErrorMessage } from "@/services/api";
import { useAppStore } from "@/store/appStore";
import "./login.css";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setAuthFromLogin = useAppStore((state) => state.setAuthFromLogin);
  const setMe = useAppStore((state) => state.setMe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const loginRes = await authService.login({ username, password });
      setAuthFromLogin(loginRes);
      const me = await authService.me();
      setMe(me);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(toErrorMessage(err, "Đăng nhập thất bại"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="smart-login-page">
      <div className="smart-login-card">
        <div className="smart-login-header">
          <h1>Đăng Nhập</h1>
          <p>Chào mừng bạn quay trở lại!</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="smart-field">
            <label>Tên đăng nhập</label>
            <div className="smart-input-row">
              <User size={18} className="icon-left" />
              <input
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="smart-field">
            <label>Mật khẩu</label>
            <div className="smart-input-row">
              <Lock size={18} className="icon-left" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="icon-right"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="smart-login-options">
            <label className="remember-box">
              <input type="checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            <a href="/">Quên mật khẩu?</a>
          </div>

          {error && (
            <p style={{ marginTop: 14, color: "#d14343", fontSize: 14 }}>{error}</p>
          )}

          <button type="submit" className="smart-login-btn" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="smart-login-register">
            Chưa có tài khoản? <a href="/">Đăng ký ngay</a>
          </p>
        </form>
      </div>
    </div>
  );
}