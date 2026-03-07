import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { COLORS } from "./constants";
import { pennyAuth } from "./services";
import { auth, isConfigured } from "./firebase";
import { useTransactions } from "./hooks/useTransactions";
import { useAnalytics } from "./hooks/useAnalytics";
import { useToast } from "./hooks/useToast";
import ToastContainer from "./components/ToastContainer";
import AddTransactionModal from "./components/AddTransactionModal";
import ThemeToggle from "./components/ThemeToggle";
import PennyBot from "./components/PennyBot";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import TransactionsPage from "./pages/TransactionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("loading");
  const [appTab, setAppTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { toasts, toast } = useToast();
  const { transactions, loading, addTransaction, deleteTransaction } = useTransactions(user);
  const analytics = useAnalytics(transactions);

  // Auth persistence: restore session on reload
  useEffect(() => {
    // Check for demo user in sessionStorage
    const demoData = sessionStorage.getItem("penny_demo_user");
    if (demoData) {
      try {
        setUser(JSON.parse(demoData));
        setPage("app");
      } catch {
        sessionStorage.removeItem("penny_demo_user");
      }
    }

    // Firebase auth state listener for real users
    if (isConfigured && auth) {
      const unsub = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            createdAt: firebaseUser.metadata.creationTime,
            isDemo: false,
          });
          setPage("app");
        } else if (!demoData) {
          setPage("landing");
        }
      });
      return unsub;
    } else if (!demoData) {
      setPage("landing");
    }
  }, []);

  const handleAuth = (u) => {
    setUser(u);
    setPage("app");
  };

  const handleSignOut = async () => {
    await pennyAuth.signOut();
    sessionStorage.removeItem("penny_demo_user");
    setUser(null);
    setPage("landing");
  };

  const handleAdd = async (tx) => {
    await addTransaction(tx);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "◈" },
    { id: "transactions", label: "Transactions", icon: "↕" },
    { id: "analytics", label: "Analytics", icon: "◎" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} />

      {page === "loading" && (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
          <div className="font-display gradient-text" style={{ fontSize: 28, fontWeight: 800, animation: "fadeIn 0.4s ease" }}>penny</div>
        </div>
      )}

      {page === "landing" && <LandingPage onGetStarted={() => setPage("auth")} />}

      {page === "auth" && <AuthPage onAuth={handleAuth} toast={toast} />}

      {page === "app" && (
        <div style={{ display: "flex", minHeight: "100vh" }}>
          {/* Sidebar */}
          <div className="sidebar glass" style={{
            width: 220, padding: "24px 16px", display: "flex", flexDirection: "column",
            position: "fixed", top: 0, bottom: 0, left: 0,
            background: "var(--glass-nav)", borderRight: "1px solid var(--border)",
            borderRadius: 0, zIndex: 100,
            animation: "fadeIn 0.4s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, paddingLeft: 12, paddingRight: 4 }}>
              <div className="font-display" style={{ fontSize: 20, fontWeight: 800 }}>
                <span className="gradient-text">penny</span>
              </div>
              <ThemeToggle />
            </div>

            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              {navItems.map(item => (
                <button key={item.id}
                  className={`nav-item ${appTab === item.id ? "active" : ""}`}
                  onClick={() => setAppTab(item.id)}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 8, marginBottom: 4 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "linear-gradient(135deg, #14b8a6, #38bdf8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "white",
                    border: "2px solid rgba(20,184,166,0.4)",
                  }}>
                    {user?.displayName?.[0]?.toUpperCase() || "A"}
                  </div>
                  {!user?.isDemo && (
                    <span style={{
                      position: "absolute", bottom: 0, right: 0,
                      width: 9, height: 9, borderRadius: "50%",
                      background: "#22c55e", border: "2px solid var(--bg)",
                    }} />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>{user?.displayName}</div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>{user?.isDemo ? "Demo account" : user?.email}</div>
                  {user?.isDemo && (
                    <div style={{ fontSize: 9, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.04em", marginTop: 1 }}>DEMO MODE</div>
                  )}
                </div>
              </div>
              <button className="nav-item" onClick={handleSignOut} style={{ color: "var(--text-dim)" }}>
                <span>↩</span> Sign out
              </button>
            </div>
          </div>

          {/* Main content */}
          <div style={{ marginLeft: 220, flex: 1, padding: "28px 28px 28px 28px", maxWidth: "calc(100vw - 220px)" }} className="main-layout">
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              {/* Header */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 24, animation: "fadeUp 0.4s ease",
              }}>
                <div>
                  <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }}>
                    {appTab === "dashboard" ? `Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${user?.displayName?.split(" ")[0]} ✦` : navItems.find(n => n.id === appTab)?.label}
                  </h1>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                    {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                </div>
                {appTab !== "settings" && (
                  <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>+</span> Add Transaction
                  </button>
                )}
              </div>

              {/* Page content */}
              {appTab === "dashboard" && <Dashboard transactions={transactions} loading={loading} analytics={analytics} onAdd={() => setShowModal(true)} />}
              {appTab === "transactions" && <TransactionsPage transactions={transactions} loading={loading} onDelete={deleteTransaction} onAdd={() => setShowModal(true)} />}
              {appTab === "analytics" && <AnalyticsPage analytics={analytics} />}
              {appTab === "settings" && <SettingsPage user={user} onSignOut={handleSignOut} transactions={transactions} />}
            </div>
          </div>

          {/* PennyBot */}
          <PennyBot transactions={transactions} />
        </div>
      )}

      {showModal && (
        <AddTransactionModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
          toast={toast}
        />
      )}
    </>
  );
}
