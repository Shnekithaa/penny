export default function ToastContainer({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} className="toast glass" style={{
          borderColor: t.type === "success" ? "rgba(16,185,129,0.3)" : t.type === "error" ? "rgba(244,63,94,0.3)" : "rgba(245,158,11,0.3)",
          color: "var(--text)",
        }}>
          <span style={{ fontSize: 16 }}>
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
