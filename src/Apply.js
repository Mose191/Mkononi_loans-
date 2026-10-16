import { useState, useMemo, useEffect } from "react";
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
  Phone,
  Mail,
  CreditCard,
  Check,
  Lock,
} from "lucide-react";
import "./AppShell.css";
import { useAuth } from "./AuthContext";
import { auth } from "./firebase";

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

const durations = [
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "30 Days", value: 30 },
  { label: "60 Days", value: 60 },
];

const steps = [
  { step: 1, label: "Activate" },
  { step: 2, label: "Loan Amount" },
  { step: 3, label: "Personal Details" },
  { step: 4, label: "Review & Submit" },
];

const ACTIVATION_FEE = 100;
const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 50000;
const INTEREST_RATE = 0.08;
const PROCESSING_FEE_RATE = 0.02;

export default function ApplyForLoan() {
  const navigate = useNavigate();
  const { user, applyForLoan, updateUser, logoutUser } = useAuth();

  // The account's activation status comes from the user's profile
  const activated = !!user?.activated;

  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || "");
  const [checkoutId, setCheckoutId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [amount, setAmount] = useState(15000);
  const [duration, setDuration] = useState(30);

  const [personalDetails, setPersonalDetails] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    email: user?.email || "",
    idNumber: user?.idNumber || "",
  });
  const [personalErrors, setPersonalErrors] = useState({});

  // The profile now loads from Firebase, so fill the form once it arrives
  // (only fields the person hasn't typed into yet).
  useEffect(() => {
    if (!user) return;
    setPersonalDetails((prev) => ({
      fullName: prev.fullName || user.fullName || "",
      phone: prev.phone || user.phone || "",
      email: prev.email || user.email || "",
      idNumber: prev.idNumber || user.idNumber || "",
    }));
  }, [user]);

  // Once the account is active, move past the Activate step automatically
  useEffect(() => {
    if (activated) {
      setMaxStepReached((prev) => Math.max(prev, 2));
      setCurrentStep((prev) => (prev === 1 ? 2 : prev));
    }
  }, [activated]);

  const { interest, processingFee, totalRepayment, repaymentDate } = useMemo(() => {
    const interestAmount = Math.round(amount * INTEREST_RATE);
    const feeAmount = Math.round(amount * PROCESSING_FEE_RATE);
    const date = new Date();
    date.setDate(date.getDate() + duration);
    return {
      interest: interestAmount,
      processingFee: feeAmount,
      totalRepayment: amount + interestAmount + feeAmount,
      repaymentDate: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
  }, [amount, duration]);

  const durationLabel = durations.find((d) => d.value === duration)?.label || `${duration} Days`;

  // Steps 2 to 4 are locked until the account is activated
  const goToStep = (step) => {
    if (step > 1 && !activated) return;
    if (step <= maxStepReached) setCurrentStep(step);
  };

  const advanceTo = (step) => {
    if (step > 1 && !activated) return;
    setCurrentStep(step);
    setMaxStepReached((prev) => Math.max(prev, step));
  };

  const authHeaders = async () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
  });

  // Asks our server to send the M-Pesa PIN prompt to the phone.
  // The server decides the amount and marks the account activated only after M-Pesa confirms payment.
  const handleActivate = async () => {
    setPayError("");
    if (!/^(?:\+?254|0)?[17]\d{8}$/.test(mpesaPhone.replace(/[\s-]/g, ""))) {
      setPayError("Enter a valid Safaricom number, e.g. 0712345678");
      return;
    }
    setIsPaying(true);
    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ phone: mpesaPhone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't start the payment. Please try again.");
      setCheckoutId(data.checkoutRequestId); // starts the progress check below
    } catch (err) {
      setPayError(err.message || "Couldn't start the payment. Please try again.");
      setIsPaying(false);
    }
  };

  // While waiting for the PIN, check progress every 5 seconds (up to ~2 minutes).
  // When payment succeeds the server flips `activated` on the profile and the effect above moves to step 2.
  useEffect(() => {
    if (!checkoutId || activated) return undefined;
    let tries = 0;
    const stop = (message) => {
      setCheckoutId("");
      setIsPaying(false);
      if (message) setPayError(message);
    };
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const res = await fetch(`/api/mpesa/status?id=${encodeURIComponent(checkoutId)}`, {
          headers: await authHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (data.status === "failed" || data.status === "review") {
          clearInterval(timer);
          stop(data.message || "The payment wasn't completed.");
          return;
        }
        if (data.status === "success") {
          clearInterval(timer);
          stop("");
          return;
        }
      } catch (err) {
        // network hiccup: try again on the next tick
      }
      if (tries >= 24) {
        clearInterval(timer);
        stop("We haven't received confirmation yet. If money was deducted, your account will activate automatically.");
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [checkoutId, activated]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalDetails((prev) => ({ ...prev, [name]: value }));
    if (personalErrors[name]) setPersonalErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validatePersonalDetails = () => {
    const newErrors = {};
    if (!personalDetails.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!/^0\d{9}$/.test(personalDetails.phone.trim())) newErrors.phone = "Enter a valid phone number";
    if (!/^\S+@\S+\.\S+$/.test(personalDetails.email.trim())) newErrors.email = "Enter a valid email";
    if (!personalDetails.idNumber.trim()) newErrors.idNumber = "ID number is required";
    setPersonalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitApplication = async () => {
    if (!activated) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Save any edits made on the Personal Details step back to the user's profile
      await updateUser(personalDetails);

      const id = `LN-${Math.floor(10000 + Math.random() * 89999)}`;
      const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

      // Saves the loan AND its disbursement transaction together
      await applyForLoan({
        id,
        status: "Active",
        amount,
        interestRate: INTEREST_RATE * 100,
        interest,
        processingFee,
        totalRepayment,
        remainingBalance: totalRepayment,
        amountDisbursed: today,
        dueDate: repaymentDate,
      });

      navigate("/my-loans");
    } catch (err) {
      setSubmitError("Couldn't submit your application. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
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
              className={`nav-link ${item.label === "Apply for Loan" ? "active" : ""}`}
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
        <div className="page-container narrow apply-wide">
          <div className="page-title-row">
            <Link to="/dashboard" className="back-btn">
              <ArrowLeft />
            </Link>
            <h2 className="page-title">Apply for Loan</h2>
          </div>

          {/* Stepper: steps 2 to 4 are locked until the account is activated.
              Reached steps are clickable so people can go back and adjust things. */}
          <div className="stepper">
            {steps.map((item, index) => {
              const isActive = item.step === currentStep;
              const isDone = item.step === 1 ? activated : item.step < currentStep;
              const isLocked = item.step > 1 && !activated;
              const isClickable = !isLocked && item.step <= maxStepReached;

              return (
                <div key={item.step} className="stepper-item">
                  <div
                    className="stepper-item-content"
                    onClick={() => goToStep(item.step)}
                    style={{ cursor: isClickable ? "pointer" : "default" }}
                    title={isLocked ? "Activate your account to unlock this step" : undefined}
                  >
                    <div
                      className={`stepper-circle ${isActive ? "active" : ""} ${isDone ? "done" : ""} ${
                        isLocked ? "locked" : ""
                      }`}
                    >
                      {isDone ? <Check size={14} /> : item.step}
                    </div>
                    <span className={`stepper-label ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}>
                      {item.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && <div className="stepper-connector" />}
                </div>
              );
            })}
          </div>

          {/* Step 1: Activate Account */}
          {currentStep === 1 && (
            <div className="card" style={{ textAlign: "center" }}>
              <div className={`activate-icon ${activated ? "done" : ""}`}>
                {activated ? <Check /> : <Lock />}
              </div>
              <h3 className="activate-title">{activated ? "Account activated" : "Activate your account"}</h3>
              <p className="activate-text">
                {activated
                  ? "Your account is active. You can now apply for a loan."
                  : `Pay a one-time activation fee of KSh ${ACTIVATION_FEE} to unlock loan applications.`}
              </p>

              {!activated && (
                <>
                  <div className="summary-list" style={{ textAlign: "left", marginBottom: 24 }}>
                    <div className="summary-row">
                      <span className="info-row-label">Activation Fee</span>
                      <span className="info-row-value">KSh {ACTIVATION_FEE}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total to Pay</span>
                      <span className="info-row-value">KSh {ACTIVATION_FEE}</span>
                    </div>
                  </div>

                  <div className="form-field" style={{ textAlign: "left" }}>
                    <label htmlFor="mpesaPhone">M-Pesa Number</label>
                    <input
                      id="mpesaPhone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="0712345678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      disabled={isPaying}
                      className="form-input"
                    />
                  </div>

                  {payError && (
                    <p className="field-error" style={{ marginBottom: 12 }}>
                      {payError}
                    </p>
                  )}

                  <button type="button" onClick={handleActivate} disabled={isPaying} className="btn-primary">
                    {checkoutId ? "Waiting for payment..." : isPaying ? "Sending prompt..." : `Pay KSh ${ACTIVATION_FEE} with M-Pesa`}
                  </button>
                  <p className="helper-text">
                    {checkoutId
                      ? "Check your phone and enter your M-Pesa PIN. This page updates automatically."
                      : "You'll get an M-Pesa prompt on your phone. This is a one-time fee."}
                  </p>
                </>
              )}

              {activated && (
                <button type="button" onClick={() => advanceTo(2)} className="btn-primary">
                  Continue
                </button>
              )}
            </div>
          )}

          {/* Step 2: Loan Amount */}
          {currentStep === 2 && (
            <div className="card">
              <div className="slider-wrap" style={{ marginBottom: 32 }}>
                <p style={{ margin: "0 0 16px", fontWeight: 500, color: "#1e293b" }}>How much do you need?</p>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: 20, color: "#1d4ed8" }}>KSh</span>
                  <input
                    type="number"
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                    step={500}
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAmount(value === "" ? "" : Number(value));
                    }}
                    onBlur={() => {
                      const clamped = Math.min(Math.max(Number(amount) || MIN_AMOUNT, MIN_AMOUNT), MAX_AMOUNT);
                      setAmount(clamped);
                    }}
                    className="form-input"
                    style={{
                      textAlign: "center",
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#1d4ed8",
                      maxWidth: 220,
                    }}
                  />
                </div>

                <input
                  type="range"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step={500}
                  value={amount || MIN_AMOUNT}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <div className="slider-range-labels">
                  <span>KSh {MIN_AMOUNT.toLocaleString()}</span>
                  <span>KSh {MAX_AMOUNT.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <p style={{ margin: "0 0 12px", fontWeight: 500, color: "#1e293b" }}>Select Loan Duration</p>
                <div className="duration-grid">
                  {durations.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDuration(d.value)}
                      className={`duration-btn ${duration === d.value ? "active" : ""}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="summary-list">
                <div className="summary-row">
                  <span className="info-row-label">Loan Amount</span>
                  <span className="info-row-value">KSh {amount.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span className="info-row-label">Interest (8%)</span>
                  <span className="info-row-value">KSh {interest.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span className="info-row-label">Processing Fee</span>
                  <span className="info-row-value">KSh {processingFee.toLocaleString()}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Repayment</span>
                  <span className="info-row-value">KSh {totalRepayment.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span className="info-row-label">Repayment Date</span>
                  <span className="info-row-value">{repaymentDate}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => advanceTo(3)}
                className="btn-primary"
                style={{ marginTop: 24 }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Personal Details */}
          {currentStep === 3 && (
            <div className="card">
              <p style={{ margin: "0 0 20px", fontWeight: 500, color: "#1e293b" }}>
                Confirm your details before we process your loan
              </p>

              <div className="form-field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={personalDetails.fullName}
                  onChange={handlePersonalChange}
                  className="form-input"
                />
                {personalErrors.fullName && <p className="field-error">{personalErrors.fullName}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="phone">
                  <Phone size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={personalDetails.phone}
                  onChange={handlePersonalChange}
                  className="form-input"
                />
                {personalErrors.phone && <p className="field-error">{personalErrors.phone}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="email">
                  <Mail size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={personalDetails.email}
                  onChange={handlePersonalChange}
                  className="form-input"
                  readOnly
                />
                {personalErrors.email && <p className="field-error">{personalErrors.email}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="idNumber">
                  <CreditCard size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  ID Number
                </label>
                <input
                  id="idNumber"
                  name="idNumber"
                  type="text"
                  value={personalDetails.idNumber}
                  onChange={handlePersonalChange}
                  className="form-input"
                />
                {personalErrors.idNumber && <p className="field-error">{personalErrors.idNumber}</p>}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setCurrentStep(2)} className="btn-outline">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => validatePersonalDetails() && advanceTo(4)}
                  className="btn-primary"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="card">
              <p style={{ margin: "0 0 16px", fontWeight: 600, color: "#1e293b" }}>Loan Summary</p>
              <div className="summary-list" style={{ marginBottom: 28 }}>
                <div className="summary-row">
                  <span className="info-row-label">Loan Amount</span>
                  <span className="info-row-value">KSh {amount.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span className="info-row-label">Duration</span>
                  <span className="info-row-value">{durationLabel}</span>
                </div>
                <div className="summary-row">
                  <span className="info-row-label">Interest (8%)</span>
                  <span className="info-row-value">KSh {interest.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span className="info-row-label">Processing Fee</span>
                  <span className="info-row-value">KSh {processingFee.toLocaleString()}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Repayment</span>
                  <span className="info-row-value">KSh {totalRepayment.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span className="info-row-label">Repayment Date</span>
                  <span className="info-row-value">{repaymentDate}</span>
                </div>
              </div>

              <p style={{ margin: "0 0 16px", fontWeight: 600, color: "#1e293b" }}>Personal Details</p>
              <div className="info-list" style={{ marginBottom: 28 }}>
                <div className="info-row">
                  <span className="info-row-label">Full Name</span>
                  <span className="info-row-value">{personalDetails.fullName}</span>
                </div>
                <div className="info-row">
                  <span className="info-row-label">Phone Number</span>
                  <span className="info-row-value">{personalDetails.phone}</span>
                </div>
                <div className="info-row">
                  <span className="info-row-label">Email Address</span>
                  <span className="info-row-value">{personalDetails.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-row-label">ID Number</span>
                  <span className="info-row-value">{personalDetails.idNumber}</span>
                </div>
              </div>

              {submitError && (
                <p className="field-error" style={{ marginBottom: 12 }}>
                  {submitError}
                </p>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" onClick={() => setCurrentStep(3)} className="btn-outline">
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}