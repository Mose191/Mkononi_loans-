import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  HandCoins,
  ListChecks,
  RefreshCw,
  ArrowLeftRight,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ArrowLeft,
  Camera,
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
  { label: "Settings", icon: Settings, path: "/settings" },
  { label: "Help & Support", icon: HelpCircle, path: "/help" },
];

export default function MyProfile() {
  const { user, updateProfilePicture } = useAuth();
  const fileInputRef = useRef(null);

  const personalInfo = [
    { label: "Full Name", value: user?.fullName || "Not provided" },
    { label: "Phone Number", value: user?.phone || "Not provided" },
    { label: "Email Address", value: user?.email || "Not provided" },
    { label: "ID Number", value: user?.idNumber ? "••••••••" : "Not provided" },
    { label: "Residential Address", value: user?.residentialAddress || "Not provided" },
  ];

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Please choose an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateProfilePicture(reader.result);
    reader.readAsDataURL(file);
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
              className={`nav-link ${item.label === "Profile" ? "active" : ""}`}
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn">
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
            <h2 className="page-title">My Profile</h2>
          </div>

          <div className="card">
            <div className="profile-header">
              <div
                className="profile-avatar-lg"
                style={{ position: "relative", cursor: "pointer", overflow: "hidden" }}
                onClick={() => fileInputRef.current?.click()}
                title="Change profile photo"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <User />
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: "#1d4ed8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #ffffff",
                  }}
                >
                  <Camera size={12} color="#ffffff" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  style={{ display: "none" }}
                />
              </div>
              <div>
                <p className="profile-name">{user?.fullName || "Not provided"}</p>
                <p className="profile-meta">{user?.phone || "Not provided"}</p>
                <p className="profile-meta">{user?.email || "Not provided"}</p>
              </div>
            </div>

            <div className="card-row-between">
              <p style={{ margin: 0, fontWeight: 600, color: "#1e293b" }}>Personal Information</p>
              <button className="edit-link">Edit</button>
            </div>

            <div className="info-list">
              {personalInfo.map((item) => (
                <div key={item.label} className="info-row">
                  <span className="info-row-label">{item.label}</span>
                  <span className="info-row-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}