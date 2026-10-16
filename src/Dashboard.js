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
  Bell,
  Repeat,
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

const quickActions = [
  { label: "Repay Loan", icon: Repeat, path: "/make-a-repayment" },
  { label: "Transactions", icon: ArrowLeftRight, path: "/transactions" },
  { label: "My Profile", icon: User, path: "/profile" },
  { label: "Help", icon: HelpCircle, path: "/help" },
];

export default function Dashboard() {
  const { user, loans } = useAuth();
  const displayName = user?.fullName || "there";
  const creditLimit = 25000;

  // Most recent Active loan, if any — a brand-new user has none of these.
  const currentLoan = loans.find((l) => l.status === "Active") || null;

  const availableCredit = currentLoan ? creditLimit - currentLoan.remainingBalance : creditLimit;
  const progressPercent = currentLoan
    ? Math.round(((currentLoan.amount - currentLoan.remainingBalance) / currentLoan.amount) * 100)
    : 0;

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
              className={`nav-link ${item.label === "Dashboard" ? "active" : ""}`}
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
        <div className="topbar">
          <div>
            <p className="greeting-line">How Are You Today,</p>
            <h2 className="greeting-name">{displayName} 👋</h2>
          </div>
          <div className="topbar-actions">
            <button className="icon-circle-btn">
              <Bell />
              <span className="notif-dot" />
            </button>
            <Link to="/profile" className="avatar-circle" style={{ overflow: "hidden" }}>
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <User />
              )}
            </Link>
          </div>
        </div>

        <div className="dashboard-grid">
          <div>
            <div className="card">
              <p className="card-label">Available Credit</p>
              <p className="card-value-lg">KSh {availableCredit.toLocaleString()}</p>
              <p className="card-sub">of KSh {creditLimit.toLocaleString()}</p>
              <div className="progress-track" style={{ marginTop: 16 }}>
                <div
                  className="progress-fill green"
                  style={{ width: `${Math.round((availableCredit / creditLimit) * 100)}%` }}
                />
              </div>
              <Link to="/apply-for-loan" className="btn-primary" style={{ marginTop: 20 }}>
                Apply for Loan
              </Link>
            </div>

            <div className="card">
              <div className="card-row-between">
                <p style={{ margin: 0, fontWeight: 600, color: "#1e293b" }}>Current Loan</p>
                <Link to="/my-loans" className="text-link">
                  View All
                </Link>
              </div>

              {currentLoan ? (
                <>
                  <div className="card-row-between" style={{ marginBottom: 12 }}>
                    <p style={{ margin: 0, fontWeight: 500, color: "#0a1128" }}>Loan #{currentLoan.id}</p>
                    <span className="badge badge-active">{currentLoan.status}</span>
                  </div>
                  <div className="info-list">
                    <div className="info-row">
                      <span className="info-row-label">Amount Borrowed</span>
                      <span className="info-row-value">KSh {currentLoan.amount.toLocaleString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-row-label">Remaining Balance</span>
                      <span className="info-row-value">KSh {currentLoan.remainingBalance.toLocaleString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-row-label">Due Date</span>
                      <span className="info-row-value">{currentLoan.dueDate}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <div className="progress-track">
                      <div className="progress-fill dark" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="progress-percent">{progressPercent}%</p>
                  </div>
                </>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: 14 }}>
                  You have no active loans yet.{" "}
                  <Link to="/apply-for-loan" className="text-link">
                    Apply for your first loan
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="card" style={{ height: "fit-content" }}>
            <p style={{ margin: "0 0 16px", fontWeight: 600, color: "#1e293b" }}>Quick Actions</p>
            <div className="quick-actions-grid">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.path} className="quick-action-item">
                  <div className="quick-action-icon">
                    <action.icon />
                  </div>
                  <span className="quick-action-label">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}