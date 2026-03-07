import { useState, useMemo } from "react";
import { COLORS, CATEGORIES } from "../constants";
import { formatCurrency } from "../utils";
import TransactionItem from "../components/TransactionItem";
import EmptyState from "../components/EmptyState";

export default function TransactionsPage({ transactions, loading, onDelete, onAdd }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const filtered = useMemo(() => {
    let result = transactions.filter(t => {
      if (filter !== "all" && t.type !== filter) return false;
      if (search && !t.note?.toLowerCase().includes(search.toLowerCase()) && !t.category.includes(search.toLowerCase())) return false;
      if (catFilter !== "all" && t.category !== catFilter) return false;
      if (dateFrom && new Date(t.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.date) > new Date(dateTo + "T23:59:59")) return false;
      if (minAmount && t.amount < Number(minAmount)) return false;
      if (maxAmount && t.amount > Number(maxAmount)) return false;
      return true;
    });
    result.sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });
    return result;
  }, [transactions, filter, search, sortBy, dateFrom, dateTo, minAmount, maxAmount, catFilter]);

  const activeFilterCount = [dateFrom, dateTo, minAmount, maxAmount, catFilter !== "all"].filter(Boolean).length;

  const clearFilters = () => { setDateFrom(""); setDateTo(""); setMinAmount(""); setMaxAmount(""); setCatFilter("all"); };

  const totalFiltered = filtered.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800 }}>Transactions</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input className="penny-input" placeholder="🔍 Search..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ width: 180 }} />
          <button className="btn-ghost" onClick={() => setShowFilters(!showFilters)}
            style={{ position: "relative" }}>
            🎛 Filters
            {activeFilterCount > 0 && (
              <span style={{
                position: "absolute", top: -5, right: -5, width: 18, height: 18, borderRadius: "50%",
                background: COLORS.emerald, color: "#fff", fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{activeFilterCount}</span>
            )}
          </button>
          <div className="toggle">
            {["all", "income", "expense"].map(f => (
              <button key={f} className={`toggle-btn ${filter === f ? "active" : ""}`}
                style={{ color: filter === f ? (f === "income" ? COLORS.emerald : f === "expense" ? COLORS.rose : "var(--text)") : "var(--text-muted)" }}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="glass noise" style={{ padding: 18, marginBottom: 16, animation: "fadeUp 0.25s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>From Date</label>
              <input type="date" className="penny-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>To Date</label>
              <input type="date" className="penny-input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>Min Amount (₹)</label>
              <input type="number" className="penny-input" placeholder="0" value={minAmount} onChange={e => setMinAmount(e.target.value)} style={{ fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>Max Amount (₹)</label>
              <input type="number" className="penny-input" placeholder="Any" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} style={{ fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>Category</label>
              <select className="penny-input" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ fontSize: 12 }}>
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <select className="penny-input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: "auto", fontSize: 12 }}>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
            {activeFilterCount > 0 && (
              <button className="btn-ghost" onClick={clearFilters} style={{ fontSize: 12, color: COLORS.rose }}>Clear all</button>
            )}
          </div>
        </div>
      )}

      {/* Summary bar */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, fontSize: 12, color: "var(--text-muted)" }}>
          <span>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
          <span style={{ fontWeight: 600, color: totalFiltered >= 0 ? COLORS.emerald : COLORS.rose }}>
            Net: {formatCurrency(totalFiltered)}
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "grid", gap: 8 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="glass" style={{ padding: "16px", display: "flex", gap: 12, alignItems: "center" }}>
              <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 13, width: "40%", marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 11, width: "25%" }} />
              </div>
              <div className="skeleton" style={{ height: 18, width: 70 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass" style={{ padding: 0 }}>
          <EmptyState onAction={onAdd} />
        </div>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {filtered.map((tx, i) => (
            <TransactionItem key={tx.id} tx={tx} onDelete={onDelete} idx={i} />
          ))}
        </div>
      )}
    </div>
  );
}
