import { useState } from "react";
import { Link } from "react-router-dom";
import{useAuth} from "./AuthContext";
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
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import "./AppShell.css";

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

const tabs = ["All", "Loans", "Repayments", "Fees"];

export default function Transactions() {
  const { transactions } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const filtered = activeTab === "All" ? transactions : transactions.filter((t) => t.type === activeTab);

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
              className={`nav-link ${item.label === "Transactions" ? "active" : ""}`}
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
          <div className="page-title-row with-action">
            <div className="page-title-row-left">
              <Link to="/dashboard" className="back-btn">
                <ArrowLeft />
              </Link>
              <h2 className="page-title">Transactions</h2>
            </div>
            <button className="icon-circle-btn" style={{ position: "static" }}>
              <SlidersHorizontal />
            </button>
          </div>

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

          <div className="tx-list">
            {filtered.length === 0 ? (
              <p className="empty-state" style={{ border: "none" }}>
                No transactions in this category yet.
              </p>
            ) : (
              filtered.map((t) => (
                <div key={t.id} className="tx-row">
                  <div className={`tx-icon-circle ${t.direction}`}>
                    {t.direction === "in" ? <ArrowDownToLine /> : <ArrowUpFromLine />}
                  </div>
                  <div className="tx-info">
                    <p className="tx-title">{t.title}</p>
                    <p className="tx-ref">{t.reference}</p>
                  </div>
                  <div className="tx-meta">
                    <p className={`tx-amount ${t.direction}`}>
                      {t.direction === "in" ? "+" : "-"} KSh {t.amount.toLocaleString()}
                    </p>
                    <p className="tx-date">{t.date}</p>
                    <p className="tx-status">{t.status}</p>
                  </div>
                  <ChevronRight className="tx-chevron" />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}