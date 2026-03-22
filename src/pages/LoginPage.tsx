import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import "./login.css";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              <input type="text" placeholder="Nhập tên đăng nhập" />
            </div>
          </div>

          <div className="smart-field">
            <label>Mật khẩu</label>
            <div className="smart-input-row">
              <Lock size={18} className="icon-left" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
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

          <button type="submit" className="smart-login-btn">
            Đăng nhập
          </button>

          <p className="smart-login-register">
            Chưa có tài khoản? <a href="/">Đăng ký ngay</a>
          </p>
        </form>
      </div>
    </div>
  );
}