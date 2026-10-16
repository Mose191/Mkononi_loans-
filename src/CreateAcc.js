import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Phone, Mail, CreditCard, Lock } from "lucide-react";
import "./Auth.css";
import { useAuth, friendlyAuthError } from "./AuthContext";

export default function CreateAccount() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    idNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Enter your full name";
    if (!formData.phone.trim()) {
      newErrors.phone = "Enter your phone number";
    } else if (!/^0\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid phone number, e.g. 07XXXXXXXX";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Enter your email address";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }
    if (!formData.idNumber.trim()) newErrors.idNumber = "Enter your ID number";
    if (!formData.password) {
      newErrors.password = "Create a password";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    if (!agreedToTerms) newErrors.terms = "You need to agree to the Terms of Service to continue";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await registerUser({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        idNumber: formData.idNumber,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setErrors({ form: friendlyAuthError(err) });
    } finally {
      setIsSubmitting(false);
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
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Get access to simple, fast and transparent loans</p>

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {errors.form && <div className="auth-error-banner">{errors.form}</div>}

            <div className="auth-field">
              <label htmlFor="fullName">Full Name</label>
              <div className="auth-input-wrap">
                <User className="auth-input-icon" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="e.g. Moses Odhiambo"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              {errors.fullName && <p className="auth-field-error">{errors.fullName}</p>}
            </div>

            <div className="auth-field">
              <label htmlFor="phone">Phone Number</label>
              <div className="auth-input-wrap">
                <Phone className="auth-input-icon" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="07XXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && <p className="auth-field-error">{errors.phone}</p>}
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="auth-field-error">{errors.email}</p>}
            </div>

            <div className="auth-field">
              <label htmlFor="idNumber">ID Number</label>
              <div className="auth-input-wrap">
                <CreditCard className="auth-input-icon" />
                <input
                  id="idNumber"
                  name="idNumber"
                  type="text"
                  inputMode="numeric"
                  placeholder="National ID number"
                  value={formData.idNumber}
                  onChange={handleChange}
                />
              </div>
              {errors.idNumber && <p className="auth-field-error">{errors.idNumber}</p>}
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
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

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="has-toggle"
                />
                <button
                  type="button"
                  className="auth-toggle-visibility"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="auth-field-error">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label className="auth-terms-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
                  }}
                />
                <span>
                  I agree to Mkononi's{" "}
                  <Link to="/terms" className="auth-link">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="auth-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && <p className="auth-field-error">{errors.terms}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch-text">
            Already have an account?{" "}
            <Link to="/login" className="auth-switch-link">
              Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}