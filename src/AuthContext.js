import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  writeBatch,
  runTransaction,
} from "firebase/firestore";
import { auth, db } from "./firebase";

const DEFAULT_SETTINGS = {
  loanUpdates: true,
  paymentReminders: true,
  promotions: false,
};

const todayLabel = () =>
  new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function friendlyAuthError(err) {
  switch (err?.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try logging in.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/weak-password":
      return "Choose a stronger password (at least 8 characters).";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a bit and try again.";
    case "auth/network-request-failed":
      return "Network problem. Check your connection and try again.";
    case "permission-denied":
    case "firestore/permission-denied":
      return "You don't have permission to do that.";
    default:
      return err?.message || "Something went wrong. Please try again.";
  }
}

const noop = async () => {};
const defaultAuthValue = {
  authUser: null,
  authLoading: true,
  user: null,
  loans: [],
  transactions: [],
  settings: DEFAULT_SETTINGS,
  registerUser: noop,
  loginUser: noop,
  logoutUser: noop,
  resetPassword: noop,
  applyForLoan: noop,
  addTransaction: noop,
  makeRepayment: noop,
  updateUser: noop,
  updateProfilePicture: noop,
  updateSettings: noop,
};

const AuthContext = createContext(defaultAuthValue);

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loaded, setLoaded] = useState({ profile: false, loans: false, transactions: false });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  const uid = authUser?.uid || null;

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoans([]);
      setTransactions([]);
      setLoaded({ profile: false, loans: false, transactions: false });
      return undefined;
    }
    setLoaded({ profile: false, loans: false, transactions: false });

    const byNewest = (a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    const markLoaded = (key) => setLoaded((prev) => ({ ...prev, [key]: true }));

    const unsubProfile = onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        setProfile(snap.exists() ? snap.data() : null);
        markLoaded("profile");
      },
      (err) => {
        console.error("Profile listener:", err);
        markLoaded("profile");
      }
    );
    const unsubLoans = onSnapshot(
      collection(db, "users", uid, "loans"),
      (snap) => {
        setLoans(snap.docs.map((d) => ({ ...d.data(), id: d.id })).sort(byNewest));
        markLoaded("loans");
      },
      (err) => {
        console.error("Loans listener:", err);
        markLoaded("loans");
      }
    );
    const unsubTx = onSnapshot(
      collection(db, "users", uid, "transactions"),
      (snap) => {
        setTransactions(snap.docs.map((d) => ({ ...d.data(), id: d.id })).sort(byNewest));
        markLoaded("transactions");
      },
      (err) => {
        console.error("Transactions listener:", err);
        markLoaded("transactions");
      }
    );

    return () => {
      unsubProfile();
      unsubLoans();
      unsubTx();
    };
  }, [uid]);

  const authLoading =
    !authChecked || (!!uid && !(loaded.profile && loaded.loans && loaded.transactions));

  const user = authUser ? { uid: authUser.uid, ...(profile || {}), email: authUser.email } : null;
  const settings = { ...DEFAULT_SETTINGS, ...(profile?.settings || {}) };

  const registerUser = async ({ fullName, phone, email, idNumber, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        fullName: fullName.trim(),
        phone: phone.trim(),
        idNumber: idNumber.trim(),
        profilePicture: "",
        residentialAddress: "",
        settings: DEFAULT_SETTINGS,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      // Don't leave an auth account with no profile behind
      await cred.user.delete().catch(() => {});
      throw err;
    }
  };

  const loginUser = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password);
  const logoutUser = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim());

  const applyForLoan = async (loan) => {
    if (!uid) throw new Error("You need to be signed in.");
    const batch = writeBatch(db);
    const createdAt = new Date().toISOString();
    batch.set(doc(db, "users", uid, "loans", loan.id), { ...loan, createdAt });
    batch.set(doc(collection(db, "users", uid, "transactions")), {
      type: "Loans",
      direction: "in",
      title: "Loan Disbursement",
      reference: `Loan #${loan.id}`,
      date: todayLabel(),
      amount: loan.amount,
      status: "Successful",
      createdAt,
    });
    await batch.commit();
  };

  // Standalone transaction (e.g. the activation fee)
  const addTransaction = async (tx) => {
    if (!uid) throw new Error("You need to be signed in.");
    const { id, ...rest } = tx; // Firestore generates the id
    await setDoc(doc(collection(db, "users", uid, "transactions")), {
      ...rest,
      createdAt: new Date().toISOString(),
    });
  };

  const makeRepayment = async (loanId, amount) => {
    if (!uid) throw new Error("You need to be signed in.");
    const loanRef = doc(db, "users", uid, "loans", loanId);
    const txRef = doc(collection(db, "users", uid, "transactions"));
    await runTransaction(db, async (t) => {
      const snap = await t.get(loanRef);
      if (!snap.exists()) throw new Error("Loan not found.");
      const loan = snap.data();
      const remaining = Math.round((loan.remainingBalance - amount) * 100) / 100;
      if (remaining < 0) throw new Error("Amount is more than the outstanding balance.");
      const update = { remainingBalance: remaining };
      if (remaining === 0) {
        update.status = "Completed";
        update.paidOn = todayLabel();
      }
      t.update(loanRef, update);
      t.set(txRef, {
        type: "Repayments",
        direction: "out",
        title: "Loan Repayment",
        reference: `Loan #${loanId}`,
        date: todayLabel(),
        amount,
        status: "Successful",
        createdAt: new Date().toISOString(),
      });
    });
  };

  const updateUser = async (changes) => {
    if (!uid) throw new Error("You need to be signed in.");
    const { email, ...rest } = changes; // email belongs to Firebase Auth, not the profile doc
    const clean = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
    await setDoc(doc(db, "users", uid), clean, { merge: true });
  };

  const updateProfilePicture = (dataUrl) => updateUser({ profilePicture: dataUrl });

  const updateSettings = (changes) =>
    setDoc(doc(db, "users", uid), { settings: { ...settings, ...changes } }, { merge: true });

  const value = {
    authUser,
    authLoading,
    user,
    loans,
    transactions,
    settings,
    registerUser,
    loginUser,
    logoutUser,
    resetPassword,
    applyForLoan,
    addTransaction,
    makeRepayment,
    updateUser,
    updateProfilePicture,
    updateSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}