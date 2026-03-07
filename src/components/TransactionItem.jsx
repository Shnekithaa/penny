import { useState } from "react";
import { COLORS, CATEGORIES } from "../constants";
import { formatCurrency, formatDate } from "../utils";

export default function TransactionItem({ tx, onDelete, idx }) {
  const cat = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES[9];
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(tx.id);
  };

  return (
    <div className="glass tx-item" style={{
      padding: "12px 16px",
      display: "flex", alignItems: "center", gap: 12,
      opacity: deleting ? 0.4 : 1,
      transition: "all 0.25s ease",
      animation: `fadeUp 0.35s ease ${Math.min(idx * 0.04, 0.3)}s both`,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: `${cat.color}18`, border: `1px solid ${cat.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        transition: "transform 0.2s",
      }}>{cat.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.text, marginBottom: 2 }}>
          {tx.note || cat.label}
        </div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, display: "flex", gap: 8 }}>
          <span>{cat.label}</span>
          <span>·</span>
          <span>{formatDate(tx.date)}</span>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 600,
          color: tx.type === "income" ? COLORS.emerald : COLORS.rose,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          {tx.type === "income" ? "+" : "−"}{formatCurrency(tx.amount)}
        </div>
      </div>
      <button onClick={handleDelete} className="tx-delete-btn" style={{
        background: "none", border: "none", color: "var(--text-dim)",
        cursor: "pointer", fontSize: 14, padding: "4px 6px", borderRadius: 6,
        transition: "all 0.2s",
        flexShrink: 0,
      }}>✕</button>
    </div>
  );
}
