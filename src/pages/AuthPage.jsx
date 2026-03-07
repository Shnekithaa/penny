import { useState } from "react";
import { pennyAuth } from "../services";
import { isConfigured } from "../firebase";

export default function AuthPage({ onAuth, toast }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    if (!isConfigured) {
      setError("Firebase is not configured. Add your credentials to .env file, or use the demo account below.");
      toast("Firebase not configured — use demo account", "error");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await pennyAuth.signInGoogle();
      toast(`Welcome, ${user.displayName}! 🎉`, "success");
      onAuth(user);
    } catch (err) {
      const msg = err.code === "auth/popup-closed-by-user" ? "Sign-in cancelled"
        : err.code === "auth/popup-blocked" ? "Popup was blocked — please allow popups for this site"
        : err.code === "auth/cancelled-popup-request" ? "Sign-in cancelled"
        : err.message || "Google sign-in failed";
      setError(msg);
      toast(msg, "error");
    }
    setLoading(false);
  };

  const handleDemo = () => {
    const user = pennyAuth.signInDemo();
    toast("Welcome to demo mode! Explore freely ✦", "success");
    onAuth(user);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, position: "relative",
    }}>
      <div className="hero-bg" />
      <div style={{ position: "absolute", top: "20%", left: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)", animation: "float 6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "15%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(244,63,94,0.05) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite 2s" }} />

      <div className="glass noise" style={{
        width: "100%", maxWidth: 420, padding: 40, position: "relative",
        animation: "fadeUp 0.5s ease",
        boxShadow: "0 0 60px rgba(20,184,166,0.08), 0 20px 60px var(--shadow-xl)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="font-display" style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>
            <span className="gradient-text">penny</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
            Track your finances with clarity
          </p>
        </div>

        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: 10, marginBottom: 16,
            background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)",
            color: "var(--rose)", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Real Google Auth */}
        <button onClick={handleGoogle} disabled={loading} className="google-btn" style={{
          width: "100%", padding: "13px 16px", borderRadius: 12, marginBottom: 12,
          background: "var(--surface-1)", border: "1px solid var(--border)",
          color: "var(--text)", fontFamily: "inherit", fontSize: 15, fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.2s",
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.51 10.52A4.8 4.8 0 0 1 4.26 9c0-.52.09-1.03.25-1.52V5.41H1.83A8 8 0 0 0 .98 9c0 1.29.31 2.51.85 3.59l2.68-2.07z"/>
            <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 .98 9l2.85 2.07c.63-1.89 2.4-3.29 4.47-3.29.94 0 1.75.33 2.4.86l-.15-.14 2.13-2.12C11.41 4.07 10.26 3.58 8.98 3.58z"/>
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-dim)", margin: "4px 0 12px" }}>
          Sign in with your Google account
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--text-dim)", whiteSpace: "nowrap" }}>or want to explore first?</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Demo Account */}
        <button onClick={handleDemo} disabled={loading} style={{
          width: "100%", padding: "12px 16px", borderRadius: 12,
          background: "transparent", border: "1px dashed var(--border)",
          color: "var(--text-muted)", fontFamily: "inherit", fontSize: 14, fontWeight: 500,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          🧪 Use Demo Account
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
          No sign-up needed — explore with sample data
        </p>
      </div>
    </div>
  );
}
