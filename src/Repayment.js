import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Smartphone,
  Landmark,
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

const paymentMethods = [
  { id: "mpesa", label: "M-Pesa", icon: Smartphone },
  { id: "bank", label: "Bank Transfer", icon: Landmark },
];

export default function MakeARepayment() {
  const navigate = useNavigate();
  const { loans, makeRepayment } = useAuth();
  const activeLoan = loans.find((l) => l.status === "Active") || null;

  const [amount, setAmount] = useState(activeLoan ? String(activeLoan.remainingBalance) : "");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!activeLoan) return;
    const numericAmount = Number(amount);
    if (!amount || numericAmount <= 0) {
      setError("Enter a valid amount to pay");
      return;
    }
    if (numericAmount > activeLoan.remainingBalance) {
      setError("Amount can't be more than the outstanding balance");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      // TODO: hand off to the real M-Pesa / bank payment flow once the API is ready
      await new Promise((resolve) => setTimeout(resolve, 800));
      makeRepayment(activeLoan.id, numericAmount);
      navigate("/transactions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sidebar = (
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
            className={`nav-link ${item.label === "Repayments" ? "active" : ""}`}
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
  );

  if (!activeLoan) {
    return (
      <div className="app-shell">
        {sidebar}
        <main className="main-content">
          <div className="page-container narrow">
            <div className="page-title-row">
              <Link to="/dashboard" className="back-btn">
                <ArrowLeft />
              </Link>
              <h2 className="page-title">Make a Repayment</h2>
            </div>
            <div className="empty-state">
              You have no outstanding loan to repay right now.{" "}
              <Link to="/apply-for-loan" className="text-link">
                Apply for a loan
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {sidebar}

      <main className="main-content">
        <div className="page-container narrow">
          <div className="page-title-row">
            <Link to="/my-loans" className="back-btn">
              <ArrowLeft />
            </Link>
            <h2 className="page-title">Make a Repayment</h2>
          </div>

          <div className="card">
            <div style={{ marginBottom: 24 }}>
              <p className="card-label">Outstanding Balance</p>
              <p className="card-value-lg accent" style={{ textAlign: "left" }}>
                KSh {activeLoan.remainingBalance.toLocaleString()}
              </p>
              <p className="card-sub">Loan #{activeLoan.id}</p>
            </div>

            <div className="form-field">
              <label htmlFor="amount">Amount to Pay</label>
              <input
                id="amount"
                type="number"
                min={1}
                max={activeLoan.remainingBalance}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError("");
                }}
                className="form-input"
              />
              {error && <p className="field-error">{error}</p>}
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: "#475569", marginBottom: 12 }}>Payment Method</p>
              <div className="payment-method-list">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`payment-method-option ${paymentMethod === method.id ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                    />
                    <method.icon />
                    <span style={{ fontSize: 14, color: "#1e293b" }}>{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="button" onClick={handleContinue} disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? "Processing..." : "Continue to Payment"}
            </button>
            <p className="helper-text">You will be redirected to complete your payment securely.</p>
          </div>
        </div>
      </main>
    </div>
  );
}