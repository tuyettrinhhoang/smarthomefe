import { useNavigate } from "react-router-dom";
import { User, LogOut, ChevronRight } from "lucide-react";

type AccountMenuProps = {
  onClose: () => void;
  themeMode: "light" | "dark";
};

export default function AccountMenu({ onClose, themeMode }: AccountMenuProps) {
  const navigate = useNavigate();

  return (
    <div className={`account-menu ${themeMode === "dark" ? "dark-mode" : ""}`}>
      <div className="account-menu-header">
        <div className="account-avatar-large" />
        <div>
          <h3>meomeo</h3>
          <p>meomeo@smarthome.vn</p>
        </div>
      </div>

      <button
        type="button"
        className="account-menu-item"
        onClick={() => { navigate("/profile"); onClose(); }}
      >
        <div className="account-menu-icon blue">
          <User size={24} />
        </div>
        <div className="account-menu-text">
          <strong>Thông Tin Tài Khoản</strong>
          <span>Xem và chỉnh sửa hồ sơ</span>
        </div>
        <ChevronRight size={26} className="account-menu-arrow" />
      </button>

      <button
        type="button"
        className="account-menu-item logout"
        onClick={() => { navigate("/"); onClose(); }}
      >
        <div className="account-menu-icon red">
          <LogOut size={24} />
        </div>
        <div className="account-menu-text">
          <strong>Đăng Xuất</strong>
          <span>Thoát khỏi tài khoản</span>
        </div>
      </button>
    </div>
  );
}
