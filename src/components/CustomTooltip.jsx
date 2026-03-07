import { formatCurrency } from "../utils";

export default function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="glass" style={{ padding: "10px 14px", fontSize: 12, border: "1px solid var(--border)" }}>
        <div style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {formatCurrency(p.value)}
          </div>
        ))}
      </div>
    );
  }
  return null;
}
