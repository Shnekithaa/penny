import { COLORS } from "../constants";

export default function StatCard({ label, value, sub, color, icon, delay = 0 }) {
  return (
    <div className="glass noise" style={{
      padding: "20px 22px", position: "relative", overflow: "hidden",
      animation: `fadeUp 0.5s ease ${delay}s both`,
      boxShadow: `0 0 30px ${color}15, 0 4px 20px rgba(0,0,0,0.3)`,
    }}>
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.02em" }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          border: `1px solid ${color}25`,
        }}>{icon}</div>
      </div>
    </div>
  );
}
