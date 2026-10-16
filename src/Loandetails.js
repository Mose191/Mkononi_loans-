import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
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

export default function LoanDetails() {
  const navigate = useNavigate();
  const { loanId } = useParams();
  const { loans } = useAuth();
  const loan = loans.find((l) => l.id === loanId);

  if (!loan) {
    return (
      <div className="app-shell">
        <main className="main-content">
          <div className="page-container narrow">
            <p style={{ color: "#94a3b8" }}>
              We couldn't find that loan.{" "}
              <Link to="/my-loans" className="text-link">
                Back to My Loans
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const paidSoFar = loan.amount - loan.remainingBalance;
  const progressPercent = Math.round((paidSoFar / loan.amount) * 100);

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
        <div className="page-container narrow">
          <div className="page-title-row">
            <Link to="/my-loans" className="back-btn">
              <ArrowLeft />
            </Link>
            <h2 className="page-title">Loan Details</h2>
          </div>

          <div className="card">
            <div className="card-row-between">
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#0a1128" }}>Loan #{loan.id}</p>
              <span className="badge badge-active">{loan.status}</span>
            </div>

            <div className="info-list" style={{ marginBottom: 24 }}>
              <div className="info-row">
                <span className="info-row-label">Loan Amount</span>
                <span className="info-row-value">KSh {loan.amount.toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Interest ({loan.interestRate}%)</span>
                <span className="info-row-value">KSh {loan.interest.toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Processing Fee</span>
                <span className="info-row-value">KSh {loan.processingFee.toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span style={{ fontWeight: 600, color: "#1e293b" }}>Total Repayment</span>
                <span style={{ color: "#1d4ed8", fontWeight: 700 }}>
                  KSh {loan.totalRepayment.toLocaleString()}
                </span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Amount Disbursed</span>
                <span className="info-row-value">{loan.amountDisbursed}</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Due Date</span>
                <span className="info-row-value">{loan.dueDate}</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Remaining Balance</span>
                <span className="info-row-value">KSh {loan.remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20, marginBottom: 24 }}>
              <p style={{ margin: "0 0 12px", fontWeight: 600, color: "#1e293b" }}>Repayment Progress</p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="card-sub" style={{ marginTop: 8 }}>
                You have paid KSh {paidSoFar.toLocaleString()} of KSh {loan.amount.toLocaleString()}
              </p>
            </div>

            {loan.status === "Active" && (
              <button type="button" onClick={() => navigate("/make-a-repayment")} className="btn-primary">
                Make a Repayment
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}