import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import BottomNav from "./BottomNav";

export default function ProtectedRoute({ children }) {
  const { authUser, authLoading, signOut } = useAuth();

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
        Loading…
      </div>
    );
  }

  if (!authUser) return <Navigate to="/login" replace />;

  return (
    <>
      {children}
      <BottomNav onLogout={signOut} />
    </>
  );
}