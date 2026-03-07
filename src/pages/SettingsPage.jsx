import { useState } from "react";
import { useTheme } from "../ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

export default function SettingsPage({ user, onSignOut, transactions }) {
  const { theme } = useTheme();
  const [exportMsg, setExportMsg] = useState("");

  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      setExportMsg("No transactions to export yet.");
      setTimeout(() => setExportMsg(""), 3000);
      return;
    }
    const headers = ["Date", "Type", "Category", "Amount (₹)", "Note"];
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.category,
      t.amount,
      `"${(t.note || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `penny-transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMsg(`Exported ${transactions.length} transactions successfully!`);
    setTimeout(() => setExportMsg(""), 4000);
  };

  const totalIncome = transactions?.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0) ?? 0;
  const totalExpense = transactions?.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0) ?? 0;
  const txCount = transactions?.length ?? 0;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : transactions?.length > 0
      ? new Date(Math.min(...transactions.map(t => new Date(t.date)))).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "—";

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Settings</h2>

      <div style={{ display: "grid", gap: 16, maxWidth: 600 }}>
        {/* Profile */}
        <div className="glass noise" style={{ padding: 24 }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Profile</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, #14b8a6, #38bdf8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, fontWeight: 700, color: "white",
                boxShadow: "0 4px 20px rgba(20,184,166,0.3)",
              }}>
                {user?.displayName?.[0]?.toUpperCase() || "A"}
              </div>
              {!user?.isDemo && (
                <span style={{
                  position: "absolute", bottom: 2, right: 2,
                  width: 12, height: 12, borderRadius: "50%",
                  background: "#22c55e", border: "2px solid var(--surface-1)",
                }} />
              )}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>{user?.displayName || "Demo User"}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{user?.email || "demo@penny.app"}</div>
              {user?.isDemo && (
                <span style={{
                  display: "inline-block", marginTop: 6, padding: "2px 10px", borderRadius: 20,
                  background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
                  fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.04em",
                }}>DEMO MODE</span>
              )}
            </div>
          </div>

          {/* Account stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "Transactions", value: txCount },
              { label: "Account type", value: user?.isDemo ? "Demo" : "Google" },
              { label: "Since", value: memberSince },
            ].map(({ label, value }) => (
              <div key={label} style={{
                textAlign: "center", padding: "12px 8px", borderRadius: 10,
                background: "var(--surface-1)", border: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{value}</div>
                <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div className="glass noise" style={{ padding: 24 }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Appearance</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Theme</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                Currently using {theme} mode
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Preferences */}
        <div className="glass noise" style={{ padding: 24 }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Preferences</h3>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Currency</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Display currency for amounts</div>
              </div>
              <div style={{
                padding: "6px 14px", borderRadius: 8,
                background: "var(--surface-1)", border: "1px solid var(--border)",
                fontSize: 13, fontWeight: 600, color: "var(--text)",
              }}>₹ INR</div>
            </div>
            <div style={{ height: 1, background: "var(--border)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Date Format</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>How dates are displayed</div>
              </div>
              <div style={{
                padding: "6px 14px", borderRadius: 8,
                background: "var(--surface-1)", border: "1px solid var(--border)",
                fontSize: 13, color: "var(--text)",
              }}>DD/MM/YYYY</div>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="glass noise" style={{ padding: 24 }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Data Management</h3>
          <div style={{ display: "grid", gap: 10 }}>
            <button className="btn-ghost" style={{ justifyContent: "flex-start", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px" }}
              onClick={handleExport}>
              <span>📤</span> Export transactions as CSV
            </button>
            {exportMsg && <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "4px 14px" }}>{exportMsg}</div>}
          </div>
        </div>

        {/* Account Actions */}
        <div className="glass noise" style={{ padding: 24 }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Account</h3>
          <button onClick={onSignOut} style={{
            width: "100%", padding: "11px 16px", borderRadius: 10,
            background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)",
            color: "#f43f5e", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span>↩</span> Sign Out
          </button>
        </div>

        {/* About */}
        <div className="glass noise" style={{ padding: 24 }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>About Penny</h3>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
            <p>Penny is a calm, beautiful personal finance tracker built with React & Firebase.</p>
            <p style={{ marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span>Version <strong style={{ color: "var(--text)" }}>2.0.0</strong></span>
              <span>Made with 💚</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
