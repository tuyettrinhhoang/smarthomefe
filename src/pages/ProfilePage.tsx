import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import AppSidebar from "@/components/AppSidebar";
import AccountMenu from "@/components/AccountMenu";
import { UI } from "@/constants/ui";
import {
  Bell,
  Search,
  Pencil,
  Home,
  Zap,
  Clock3,
  Download,
  Fingerprint,
  ClipboardList,
  ChevronRight,
  LogOut,
  X,
  Check,
} from "lucide-react";
import "./profile.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useTheme();

  const [searchTerm, setSearchTerm]           = useState("");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isEditing, setIsEditing]             = useState(false);

  const [profile, setProfile] = useState({
    username:  "meomeo",
    email:     "meomeo@smarthome.vn",
    phone:     "+84 123 456 789",
    address:   "123 Đường ABC, Quận 1, TP.HCM",
    bio:       "",
  });

  const [draft, setDraft] = useState({ ...profile });

  const handleEdit  = () => { setDraft({ ...profile }); setIsEditing(true); };
  const handleSave  = () => { setProfile({ ...draft }); setIsEditing(false); };
  const handleCancel = () => setIsEditing(false);

  const stats = [
    { id: 1, label: "Thiết bị",      value: "15",      icon: <Home size={20} />,     color: "blue"   },
    { id: 2, label: "Phòng",         value: "5",       icon: <Zap size={20} />,      color: "purple" },
    { id: 3, label: "Lịch hẹn giờ", value: "8",       icon: <Clock3 size={20} />,   color: "green"  },
    { id: 4, label: "Tiêu thụ điện", value: "245 kWh", icon: <Download size={20} />, color: "yellow" },
  ];

  const securityItems = [
    { id: 1, label: "Đổi mật khẩu",       desc: "Cập nhật mật khẩu của bạn",    icon: <Download size={20} />,     color: "blue"   },
    { id: 2, label: "Xác thực hai yếu tố", desc: "Tăng cường bảo mật tài khoản", icon: <Fingerprint size={20} />,  color: "green"  },
    { id: 3, label: "Lịch sử hoạt động",   desc: "Xem các hoạt động gần đây",    icon: <ClipboardList size={20} />, color: "purple" },
  ];

  return (
    <div className={`profile-page ${themeMode === "dark" ? "dark-mode" : ""}`}>
      <AppSidebar />

      <main className="profile-main">
        {/* Topbar */}
        <header className="profile-topbar">
          <div className="profile-topbar-left">
            <button
              type="button"
              className="profile-avatar-btn"
              onClick={() => setShowAccountMenu((p) => !p)}
            />
            <h2>Welcome to Meomeo's Home</h2>
            {showAccountMenu && (
              <AccountMenu onClose={() => setShowAccountMenu(false)} themeMode={themeMode} />
            )}
          </div>

          <div className="profile-topbar-right">
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
            <button className="profile-bell-btn" type="button">
              <Bell size={UI.TOPBAR_ICON_SIZE} />
            </button>
          </div>
        </header>

        {/* Content */}
        <section className="profile-content">
          <div className="profile-page-header">
            <div>
              <h1>Thông Tin Tài Khoản</h1>
              <p>Quản lý thông tin cá nhân và cài đặt tài khoản</p>
            </div>
          </div>

          {/* Info card */}
          <div className="profile-card">
            {/* Avatar row */}
            <div className="profile-info-row">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar-large" />
                <button type="button" className="profile-avatar-edit">
                  <Pencil size={12} />
                </button>
              </div>

              <div className="profile-name-block">
                <h2>{profile.username}</h2>
                <p>{profile.email}</p>
                <div className="profile-badges">
                  <span className="badge green">Đang hoạt động</span>
                  <span className="badge blue">Tài khoản Premium</span>
                </div>
              </div>

              <div className="profile-edit-actions">
                {!isEditing ? (
                  <button type="button" className="btn-edit" onClick={handleEdit}>
                    <Pencil size={16} />
                    Chỉnh sửa
                  </button>
                ) : (
                  <>
                    <button type="button" className="btn-save" onClick={handleSave}>
                      <Check size={16} />
                      Lưu
                    </button>
                    <button type="button" className="btn-cancel" onClick={handleCancel}>
                      <X size={16} />
                      Hủy
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Fields grid */}
            <div className="profile-fields-grid">
              <div className="profile-field">
                <label>Tên đăng nhập</label>
                {isEditing
                  ? <input value={draft.username}  onChange={(e) => setDraft({ ...draft, username: e.target.value })} />
                  : <div className="profile-field-value">{profile.username}</div>
                }
              </div>

              <div className="profile-field">
                <label>Email</label>
                {isEditing
                  ? <input value={draft.email}    onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                  : <div className="profile-field-value">{profile.email}</div>
                }
              </div>

              <div className="profile-field">
                <label>Số điện thoại</label>
                {isEditing
                  ? <input value={draft.phone}    onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                  : <div className="profile-field-value">{profile.phone}</div>
                }
              </div>

              <div className="profile-field">
                <label>Địa chỉ</label>
                {isEditing
                  ? <input value={draft.address}  onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
                  : <div className="profile-field-value">{profile.address}</div>
                }
              </div>

              <div className="profile-field full-width">
                <label>Giới thiệu</label>
                {isEditing
                  ? <textarea rows={3} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} placeholder="Viết gì đó về bạn..." />
                  : <div className="profile-field-value bio">{profile.bio || <span className="placeholder">Chưa có giới thiệu</span>}</div>
                }
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="profile-stats-grid">
            {stats.map((s) => (
              <div className="profile-stat-card" key={s.id}>
                <div className={`profile-stat-icon ${s.color}`}>{s.icon}</div>
                <div className="profile-stat-text">
                  <span>{s.label}</span>
                  <strong>{s.value}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Security */}
          <div className="profile-card">
            <h3 className="profile-section-title">Bảo mật</h3>
            <div className="profile-security-list">
              {securityItems.map((item) => (
                <button key={item.id} type="button" className="profile-security-item">
                  <div className={`profile-security-icon ${item.color}`}>{item.icon}</div>
                  <div className="profile-security-text">
                    <strong>{item.label}</strong>
                    <span>{item.desc}</span>
                  </div>
                  <ChevronRight size={20} className="profile-security-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="profile-logout-card">
            <div>
              <strong>Đăng xuất khỏi tài khoản</strong>
              <p>Thoát khỏi tài khoản Smart Home của bạn</p>
            </div>
            <button
              type="button"
              className="btn-logout"
              onClick={() => navigate("/")}
            >
              <LogOut size={18} />
              Đăng Xuất
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
