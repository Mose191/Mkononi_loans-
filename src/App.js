import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./Auth.css";
import "./AppShell.css";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Homepage from "./Homepage";
import Login from "./Login";
import CreateAccount from "./CreateAcc";
import ApplyForLoan from "./Apply";
import MyLoans from "./Myloans";
import MakeARepayment from "./Repayment";
import Transactions from "./Transactions";
import Dashboard from "./Dashboard";
import MyProfile from "./Profile";
import LoanDetails from "./Loandetails";
import Settings from "./settings";
import HelpSupport from "./help";

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/dashboard" element={guard(<Dashboard />)} />
          <Route path="/apply-for-loan" element={guard(<ApplyForLoan />)} />
          <Route path="/my-loans" element={guard(<MyLoans />)} />
          <Route path="/make-a-repayment" element={guard(<MakeARepayment />)} />
          <Route path="/transactions" element={guard(<Transactions />)} />
          <Route path="/profile" element={guard(<MyProfile />)} />
          <Route path="/loan-details/:loanId" element={guard(<LoanDetails />)} />
          <Route path="/settings" element={guard(<Settings />)} />
          <Route path="/help" element={guard(<HelpSupport />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}