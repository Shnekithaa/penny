export default function EmptyState({ onAction }) {
  return (
    <div className="empty-state" style={{ textAlign: "center", padding: "48px 24px", animation: "fadeUp 0.5s ease" }}>
      <div className="empty-state-visual">
        <div className="empty-orb empty-orb-1" />
        <div className="empty-orb empty-orb-2" />
        <div style={{ fontSize: 52, position: "relative", zIndex: 1, animation: "float 3s ease-in-out infinite" }}>🌱</div>
      </div>
      <h3 className="font-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, color: "var(--text)", letterSpacing: "-0.02em" }}>
        Plant your first penny
      </h3>
      <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 320, margin: "0 auto 20px", lineHeight: 1.7 }}>
        Your financial garden is empty. Add your first transaction to unlock powerful insights, trends, and your health score.
      </p>
      {onAction && (
        <button className="btn-primary" onClick={onAction} style={{ padding: "10px 24px" }}>
          + Add Transaction
        </button>
      )}
    </div>
  );
}
