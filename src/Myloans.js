import { useState } from "react";
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

const tabs = ["Active", "Completed", "Pending"];

const badgeClassFor = (tab) =>
  tab === "Active" ? "badge-active" : tab === "Completed" ? "badge-completed" : "badge-pending";

export default function MyLoans() {
  const [activeTab, setActiveTab] = useState("Active");
  const { loans } = useAuth();

  const groupedLoans = {
    Active: loans.filter((l) => l.status === "Active"),
    Completed: loans.filter((l) => l.status === "Completed"),
    Pending: loans.filter((l) => l.status === "Pending"),
  };
  const activeLoans = groupedLoans[activeTab] || [];

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
              className={`nav-link ${item.label === "My Loans" ? "active" : ""}`}
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
          <h2 className="page-title" style={{ marginBottom: 24 }}>
            My Loans
          </h2>

          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeLoans.length === 0 ? (
            <div className="empty-state">No {activeTab.toLowerCase()} loans to show yet.</div>
          ) : (
            <div>
              {activeLoans.map((loan) => {
                const progressPercent = Math.round(
                  ((loan.amount - loan.remainingBalance) / loan.amount) * 100
                );
                return (
                  <div key={loan.id} className="card">
                    <div className="card-row-between">
                      <p style={{ margin: 0, fontWeight: 500, color: "#0a1128" }}>Loan #{loan.id}</p>
                      <span className={`badge ${badgeClassFor(activeTab)}`}>{activeTab}</span>
                    </div>

                    {activeTab === "Completed" ? (
                      <div className="info-list" style={{ marginBottom: 16 }}>
                        <div className="info-row">
                          <span className="info-row-label">Amount</span>
                          <span className="info-row-value">KSh {loan.amount.toLocaleString()}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-row-label">Paid on</span>
                          <span className="info-row-value">{loan.paidOn}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="loan-summary-grid">
                          <div>
                            <span className="label">Amount</span>
                            <span className="value">KSh {loan.amount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="label">Due Date</span>
                            <span className="value">{loan.dueDate}</span>
                          </div>
                          <div>
                            <span className="label">Remaining Balance</span>
                            <span className="value">KSh {loan.remainingBalance.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="progress-track" style={{ marginBottom: 4 }}>
                          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <p className="progress-percent" style={{ marginBottom: 16 }}>
                          {progressPercent}%
                        </p>
                      </>
                    )}

                    <Link to={`/loan-details/${loan.id}`} className="btn-outline">
                      View Details
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}