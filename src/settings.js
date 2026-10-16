import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  HandCoins,
  ListChecks,
  RefreshCw,
  ArrowLeftRight,
  User,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import "./AppShell.css";
import { useAuth } from "./AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Apply for Loan", icon: HandCoins, path: "/apply-for-loan" },
  { label: "My Loans", icon: ListChecks, path: "/my-loans" },
  { label: "Repayments", icon: RefreshCw, path: "/make-a-repayment" },
  { label: "Transactions", icon: ArrowLeftRight, path: "/transactions" },
  { label: "Profile", icon: User, path: "/profile" },
  { label: "Settings", icon: SettingsIcon, path: "/settings" },
  { label: "Help & Support", icon: HelpCircle, path: "/help" },
];

const notificationOptions = [
  { key: "loanUpdates", title: "Loan Updates", desc: "Get notified when a loan is disbursed or approved" },
  { key: "paymentReminders", title: "Payment Reminders", desc: "Reminders before a repayment is due" },
  { key: "promotions", title: "Promotions & Offers", desc: "News about new loan products and offers" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, settings, updateSettings, logoutUser, resetPassword } = useAuth();
  const [resetMsg, setResetMsg] = useState("");

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(user.email);
      setResetMsg(`A password reset link was sent to ${user.email}.`);
    } catch (err) {
      setResetMsg("Couldn't send the reset email. Please try again.");
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand">
          <h1>Mkononi</h1>
          <p>Loan In Your Hands</p>
        </Link>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`nav-link ${item.label === "Settings" ? "active" : ""}`}
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-container">
          <div className="page-title-row">
            <Link to="/dashboard" className="back-btn">
              <ArrowLeft />
            </Link>
            <h2 className="page-title">Settings</h2>
          </div>

          <div className="card">
            <p className="settings-section-title">Notifications</p>
            {notificationOptions.map((option) => (
              <div key={option.key} className="settings-row">
                <div className="settings-row-text">
                  <p className="settings-row-title">{option.title}</p>
                  <p className="settings-row-desc">{option.desc}</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={!!settings[option.key]}
                    onChange={(e) => updateSettings({ [option.key]: e.target.checked })}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>

          <div className="card">
            <p className="settings-section-title">Security</p>
            <div className="settings-row" style={{ paddingBottom: 0 }}>
              <div className="settings-row-text">
                <p className="settings-row-title">Change Password</p>
                <p className="settings-row-desc">We'll email you a link to set a new password</p>
                {resetMsg && <p className="settings-row-desc" style={{ marginTop: 6 }}>{resetMsg}</p>}
              </div>
              <button className="danger-btn" style={{ background: "#0a1128" }} onClick={handleResetPassword}>
                Send Link
              </button>
            </div>
          </div>

          <div className="card">
            <p className="settings-section-title">Account</p>
            <div className="settings-row" style={{ paddingBottom: 0 }}>
              <div className="settings-row-text">
                <p className="settings-row-title">Log Out</p>
                <p className="settings-row-desc">Sign out of your Mkononi account on this device</p>
              </div>
              <button className="danger-btn" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}