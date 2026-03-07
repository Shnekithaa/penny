export default function SkeletonCard() {
  return (
    <div className="glass" style={{ padding: 20 }}>
      <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 32, width: "60%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: "30%" }} />
    </div>
  );
}
