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
  ArrowLeft,
  ChevronDown,
  Mail,
  Phone,
  MessageCircle,
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

const faqs = [
  {
    question: "How do I apply for a loan?",
    answer:
      "Go to Apply for Loan from the sidebar, choose an amount and repayment duration, confirm your personal details, then review and submit. Approved loans appear immediately under My Loans.",
  },
  {
    question: "What interest rate does Mkononi charge?",
    answer:
      "Loans currently carry an 8% interest rate plus a 2% processing fee, both calculated on the amount borrowed. You'll see the exact breakdown before you submit an application.",
  },
  {
    question: "How do I repay my loan?",
    answer:
      "Go to Repayments, enter the amount you want to pay, choose M-Pesa or Bank Transfer, and confirm. Your loan's remaining balance updates immediately, and it's marked Completed once fully paid.",
  },
  {
    question: "What happens if I miss my repayment date?",
    answer:
      "Missing a due date doesn't cancel your loan, but continuing to owe a balance past its due date may affect your available credit for future loans. Repay as soon as you can to keep your account in good standing.",
  },
  {
    question: "Can I update my personal details after signing up?",
    answer:
      "Yes — you can edit your details from the Personal Details step whenever you apply for a new loan, and changes are saved to your profile automatically.",
  },
  {
    question: "How do I add or change my profile photo?",
    answer: "Open My Profile and click directly on your avatar to choose a new photo from your device.",
  },
];

export default function HelpSupport() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFaqs = faqs.filter((faq) => faq.question.toLowerCase().includes(query.trim().toLowerCase()));

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
              className={`nav-link ${item.label === "Help & Support" ? "active" : ""}`}
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
            <h2 className="page-title">Help & Support</h2>
          </div>

          <div className="card">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-input"
              style={{ marginBottom: 8 }}
            />

            {filteredFaqs.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 14, padding: "16px 0" }}>
                No matching questions. Try a different search, or contact us below.
              </p>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={faq.question} className="faq-item">
                    <button
                      className={`faq-question ${isOpen ? "open" : ""}`}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                    >
                      {faq.question}
                      <ChevronDown />
                    </button>
                    {isOpen && <p className="faq-answer">{faq.answer}</p>}
                  </div>
                );
              })
            )}
          </div>

          <div className="card">
            <p className="settings-section-title" style={{ marginBottom: 12 }}>
              Still need help?
            </p>
            <div className="contact-row">
              <div className="contact-icon">
                <Mail />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#1e293b" }}>Email Support</p>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>officialmojez69@gmail.com</p>
              </div>
            </div>
            <div className="contact-row">
              <div className="contact-icon">
                <Phone />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#1e293b" }}>Call Us</p>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>+254-797-428-684 (toll-free, 8am–6pm)</p>
              </div>
            </div>
            <div className="contact-row">
              <div className="contact-icon">
                <MessageCircle />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#1e293b" }}>Live Chat</p>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                  Coming soon — will connect once support tooling is set up<br></br>More future developments will be added to the app, including a chatbot and a knowledge base for self-service support.Keep it locked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}