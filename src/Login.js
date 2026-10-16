import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import "./Auth.css";
import { useAuth, friendlyAuthError } from "./AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { authUser, authLoading, loginUser, resetPassword } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authLoading && authUser) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Enter your email address";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) newErrors.email = "Enter a valid email address";
    if (!formData.password) newErrors.password = "Enter your password";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice("");
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await loginUser(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setErrors({ form: friendlyAuthError(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setNotice("");
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setErrors({ email: "Enter your email above first, then tap Forgot Password" });
      return;
    }
    try {
      await resetPassword(formData.email);
      setErrors({});
      setNotice("If an account exists for that email, a reset link has been sent.");
    } catch (err) {
      setErrors({ form: friendlyAuthError(err) });
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link to="/" className="auth-brand">
          <h1>Mkononi</h1>
          <p>Loan In Your Hands</p>
        </Link>
      </header>

      <main className="auth-main">
        <div className="auth-form-wrapper">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to continue your account</p>

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {errors.form && <div className="auth-error-banner">{errors.form}</div>}
            {notice && <div className="auth-error-banner" style={{ background: "#ecfdf5", color: "#047857" }}>{notice}</div>}

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="auth-field-error">{errors.email}</p>}
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="has-toggle"
                />
                <button
                  type="button"
                  className="auth-toggle-visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="auth-field-error">{errors.password}</p>}
            </div>

            <div className="auth-row-right">
              <button
                type="button"
                className="auth-link"
                onClick={handleForgotPassword}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="auth-switch-text">
            Don't have an account?{" "}
            <Link to="/create-account" className="auth-switch-link">
              Create Account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}