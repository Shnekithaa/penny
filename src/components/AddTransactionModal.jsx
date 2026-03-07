import { useState } from "react";
import { COLORS, CATEGORIES } from "../constants";

export default function AddTransactionModal({ onAdd, onClose, toast }) {
  const [form, setForm] = useState({ type: "expense", amount: "", category: "food", date: new Date().toISOString().split("T")[0], note: "" });
  const [loading, setLoading] = useState(false);
  const [popping, setPopping] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) {
      toast("Please enter a valid amount", "error"); return;
    }
    if (!form.date) { toast("Please select a date", "error"); return; }
    setLoading(true);
    try {
      await onAdd({ ...form, amount: parseFloat(form.amount) });
      setPopping(true);
      setTimeout(() => setPopping(false), 300);
      toast("Transaction added! 🎉", "success");
      onClose();
    } catch (err) {
      toast(err.message || "Failed to add transaction", "error");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      animation: "fadeIn 0.2s ease",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`glass noise ${popping ? "animate-pop" : ""}`} style={{
        width: "100%", maxWidth: 440, padding: 28,
        animation: "fadeUp 0.3s ease",
        boxShadow: "0 0 60px rgba(16,185,129,0.1), 0 20px 60px rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>Add Transaction</h3>
          <button onClick={onClose} className="btn-ghost" style={{ padding: "4px 10px" }}>✕</button>
        </div>

        <div className="toggle" style={{ marginBottom: 20 }}>
          {["expense", "income"].map(t => (
            <button key={t} className={`toggle-btn ${form.type === t ? "active" : ""}`}
              style={{ color: form.type === t ? (t === "income" ? COLORS.emerald : COLORS.rose) : COLORS.textMuted }}
              onClick={() => set("type", t)}>
              {t === "income" ? "💰 Income" : "💸 Expense"}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>Amount (₹)</label>
            <input className="penny-input" type="number" placeholder="0.00" value={form.amount}
              onChange={e => set("amount", e.target.value)} style={{ fontSize: 20, fontWeight: 600 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>Category</label>
              <select className="penny-input" value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.filter(c => form.type === "income" ? ["salary","freelance","investment","other"].includes(c.id) : !["salary","freelance"].includes(c.id)).map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>Date</label>
              <input className="penny-input" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>Note (optional)</label>
            <input className="penny-input" placeholder="What was this for?" value={form.note}
              onChange={e => set("note", e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
            {loading ? "Saving..." : "Add Transaction ✦"}
          </button>
        </div>
      </div>
    </div>
  );
}
