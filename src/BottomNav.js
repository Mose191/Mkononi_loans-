import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Banknote,
  ListChecks,
  RefreshCw,
  MoreHorizontal,
  ArrowLeftRight,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

export default function BottomNav({ onLogout }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const cls = ({ isActive }) => "bottom-nav-item" + (isActive ? " active" : "");

  return (
    <>
      <nav className="bottom-nav">
        <NavLink to="/dashboard" className={cls}><LayoutDashboard /> Home</NavLink>
        <NavLink to="/apply-for-loan" className={cls}><Banknote /> Apply</NavLink>
        <NavLink to="/my-loans" className={cls}><ListChecks /> Loans</NavLink>
        <NavLink to="/make-a-repayment" className={cls}><RefreshCw /> Repay</NavLink>
        <button className="bottom-nav-item" onClick={() => setMoreOpen(true)}>
          <MoreHorizontal /> More
        </button>
      </nav>

      {moreOpen && (
        <>
          <div className="more-backdrop" onClick={() => setMoreOpen(false)} />
          <div className="more-menu">
            <NavLink to="/transactions" onClick={() => setMoreOpen(false)}><ArrowLeftRight /> Transactions</NavLink>
            <NavLink to="/profile" onClick={() => setMoreOpen(false)}><User /> Profile</NavLink>
            <NavLink to="/settings" onClick={() => setMoreOpen(false)}><Settings /> Settings</NavLink>
            <NavLink to="/help" onClick={() => setMoreOpen(false)}><HelpCircle /> Help & Support</NavLink>
            <button onClick={onLogout}><LogOut /> Logout</button>
          </div>
        </>
      )}
    </>
  );
}